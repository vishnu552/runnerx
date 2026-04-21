import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

// GET /api/auth/registrations — get registrations for the logged-in user
export async function GET(request: Request) {
  try {
    let session = await getSession();

    // If no cookie session, check Authorization header
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

    // Get the user's email for participant matching
    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find registrations where the user is:
    // 1. The submitter (userId), OR
    // 2. Listed as a participant (by email match in line items)
    const registrations = await prisma.registration.findMany({
      where: {
        OR: [
          { userId: Number(session.userId) },
          { lineItems: { some: { participantEmail: user.email } } },
        ],
      },
      include: {
        lineItems: true,
        event: {
          select: {
            registrationEnd: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, registrations }, { status: 200 });
  } catch (error) {
    console.error("User registrations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
