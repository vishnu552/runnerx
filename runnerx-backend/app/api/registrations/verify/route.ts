import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendRegistrationSuccessEmail,
  sendParticipantConfirmationEmail,
  sendNewParticipantWelcomeEmail,
} from "@/lib/mail";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
      return NextResponse.json(
        { success: false, message: "Missing required verification parameters" },
        { status: 400 }
      );
    }

    // 1. Verify the Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured");

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 2. Fetch existing registration to get totals
    const existingReg = await prisma.registration.findUnique({
      where: { id: Number(registrationId) },
      include: { lineItems: true }
    });

    if (!existingReg) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }

    // 3. Update registration + all line items to CONFIRMED in a transaction
    const finalReg = await prisma.$transaction(async (tx) => {
      let orderUserId = existingReg.userId;
      const primaryLi = existingReg.lineItems.find((li: any) => li.isRegistrant) || existingReg.lineItems[0];
      
      // Ensure we have a userId for the Order
      if (!orderUserId && primaryLi) {
        let u = await tx.user.findUnique({ where: { email: primaryLi.participantEmail } });
        if (!u) {
          const dobPassword = "runnerx2026";
          const hashedPassword = await bcrypt.hash(dobPassword, 10);
          u = await tx.user.create({
            data: {
              name: primaryLi.participantName,
              email: primaryLi.participantEmail,
              password: hashedPassword,
              phone: primaryLi.participantPhone,
              emailVerified: true
            }
          });
        }
        orderUserId = u.id;
      }

      // Create unified Order
      const newOrder = await tx.order.create({
        data: {
          userId: orderUserId!,
          orderType: "REGISTRATION",
          reason: "Event Registration",
          amount: existingReg.totalAmount,
          couponDiscount: existingReg.discountAmount,
          finalAmount: existingReg.finalAmount,
          couponCode: existingReg.couponCode,
          paymentStatus: "PAID",
          paymentId: razorpay_payment_id,
          paymentMode: "ONLINE",
          contactEmail: primaryLi?.participantEmail || "",
          contactPhone: primaryLi?.participantPhone || "",
        }
      });

      const reg = await tx.registration.update({
        where: { id: Number(registrationId) },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentId: razorpay_payment_id,
          orderId: newOrder.id,
          userId: orderUserId, // Update registration with the user ID if it was missing
        },
        include: {
          lineItems: true,
        },
      });

      await tx.registrationLineItem.updateMany({
        where: { registrationId: reg.id },
        data: { status: "CONFIRMED" },
      });

      return reg;
    });

    // 3. Send per-participant emails (grouped by email to avoid duplicates)
    const participantsByEmail: Record<string, any[]> = {};
    for (const item of finalReg.lineItems) {
      if (!participantsByEmail[item.participantEmail]) {
        participantsByEmail[item.participantEmail] = [];
      }
      participantsByEmail[item.participantEmail].push(item);
    }

    for (const [email, items] of Object.entries(participantsByEmail)) {
      try {
        const firstItem = items[0];
        const categories = items.map(i => i.categoryNameSnapshot).join(", ");
        const totalAmount = items.reduce((sum, i) => sum + i.finalPriceSnapshot, 0);
        const regIds = items.map(i => i.uniqueRegId ?? `#${i.id}`).join(", ");

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          // ── Existing user: send confirmation
          await sendParticipantConfirmationEmail(
            email,
            firstItem.participantName,
            finalReg.eventTitleSnapshot,
            regIds,
            finalReg.eventDateSnapshot.toDateString(),
            categories,
            totalAmount
          );
        } else {
          // ── New participant: auto-create RunnerX account
          const dob = firstItem.participantDob;
          const dobPassword = [
            dob.getFullYear(),
            String(dob.getMonth() + 1).padStart(2, "0"),
            String(dob.getDate()).padStart(2, "0"),
          ].join("");

          try {
            const hashedPassword = await bcrypt.hash(dobPassword, 10);
            await prisma.user.create({
              data: {
                name: firstItem.participantName,
                email: email,
                password: hashedPassword,
                phone: firstItem.participantPhone,
                gender: firstItem.participantGender,
                dateOfBirth: firstItem.participantDob,
                city: firstItem.participantCity,
                state: firstItem.participantState,
                pinCode: firstItem.participantPinCode,
                address: firstItem.participantAddress,
                emailVerified: true,
                role: "USER",
              },
            });
          } catch (createErr) {
            console.error(`Failed to create account for ${email}:`, createErr);
          }

          await sendNewParticipantWelcomeEmail(
            email,
            firstItem.participantName,
            dobPassword,
            finalReg.eventTitleSnapshot,
            regIds,
            finalReg.eventDateSnapshot.toDateString(),
            categories,
            totalAmount
          );
        }
      } catch (emailErr) {
        console.error(`Failed to process post-payment for ${email}:`, emailErr);
      }
    }

    // 4. Send order summary to the primary registrant (isRegistrant = true or first item)
    try {
      const primaryParticipant =
        finalReg.lineItems.find((p) => p.isRegistrant) || finalReg.lineItems[0];
      if (primaryParticipant) {
        await sendRegistrationSuccessEmail(
          primaryParticipant.participantEmail,
          primaryParticipant.participantName,
          finalReg.eventTitleSnapshot,
          finalReg.id.toString(),
          finalReg.eventDateSnapshot.toDateString()
        );
      }
    } catch (mailError) {
      console.error("Failed to send order summary email:", mailError);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
