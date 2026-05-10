import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/contact/[id] — admin: full details of a single contact inquiry
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
    const inquiryId = parseInt(id, 10);
    if (isNaN(inquiryId)) {
      return NextResponse.json({ success: false, message: "Invalid inquiry ID" }, { status: 400 });
    }

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, message: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry }, { status: 200 });
  } catch (error) {
    console.error("Get contact inquiry detail error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
