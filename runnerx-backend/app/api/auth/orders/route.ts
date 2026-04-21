import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

// GET /api/auth/orders — get orders for the logged-in user
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

    const orders = await prisma.order.findMany({
      where: { userId: Number(session.userId) },
      include: {
        registrations: {
          include: {
            lineItems: true,
          },
        },
        donations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("User orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
