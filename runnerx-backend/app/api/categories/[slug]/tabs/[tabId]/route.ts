import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type Params = Promise<{ slug: string; tabId: string }>;

const updateTabSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// PUT /api/categories/[slug]/tabs/[tabId] — ADMIN: update a tab
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tabId: rawTabId } = await params;
    const tabId = Number(rawTabId);

    const body = await request.json();
    const result = updateTabSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = result.data;

    const tab = await prisma.categoryTab.update({
      where: { id: tabId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ success: true, tab }, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Tab not found" },
        { status: 404 }
      );
    }
    console.error("Update tab error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[slug]/tabs/[tabId] — ADMIN: delete a tab
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tabId: rawTabId } = await params;
    const tabId = Number(rawTabId);

    await prisma.categoryTab.delete({
      where: { id: tabId },
    });

    return NextResponse.json(
      { success: true, message: "Tab deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Tab not found" },
        { status: 404 }
      );
    }
    console.error("Delete tab error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
