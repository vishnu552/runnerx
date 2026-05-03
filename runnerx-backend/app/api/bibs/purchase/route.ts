import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { lineItemId, bibNumber, eventId } = await req.json();

    if (!lineItemId || !bibNumber || !eventId) {
      return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
    }

    // Double check availability
    const existingBib = await prisma.registrationLineItem.findFirst({
      where: {
        bibNumber,
        registration: {
          eventId: Number(eventId),
          status: { not: "CANCELLED" }
        }
      }
    });

    if (existingBib) {
      return NextResponse.json({ success: false, message: "Bib is already taken" }, { status: 400 });
    }

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: 100 * 100, // 100 INR
      currency: "INR",
      receipt: `bib_${lineItemId}`,
      notes: { type: "BIB_UPGRADE", lineItemId: String(lineItemId), bibNumber, eventId: String(eventId) }
    });

    return NextResponse.json({ success: true, razorpayOrder });
  } catch (error) {
    console.error("Purchase Bib Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
