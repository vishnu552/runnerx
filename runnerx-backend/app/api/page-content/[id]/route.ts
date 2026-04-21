import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT /api/page-content/[id] — update a single content block
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

    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();

    const existing = await prisma.pageContent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Content not found" },
        { status: 404 }
      );
    }

    const content = await prisma.pageContent.update({
      where: { id },
      data: {
        value: body.value ?? existing.value,
        type: body.type ?? existing.type,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    console.error("Update page content error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/page-content/[id] — delete a single content block
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

    const { id: rawId } = await params;
    const id = Number(rawId);

    const existing = await prisma.pageContent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Content not found" },
        { status: 404 }
      );
    }

    await prisma.pageContent.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: "Content deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete page content error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
