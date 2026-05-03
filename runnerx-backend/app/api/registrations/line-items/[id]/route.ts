import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLineItemSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(20).optional(),
  gender: z.string().min(1).optional(),
  dob: z.string().min(1).optional(),
  pinCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tshirtSize: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
});

// PATCH /api/registrations/line-items/[id]
// Updates a specific participant's details on a PENDING registration.
// Called from the review page when the user edits a participant after progressive save.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lineItemId = parseInt(id, 10);

    if (isNaN(lineItemId)) {
      return NextResponse.json(
        { success: false, message: "Invalid line item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = updateLineItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = result.data;

    // Fetch the line item and check it belongs to a PENDING/UNPAID registration
    const lineItem = await prisma.registrationLineItem.findUnique({
      where: { id: lineItemId },
      include: {
        registration: { select: { paymentStatus: true } },
      },
    });

    if (!lineItem) {
      return NextResponse.json(
        { success: false, message: "Line item not found" },
        { status: 404 }
      );
    }

    if (lineItem.registration.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "Cannot edit participants of a paid registration" },
        { status: 400 }
      );
    }

    // Build update payload
    const updateData: Record<string, unknown> = {};
    if (updates.fullName !== undefined) updateData.participantName = updates.fullName;
    if (updates.email !== undefined) updateData.participantEmail = updates.email;
    if (updates.phone !== undefined) updateData.participantPhone = updates.phone;
    if (updates.gender !== undefined) updateData.participantGender = updates.gender;
    if (updates.dob !== undefined) updateData.participantDob = new Date(updates.dob);
    if (updates.pinCode !== undefined) updateData.participantPinCode = updates.pinCode;
    if (updates.country !== undefined) updateData.participantCountry = updates.country;
    if (updates.state !== undefined) updateData.participantState = updates.state;
    if (updates.city !== undefined) updateData.participantCity = updates.city;
    if (updates.address !== undefined) updateData.participantAddress = updates.address;
    if (updates.tshirtSize !== undefined) updateData.tshirtSize = updates.tshirtSize;
    if (updates.emergencyContactName !== undefined) updateData.emergencyContactName = updates.emergencyContactName;
    if (updates.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = updates.emergencyContactPhone;

    const updated = await prisma.registrationLineItem.update({
      where: { id: lineItemId },
      data: updateData,
    });

    return NextResponse.json({ success: true, lineItem: updated }, { status: 200 });
  } catch (error) {
    console.error("Update line item error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
