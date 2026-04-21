import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateCategorySchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  distanceLabel: z.string().min(1).max(50).optional(),
  icon: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  discountPrice: z.number().min(0).optional().nullable(),
  raceDate: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

type Params = Promise<{ slug: string }>;

// GET /api/categories/[slug] — PUBLIC: get single category + tabs
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor") || "KTA";

    const category = await prisma.category.findUnique({
      where: { siteFor_slug: { siteFor, slug } },
      include: {
        tabs: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[slug] — ADMIN: update category
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor") || "KTA";

    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = result.data;

    if (data.slug && data.slug !== slug) {
      const existing = await prisma.category.findUnique({
        where: { siteFor_slug: { siteFor, slug: data.slug } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Category slug already exists for this site" },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { siteFor_slug: { siteFor, slug } },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.distanceLabel !== undefined && { distanceLabel: data.distanceLabel }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.discountPrice !== undefined && { discountPrice: data.discountPrice }),
        ...(data.raceDate !== undefined && { raceDate: data.raceDate ? new Date(data.raceDate) : null }),
        ...(data.heroImage !== undefined && { heroImage: data.heroImage }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[slug] — ADMIN: delete category
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor") || "KTA";

    await prisma.category.delete({
      where: { siteFor_slug: { siteFor, slug } },
    });

    return NextResponse.json(
      { success: true, message: "Category deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
