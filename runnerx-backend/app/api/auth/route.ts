import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = authSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const lowerEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      const isValid = await verifyPassword(password, existingUser.password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (existingUser.role !== "USER") {
        return NextResponse.json(
          {
            success: false,
            message: "Admin accounts must sign in from the backend admin login.",
          },
          { status: 403 }
        );
      }

      const token = signToken({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });

      return NextResponse.json({
        success: true,
        action: "login",
        message: "Login successful",
        token,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: lowerEmail,
        name: email.split("@")[0],
        password: hashedPassword,
        role: "USER",
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      action: "register",
      message: "Account created and logged in",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
