import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createEventCategorySchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/events/:id/categories — list categories for an event
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const categories = await prisma.eventCategory.findMany({
      where: { eventId: id },
      orderBy: { distance: "asc" },
    });

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/events/:id/categories — add a category to an event
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = createEventCategorySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    // Check for duplicate race type for this event
    const existing = await prisma.eventCategory.findUnique({
      where: { eventId_raceType: { eventId: id, raceType: data.raceType } },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Race type ${data.raceType} already exists for this event` },
        { status: 409 }
      );
    }

    const category = await prisma.eventCategory.create({
      data: {
        eventId: id,
        raceType: data.raceType,
        distance: data.distance,
        price: data.price,
        discountPrice: data.discountPrice ?? null,
        startTime: new Date(data.startTime),
        maxParticipants: data.maxParticipants ?? null,
        ageMin: data.ageMin ?? null,
        ageMax: data.ageMax ?? null,
        isActive: data.isActive ?? true,
        categoryId: data.categoryId || null,
        virtualSettings: data.virtualSettings || null,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
