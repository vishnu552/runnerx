import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createCouponSchema = z.object({
  siteFor: z.string().default("ALL"),
  code: z.string().min(1, "Code is required").max(50).toUpperCase(),
  description: z.string().min(1, "Description is required").max(200),
  discountType: z.enum(["PERCENTAGE", "FLAT"]).default("PERCENTAGE"),
  discountValue: z.number().positive("Discount must be positive"),
  minOrderValue: z.number().min(0).optional().default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
});

// GET /api/coupons — list all coupons
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // "active" | "inactive" | null
    const siteFor = searchParams.get("siteFor");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;
    if (siteFor) where.siteFor = siteFor;

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons }, { status: 200 });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/coupons — create a coupon
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createCouponSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        siteFor: data.siteFor,
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue ?? 0,
        maxDiscount: data.maxDiscount ?? null,
        usageLimit: data.usageLimit ?? null,
        isActive: data.isActive ?? true,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
