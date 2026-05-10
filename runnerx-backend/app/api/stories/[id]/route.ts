import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/stories/[id] — admin: full details of a single story
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const storyId = parseInt(id, 10);
    if (isNaN(storyId)) {
      return NextResponse.json({ success: false, message: "Invalid story ID" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!story) {
      return NextResponse.json({ success: false, message: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, story }, { status: 200 });
  } catch (error) {
    console.error("Get story detail error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
