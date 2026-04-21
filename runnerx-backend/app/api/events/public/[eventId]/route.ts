import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ eventId: string }> };

// GET /api/events/public/:eventId — public event detail with mapped categories
// Used by the registration page to load event-specific pricing + category content.
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { eventId: rawId } = await context.params;
    const eventId = Number(rawId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { distance: "asc" },
          include: {
            category: {
              select: {
                id: true,
                slug: true,
                name: true,
                distanceLabel: true,
                icon: true,
                heroImage: true,
                tagline: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Don't expose unpublished events publicly
    if (event.status !== "PUBLISHED" || !event.isActive) {
      return NextResponse.json(
        { success: false, message: "Event not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error("Get public event error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
