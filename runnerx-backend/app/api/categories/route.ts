import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCategorySchema = z.object({
  siteFor: z.string().min(1, "siteFor is required"),
  slug: z.string().min(1, "Slug is required").max(100),
  name: z.string().min(1, "Name is required").max(200),
  distanceLabel: z.string().min(1, "Distance label is required").max(50),
  icon: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  discountPrice: z.number().min(0).optional().nullable(),
  raceDate: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// GET /api/categories — PUBLIC: list categories by siteFor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");
    const activeOnly = searchParams.get("active") !== "false";

    if (!siteFor) {
      return NextResponse.json(
        { success: false, message: "siteFor is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { siteFor };
    if (activeOnly) where.isActive = true;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        tabs: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/categories — ADMIN: create a category
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = createCategorySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = result.data;

    const existing = await prisma.category.findUnique({
      where: { siteFor_slug: { siteFor: data.siteFor, slug: data.slug } },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category slug already exists for this site" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        siteFor: data.siteFor,
        slug: data.slug,
        name: data.name,
        distanceLabel: data.distanceLabel,
        icon: data.icon ?? null,
        price: data.price ?? null,
        discountPrice: data.discountPrice ?? null,
        raceDate: data.raceDate ? new Date(data.raceDate) : null,
        heroImage: data.heroImage ?? null,
        tagline: data.tagline ?? null,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getServerSession() {
  const { getSession } = await import("@/lib/auth");
  return getSession();
}
