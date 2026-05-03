import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

// GET /api/auth/stories — get stories for the logged-in user
export async function GET(request: Request) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const stories = await prisma.story.findMany({
      where: { userId: Number(session.userId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, stories }, { status: 200 });
  } catch (error) {
    console.error("User stories error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/auth/stories — create a new story
export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, socialMediaUrl, title, content, imageUrls } = body;

    if (!name || !email || !content) {
      return NextResponse.json(
        { success: false, message: "Name, email and story content are required" },
        { status: 400 }
      );
    }

    const story = await prisma.story.create({
      data: {
        userId: Number(session.userId),
        name,
        email,
        phone: phone || null,
        socialMediaUrl: socialMediaUrl || null,
        title: title || null,
        content,
        imageUrls: imageUrls || null,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch (error) {
    console.error("Create story error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/auth/stories — update an existing story
export async function PUT(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, title, content, imageUrls, socialMediaUrl } = body;

    if (!id || !content) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const existingStory = await prisma.story.findUnique({
      where: { id: Number(id) }
    });

    if (!existingStory || existingStory.userId !== Number(session.userId)) {
      return NextResponse.json({ success: false, message: "Story not found or unauthorized" }, { status: 404 });
    }

    const updatedStory = await prisma.story.update({
      where: { id: Number(id) },
      data: {
        title: title || null,
        content,
        imageUrls: imageUrls || null,
        socialMediaUrl: socialMediaUrl || null,
        status: "SUBMITTED", // Reset status to submitted for re-review
      }
    });

    return NextResponse.json({ success: true, story: updatedStory });
  } catch (error) {
    console.error("Update story error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/auth/stories — delete a story
export async function DELETE(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    // Verify ownership
    const existingStory = await prisma.story.findUnique({
      where: { id: Number(id) }
    });

    if (!existingStory || existingStory.userId !== Number(session.userId)) {
      return NextResponse.json({ success: false, message: "Story not found or unauthorized" }, { status: 404 });
    }

    await prisma.story.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error("Delete story error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

