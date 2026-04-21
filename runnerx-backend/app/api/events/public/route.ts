import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/public — list all public events for a specific site
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor");
    const activeOnly = searchParams.get("active") !== "false";
    const status = searchParams.get("status") || "PUBLISHED";

    const where: Record<string, any> = {};
    if (siteFor) where.siteFor = siteFor;
    if (activeOnly) where.isActive = true;
    if (status) where.status = status;

    const events = await prisma.event.findMany({
      where,
      include: { categories: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (error) {
    console.error("Get public events error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
