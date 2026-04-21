import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateSponsorSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/sponsors/:id
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    const sponsor = await prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) {
      return NextResponse.json({ success: false, message: "Sponsor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sponsor }, { status: 200 });
  } catch (error) {
    console.error("Get sponsor error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/sponsors/:id
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    const existing = await prisma.sponsor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Sponsor not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateSponsorSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
    }

    const data = result.data;
    const updateData: Record<string, unknown> = {};
    if (data.siteFor !== undefined) updateData.siteFor = data.siteFor;
    if (data.title !== undefined) updateData.title = data.title ?? null;
    if (data.image !== undefined) updateData.image = data.image;

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, sponsor }, { status: 200 });
  } catch (error) {
    console.error("Update sponsor error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/sponsors/:id
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    const existing = await prisma.sponsor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Sponsor not found" }, { status: 404 });
    }

    await prisma.sponsor.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Sponsor deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete sponsor error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
