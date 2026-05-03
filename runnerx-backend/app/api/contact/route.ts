import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactInquiryEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, siteFor } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email and message are required" },
        { status: 400 }
      );
    }

    // 1. Save to database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || "Contact Form Submission",
        message,
        siteFor: siteFor || "GLOBAL",
        status: "NEW",
      },
    });

    // 2. Send email notification
    try {
      await sendContactInquiryEmail(name, email, subject || "Contact Form Submission", message, siteFor || "GLOBAL");
    } catch (emailError) {
      console.error("Failed to send contact email notification:", emailError);
      // We don't fail the request if only email fails, but we logged it
    }

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("Contact inquiry error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
