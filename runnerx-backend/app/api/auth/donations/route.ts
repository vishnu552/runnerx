import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

// GET /api/auth/donations — get donations for the logged-in user
export async function GET(request: Request) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const donations = await prisma.donation.findMany({
      where: { userId: Number(session.userId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, donations }, { status: 200 });
  } catch (error) {
    console.error("User donations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/auth/donations — create a standalone donation
export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    console.log("session",session);
    if (!session) {
// ...
// (rest of the check)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      causeName, ngoName, amount, donorName, donorEmail,
      donorPhone, panCardName, panCardNumber, wantsTaxExemption,
    } = body;

    if (!causeName || !amount || !donorName || !donorEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required donation fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Donation amount must be greater than zero" },
        { status: 400 }
      );
    }

    // Create Razorpay order without creating a DB entry yet
    let razorpayOrder = null;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100), // paise
        currency: "INR",
        receipt: `don_intent_${Date.now()}`,
        notes: {
          donorName,
          causeName,
        },
      });
    } catch (rzpError) {
      console.error("Razorpay order creation for donation failed:", rzpError);
      return NextResponse.json(
        { success: false, message: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, razorpayOrder }, { status: 200 });
  } catch (error) {
    console.error("Create donation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
