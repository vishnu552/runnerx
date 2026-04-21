import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationData } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !donationData) {
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

    // 2. Create donation record now that payment is verified
    const donation = await prisma.donation.create({
      data: {
        userId: Number(session.userId),
        causeName: donationData.causeName,
        ngoName: donationData.ngoName || "RunnerX General Fund",
        amount: Number(donationData.amount),
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail,
        donorPhone: donationData.donorPhone || null,
        panCardName: donationData.panCardName || null,
        panCardNumber: donationData.panCardNumber || null,
        wantsTaxExemption: donationData.wantsTaxExemption || false,
        paymentStatus: "PAID",
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
    });

    return NextResponse.json({ success: true, message: "Donation verified and processed successfully" });
  } catch (error) {
    console.error("Donation verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
