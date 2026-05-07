import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteFor = searchParams.get("siteFor") || "KTA";

    // Fetch everything in parallel on the backend
    const [
      pageContent,
      categories,
      events,
      sponsors,
      runnersInfo
    ] = await Promise.all([
      // 1. Get all page content for both 'home' and 'global'
      prisma.pageContent.findMany({
        where: { 
          siteFor, 
          page: { in: ["home", "global"] },
          isActive: true 
        },
        orderBy: { sortOrder: "asc" }
      }),
      // 2. Get categories
      prisma.category.findMany({
        where: { siteFor, isActive: true },
        include: { tabs: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { order: "asc" }
      }),
      // 3. Get all public events (or just active one? the frontend gets all and finds nearest)
      prisma.event.findMany({
        where: { siteFor, isActive: true, status: "PUBLISHED" },
        orderBy: { date: "asc" }
      }),
      // 4. Get sponsors
      prisma.sponsor.findMany({
        where: { siteFor },
        orderBy: { createdAt: "desc" }
      }),
      // 5. Get runners info (expanding cards)
      prisma.runnersInfo.findMany({
        where: { siteFor, isActive: true },
        orderBy: { sortOrder: "asc" }
      })
    ]);

    // Group page content by page -> section -> key
    const groupedContent: any = {};
    pageContent.forEach(item => {
      if (!groupedContent[item.page]) groupedContent[item.page] = {};
      if (!groupedContent[item.page][item.section]) groupedContent[item.page][item.section] = {};
      
      let val = item.value;
      if (item.type === "JSON") {
        try { val = JSON.parse(val); } catch (e) {}
      }
      groupedContent[item.page][item.section][item.key] = val;
    });

    return NextResponse.json({
      success: true,
      data: {
        homeContent: groupedContent["home"] || {},
        globalContent: groupedContent["global"] || {},
        categories: categories.map(cat => ({
          ...cat,
          distance: cat.distanceLabel, // match frontend mapping
        })),
        events,
        sponsors,
        runnersInfo
      }
    });
  } catch (error) {
    console.error("Home bundle API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
