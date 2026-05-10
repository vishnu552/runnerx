import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendParticipantConfirmationEmail,
  sendNewParticipantWelcomeEmail,
} from "@/lib/mail";
import { assignNextBib } from "@/lib/bibs";
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
          // Generate a random 6-digit password for the new user
          const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);
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
          razorpayOrderId: razorpay_order_id,
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

      // Assign bibs in deterministic order. Custom bibs and already-assigned
      // bibs are left untouched; idempotent under retry.
      const items = await tx.registrationLineItem.findMany({
        where: { registrationId: reg.id },
        orderBy: { id: "asc" },
        select: { id: true, bibNumber: true, isCustomBib: true, raceTypeSnapshot: true },
      });

      for (const li of items) {
        const needsBib = !li.bibNumber && !li.isCustomBib;
        const bib = needsBib
          ? await assignNextBib(tx, existingReg.eventId, li.raceTypeSnapshot)
          : null;
        await tx.registrationLineItem.update({
          where: { id: li.id },
          data: {
            status: "CONFIRMED",
            ...(bib ? { bibNumber: bib } : {}),
          },
        });
      }

      return tx.registration.findUnique({
        where: { id: reg.id },
        include: { lineItems: true },
      });
    });

    if (!finalReg) {
      return NextResponse.json(
        { success: false, message: "Failed to load updated registration" },
        { status: 500 }
      );
    }

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
          const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();

          try {
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
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
            generatedPassword,
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



    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
