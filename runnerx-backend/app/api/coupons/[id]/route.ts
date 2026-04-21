import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateCouponSchema = z.object({
  siteFor: z.string().optional(),
  code: z.string().min(1).max(50).toUpperCase().optional(),
  description: z.string().min(1).max(200).optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/coupons/[id] — get one coupon
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    console.error("Get coupon error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/coupons/[id] — update coupon
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateCouponSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    // Check for duplicate code if code is being changed
    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (duplicate) {
        return NextResponse.json({ success: false, message: "Coupon code already exists" }, { status: 409 });
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.siteFor !== undefined && { siteFor: data.siteFor }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.minOrderValue !== undefined && { minOrderValue: data.minOrderValue }),
        ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.validFrom !== undefined && { validFrom: new Date(data.validFrom) }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil ? new Date(data.validUntil) : null }),
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/coupons/[id] — delete coupon
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Coupon deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/coupons/[id] — toggle status
export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    console.error("Toggle status error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
