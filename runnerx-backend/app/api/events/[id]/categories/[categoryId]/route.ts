import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateEventCategorySchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string; categoryId: string }> };

// PATCH /api/events/:id/categories/:categoryId — update a category
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId, categoryId: rawCatId } = await context.params;
    const id = Number(rawId);
    const categoryId = Number(rawCatId);

    // Verify event & category exist
    const existing = await prisma.eventCategory.findFirst({
      where: { id: categoryId, eventId: id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateEventCategorySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    // If race type is being changed, check for duplicates
    if (data.raceType && data.raceType !== existing.raceType) {
      const duplicate = await prisma.eventCategory.findUnique({
        where: { eventId_raceType: { eventId: id, raceType: data.raceType } },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: `Race type ${data.raceType} already exists for this event` },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;

    const category = await prisma.eventCategory.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/events/:id/categories/:categoryId — delete a category
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId, categoryId: rawCatId } = await context.params;
    const id = Number(rawId);
    const categoryId = Number(rawCatId);

    const existing = await prisma.eventCategory.findFirst({
      where: { id: categoryId, eventId: id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    await prisma.eventCategory.delete({ where: { id: categoryId } });

    return NextResponse.json({ success: true, message: "Category deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
