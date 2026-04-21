import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT /api/info-sections/[id] — ADMIN: update a section
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { heading, content, sortOrder, isActive } = body;

    const section = await prisma.infoSection.update({
      where: { id: Number(id) },
      data: {
        ...(heading !== undefined && { heading }),
        ...(content !== undefined && { content }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, section }, { status: 200 });
  } catch (error) {
    console.error("Update info section error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/info-sections/[id] — ADMIN: delete a section
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.infoSection.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete info section error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/info-sections/[id] — ADMIN: get all sections (including inactive) for admin listing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // If `id` is "all", return all for admin (requires auth)
    const { id } = await params;

    if (id === "all") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(request.url);
      const siteFor = searchParams.get("siteFor");
      const pageType = searchParams.get("pageType");

      const where: Record<string, unknown> = {};
      if (siteFor) where.siteFor = siteFor;
      if (pageType) where.pageType = pageType.toUpperCase();

      const sections = await prisma.infoSection.findMany({
        where,
        orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }],
      });

      return NextResponse.json({ success: true, sections }, { status: 200 });
    }

    // Single item
    const section = await prisma.infoSection.findUnique({
      where: { id: Number(id) },
    });

    if (!section) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, section }, { status: 200 });
  } catch (error) {
    console.error("Get info section error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
