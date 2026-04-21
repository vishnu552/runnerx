import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCouponSchema } from "@/lib/validations";

// POST /api/coupons/validate — public: validate a coupon code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateCouponSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { code, siteFor, amount } = result.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: "Coupon is not active" },
        { status: 400 }
      );
    }

    // Check site
    if (coupon.siteFor !== "ALL" && coupon.siteFor !== siteFor) {
      return NextResponse.json(
        { success: false, message: "Coupon not valid for this site" },
        { status: 400 }
      );
    }

    // Check expiry
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json(
        { success: false, message: "Coupon is not yet valid" },
        { status: 400 }
      );
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json(
        { success: false, message: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.minOrderValue && amount < coupon.minOrderValue) {
      return NextResponse.json(
        { success: false, message: `Minimum order value ₹${coupon.minOrderValue} required` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, amount);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round((amount - discountAmount) * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
