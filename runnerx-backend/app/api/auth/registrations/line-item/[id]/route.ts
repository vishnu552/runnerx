import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session = await getSession();
    if (!session) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        session = verifyToken(token);
      }
    }

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verification:
    // 1. Get the line item and its associated registration/event
    const lineItem = await prisma.registrationLineItem.findUnique({
      where: { id: Number(id) },
      include: {
        registration: {
          include: {
            event: true
          }
        }
      }
    });

    if (!lineItem) {
      return NextResponse.json({ success: false, message: "Line item not found" }, { status: 404 });
    }

    // 2. Check if the user is authorized (must be the one who made the registration)
    if (lineItem.registration.userId !== Number(session.userId)) {
      return NextResponse.json({ success: false, message: "Unauthorized to edit this registration" }, { status: 403 });
    }

    // 3. Check if registration date has passed
    const now = new Date();
    const registrationEnd = new Date(lineItem.registration.event.registrationEnd);
    if (now > registrationEnd) {
      return NextResponse.json({ 
        success: false, 
        message: "Registration for this event has ended. Details can no longer be edited." 
      }, { status: 400 });
    }

    // 4. Update allowed fields
    const updatedLineItem = await prisma.registrationLineItem.update({
      where: { id: Number(id) },
      data: {
        participantName: body.participantName,
        participantEmail: body.participantEmail,
        participantPhone: body.participantPhone,
        participantGender: body.participantGender,
        participantDob: body.participantDob ? new Date(body.participantDob) : undefined,
        participantCity: body.participantCity,
        participantState: body.participantState,
        participantPinCode: body.participantPinCode,
        participantAddress: body.participantAddress,
        tshirtSize: body.tshirtSize,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Participant details updated successfully",
      lineItem: updatedLineItem 
    });
  } catch (error) {
    console.error("Update line item error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
