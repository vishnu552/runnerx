import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, lineItemId, bibNumber } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret missing");

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
       return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const li = await prisma.registrationLineItem.findUnique({
      where: { id: Number(lineItemId) },
      include: { registration: true }
    });

    if (!li) return NextResponse.json({ success: false, message: "Line item not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // update bib
      await tx.registrationLineItem.update({
        where: { id: Number(lineItemId) },
        data: { 
          bibNumber, 
          isCustomBib: true, 
          isProfileUpdated: true 
        }
      });

      // create order
      await tx.order.create({
        data: {
          userId: li.registration.userId!,
          orderType: "BIB_UPGRADE",
          reason: `VIP/Custom Bib Purchase (#${bibNumber})`,
          amount: 100,
          finalAmount: 100,
          paymentStatus: "PAID",
          paymentId: razorpay_payment_id,
          paymentMode: "ONLINE",
          contactEmail: li.participantEmail,
          contactPhone: li.participantPhone,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify Bib Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
