import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/public/active?siteFor=KTA
// Returns the single active PUBLISHED event for a site, with categories
// joined to their template Category (name, slug, tabs, hero content).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");

    if (!siteFor) {
      return NextResponse.json(
        { success: false, message: "siteFor is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        siteFor,
        status: "PUBLISHED",
        isActive: true,
      },
      orderBy: { date: "asc" },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { distance: "asc" },
          include: {
            category: {
              include: {
                tabs: {
                  where: { isActive: true },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "No active event found for this site" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error("Get active event error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
