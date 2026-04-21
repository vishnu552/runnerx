import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bulkUpsertPageContentSchema } from "@/lib/validations";

// POST /api/page-content/bulk — ADMIN: bulk upsert content blocks
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = bulkUpsertPageContentSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { items } = result.data;

    // Use a transaction for atomicity
    const results = await prisma.$transaction(
      items.map((item) =>
        prisma.pageContent.upsert({
          where: {
            siteFor_page_section_key: {
              siteFor: item.siteFor,
              page: item.page,
              section: item.section,
              key: item.key,
            },
          },
          update: {
            value: item.value,
            type: item.type,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          },
          create: {
            siteFor: item.siteFor,
            page: item.page,
            section: item.section,
            key: item.key,
            value: item.value,
            type: item.type,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        })
      )
    );

    return NextResponse.json(
      { success: true, count: results.length, message: `${results.length} content blocks upserted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk upsert page content error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
