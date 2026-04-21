import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationSuccessEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
      return NextResponse.json(
        { success: false, message: "Missing required verification parameters" },
        { status: 400 }
      );
    }

    // 1. Verify the signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Razorpay secret not configured");
    }

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

    // 2. Update registration status in a transaction
    const finalReg = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.update({
        where: { id: Number(registrationId) },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentId: razorpay_payment_id,
        },
        include: {
          lineItems: true,
        }
      });

      // Update all line items to CONFIRMED
      await tx.registrationLineItem.updateMany({
        where: { registrationId: reg.id },
        data: { status: "CONFIRMED" },
      });

      return reg;
    });

    // Send confirmation email
    try {
      const primaryParticipant = finalReg.lineItems.find(p => p.isRegistrant) || finalReg.lineItems[0];
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
      console.error("Failed to send registration success email:", mailError);
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
