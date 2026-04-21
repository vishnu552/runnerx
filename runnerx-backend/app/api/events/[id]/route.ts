import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateEventSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/events/:id — get single event with categories
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { distance: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/events/:id — update an event
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    // Check event exists
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateEventSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    // If slug is being updated, check for duplicates
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.event.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return NextResponse.json({ success: false, message: "Event slug already exists" }, { status: 409 });
      }
    }

    // Build update data explicitly
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.siteFor !== undefined) updateData.siteFor = data.siteFor;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.registrationStart !== undefined) updateData.registrationStart = new Date(data.registrationStart);
    if (data.registrationEnd !== undefined) updateData.registrationEnd = new Date(data.registrationEnd);
    if (data.venue !== undefined) updateData.venue = data.venue;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.mapUrl !== undefined) updateData.mapUrl = data.mapUrl ?? null;
    if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage ?? null;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail ?? null;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { categories: true },
    });

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/events/:id — soft-delete an event
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, event, message: "Event deactivated" }, { status: 200 });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
