import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/info-sections — PUBLIC: fetch sections by siteFor + pageType
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");
    const pageType = searchParams.get("pageType");

    if (!siteFor || !pageType) {
      return NextResponse.json(
        { success: false, message: "siteFor and pageType are required" },
        { status: 400 }
      );
    }

    const sections = await prisma.infoSection.findMany({
      where: {
        siteFor,
        pageType: pageType.toUpperCase(),
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, sections }, { status: 200 });
  } catch (error) {
    console.error("Get info sections error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/info-sections — ADMIN: create a new section
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
    const { siteFor, pageType, heading, content, sortOrder, isActive } = body;

    if (!siteFor || !pageType || !heading || !content) {
      return NextResponse.json(
        { success: false, message: "siteFor, pageType, heading and content are required" },
        { status: 400 }
      );
    }

    const section = await prisma.infoSection.create({
      data: {
        siteFor,
        pageType: pageType.toUpperCase(),
        heading,
        content,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, section }, { status: 201 });
  } catch (error) {
    console.error("Create info section error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
