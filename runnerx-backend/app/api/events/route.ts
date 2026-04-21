import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations";

// GET /api/events — list all events
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // DRAFT, PUBLISHED, CANCELLED, COMPLETED
    const city = searchParams.get("city");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: "insensitive" };

    const events = await prisma.event.findMany({
      where,
      include: { categories: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/events — create an event
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createEventSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    // Check for duplicate slug
    const existing = await prisma.event.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Event slug already exists" }, { status: 409 });
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        siteFor: data.siteFor,
        description: data.description,
        date: new Date(data.date),
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        venue: data.venue,
        address: data.address,
        city: data.city,
        state: data.state,
        mapUrl: data.mapUrl ?? null,
        bannerImage: data.bannerImage ?? null,
        contactEmail: data.contactEmail ?? null,
        contactPhone: data.contactPhone ?? null,
        status: data.status,
        isActive: data.isActive ?? true,
      },
      include: { categories: true },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
