import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;
    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash the password securely
    const hashedPassword = await hashPassword(password);

    // Create the global user
    const user = await prisma.user.create({
      data: {
        email: lowerEmail,
        name,
        password: hashedPassword,
        role: "USER", // Default scope is Runner/User
      },
    });

    // Generate token for frontend user session handling
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return the token to the frontend so it can store it in its own user cookie
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
