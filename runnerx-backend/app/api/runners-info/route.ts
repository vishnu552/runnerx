import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createRunnersInfoSchema } from "@/lib/validations";

// GET /api/runners-info — list items (optionally filter by siteFor)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");

    const where: any = { isActive: true };
    if (siteFor) where.siteFor = siteFor;

    const items = await prisma.runnersInfo.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Get runners-info error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/runners-info — create an item
export async function POST(request: Request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createRunnersInfoSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;

    const item = await prisma.runnersInfo.create({
      data: {
        siteFor: data.siteFor,
        title: data.title,
        image: data.image,
        link: data.link ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Create runners-info error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
