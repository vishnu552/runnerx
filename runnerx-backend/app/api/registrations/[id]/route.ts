import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/registrations/[id] — admin: full details of a single registration
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const registrationId = parseInt(id, 10);
    if (isNaN(registrationId)) {
      return NextResponse.json({ success: false, message: "Invalid registration ID" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        lineItems: { orderBy: { id: "asc" } },
        event: { select: { id: true, title: true, siteFor: true, date: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!registration) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration }, { status: 200 });
  } catch (error) {
    console.error("Get registration detail error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
