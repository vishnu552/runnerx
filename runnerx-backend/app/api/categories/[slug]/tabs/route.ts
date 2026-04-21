import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type Params = Promise<{ slug: string }>;

const createTabSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required"),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// GET /api/categories/[slug]/tabs — PUBLIC: list all tabs for a category
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

    return NextResponse.json(
      { success: true, tabs: category.tabs },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get category tabs error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/categories/[slug]/tabs — ADMIN: create a new tab
export async function POST(
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

    const category = await prisma.category.findUnique({
      where: { siteFor_slug: { siteFor, slug } },
    });
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = createTabSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = result.data;

    const tab = await prisma.categoryTab.create({
      data: {
        categoryId: category.id,
        title: data.title,
        body: data.body,
        icon: data.icon ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, tab }, { status: 201 });
  } catch (error) {
    console.error("Create category tab error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
