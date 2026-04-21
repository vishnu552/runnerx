import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { upsertPageContentSchema } from "@/lib/validations";

// GET /api/page-content — PUBLIC: fetch content by siteFor + page
// siteFor is REQUIRED
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");
    const page = searchParams.get("page");

    if (!siteFor) {
      return NextResponse.json(
        { success: false, message: "siteFor is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { siteFor, isActive: true };
    if (page) where.page = page;

    const content = await prisma.pageContent.findMany({
      where,
      orderBy: [{ page: "asc" }, { section: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    console.error("Get page content error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/page-content — ADMIN: upsert a single content block
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = upsertPageContentSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = result.data;

    const content = await prisma.pageContent.upsert({
      where: {
        siteFor_page_section_key: {
          siteFor: data.siteFor,
          page: data.page,
          section: data.section,
          key: data.key,
        },
      },
      update: {
        value: data.value,
        type: data.type,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      create: {
        siteFor: data.siteFor,
        page: data.page,
        section: data.section,
        key: data.key,
        value: data.value,
        type: data.type,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    console.error("Upsert page content error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
