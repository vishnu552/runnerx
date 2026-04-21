import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

// GET /api/auth/stories — get stories for the logged-in user
export async function GET(request: Request) {
  try {
    let session = await getSession();
    if (!session) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        session = verifyToken(token);
      }
    }

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
    let session = await getSession();
    if (!session) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        session = verifyToken(token);
      }
    }

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, socialMediaUrl, title, content } = body;

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
