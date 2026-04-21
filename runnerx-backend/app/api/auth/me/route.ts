import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

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

    // Fetch fresh user data from DB
    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        dateOfBirth: true,
        phone: true,
        city: true,
        state: true,
        county: true,
        pinCode: true,
        address: true,
        bloodGroup: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        tshirtSize: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
