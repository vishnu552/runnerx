import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

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

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "name",
      "gender",
      "dateOfBirth",
      "phone",
      "city",
      "state",
      "county",
      "pinCode",
      "address",
      "bloodGroup",
      "emergencyContactName",
      "emergencyContactPhone",
      "tshirtSize",
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        if (field === "dateOfBirth") {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field] || null;
        }
      }
    }

    // Name is required
    if ("name" in updateData && !updateData.name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(session.userId) },
      select: {
        id: true,
        name: true,
        email: true,
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
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
