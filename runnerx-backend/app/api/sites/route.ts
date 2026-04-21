import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sites — list all sites (public, for select boxes)
export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, sites }, { status: 200 });
  } catch (error) {
    console.error("Get sites error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
