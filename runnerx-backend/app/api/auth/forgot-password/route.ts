import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendForgotPasswordEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with this email, a reset link has been sent." 
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Send the actual email
    try {
      await sendForgotPasswordEmail(user.email, user.name, token);
    } catch (mailError) {
      console.error("Failed to send forgot password email:", mailError);
      // We still return success as the token was generated, but log the error
    }

    // For the purpose of this demo/development, we return the token in the response
    // so the user doesn't have to check server logs. 
    // In production, REMOVE THIS.
    return NextResponse.json({ 
      success: true, 
      message: "Reset link sent to your email.",
      debugToken: token // ONLY FOR DEVELOPMENT
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
