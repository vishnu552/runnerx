import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createSponsorSchema } from "@/lib/validations";

// GET /api/sponsors — list all sponsors (optionally filter by siteFor)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");

    const where: Record<string, unknown> = {};
    if (siteFor) where.siteFor = siteFor;

    const sponsors = await prisma.sponsor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, sponsors }, { status: 200 });
  } catch (error) {
    console.error("Get sponsors error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/sponsors — create a sponsor
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createSponsorSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    const sponsor = await prisma.sponsor.create({
      data: {
        siteFor: data.siteFor,
        title: data.title ?? null,
        image: data.image,
      },
    });

    return NextResponse.json({ success: true, sponsor }, { status: 201 });
  } catch (error) {
    console.error("Create sponsor error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
