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

    if (lineItem.isProfileUpdated) {
      return NextResponse.json({ 
        success: false, 
        message: "Your profile has already been updated once and cannot be modified again." 
      }, { status: 400 });
    }

    // 4. Check if registration date has passed
    const now = new Date();
    const registrationEnd = new Date(lineItem.registration.event.registrationEnd);
    if (now > registrationEnd) {
      return NextResponse.json({ 
        success: false, 
        message: "Registration for this event has ended. Details can no longer be edited." 
      }, { status: 400 });
    }

    // 5. If eventCategoryId or virtualSubCategoryId is provided, fetch it to update snapshots
    let categoryUpdateData = {};
    if (body.virtualSubCategoryId && lineItem.raceTypeSnapshot.toLowerCase().includes('virtual')) {
      const category = await prisma.eventCategory.findUnique({
        where: { id: Number(lineItem.eventCategoryId) }
      });
      if (category && Array.isArray(category.virtualSettings)) {
        const settings = category.virtualSettings as any[];
        const sub = settings.find((s) => Number(s.categoryId) === Number(body.virtualSubCategoryId));
        if (sub) {
          categoryUpdateData = {
            categoryNameSnapshot: `${category.raceType} - ${sub.categoryName}`,
            distanceSnapshot: sub.categoryName,
          };
        }
      }
    } else if (body.eventCategoryId && body.eventCategoryId !== lineItem.eventCategoryId) {
      const category = await prisma.eventCategory.findUnique({
        where: { id: Number(body.eventCategoryId) },
        include: { category: true }
      });
      if (category) {
        categoryUpdateData = {
          eventCategoryId: category.id,
          categoryNameSnapshot: category.category?.name || category.raceType,
          distanceSnapshot: category.category?.distanceLabel || `${category.distance}K`,
          raceTypeSnapshot: category.raceType,
          // We assume price differences are handled elsewhere or ignored for simple updates
        };
      }
    }

    // 6. Update allowed fields
    const updatedLineItem = await prisma.registrationLineItem.update({
      where: { id: Number(id) },
      data: {
        ...categoryUpdateData,
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
        bibNumber: body.bibNumber,
        isProfileUpdated: true,
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
