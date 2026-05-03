import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { updateRunnersInfoSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/runners-info/[id] — update an item
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = parseInt(rawId);
    
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = updateRunnersInfoSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    const item = await prisma.runnersInfo.update({
      where: { id },
      data: {
        siteFor: data.siteFor,
        title: data.title,
        image: data.image,
        link: data.link,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 200 });
  } catch (error) {
    console.error("Update runners-info error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/runners-info/[id] — delete an item
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = parseInt(rawId);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    await prisma.runnersInfo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete runners-info error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
