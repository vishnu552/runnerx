import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRegistrationSchema } from "@/lib/validations";
import { razorpay } from "@/lib/razorpay";

// POST /api/registrations — create a new registration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createRegistrationSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // 1. Verify the event exists, is published, and registration is open
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED" || !event.isActive) {
      return NextResponse.json(
        { success: false, message: "Event is not currently accepting registrations" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < event.registrationStart) {
      return NextResponse.json(
        { success: false, message: "Registration has not opened yet" },
        { status: 400 }
      );
    }
    if (now > event.registrationEnd) {
      return NextResponse.json(
        { success: false, message: "Registration has closed" },
        { status: 400 }
      );
    }

    // 2. Validate all participant category choices
    const eventCategoryMap = new Map(
      event.categories.map(ec => [ec.id, ec])
    );

    for (const p of data.participants) {
      const ec = eventCategoryMap.get(p.eventCategoryId);
      if (!ec) {
        return NextResponse.json(
          { success: false, message: `Invalid category: ${p.eventCategoryId}` },
          { status: 400 }
        );
      }
      if (!ec.isActive) {
        return NextResponse.json(
          { success: false, message: `Category ${ec.raceType} is not available` },
          { status: 400 }
        );
      }
      // Check capacity
      if (ec.maxParticipants !== null) {
        const participantsForThis = data.participants.filter(
          pp => pp.eventCategoryId === p.eventCategoryId
        ).length;
        if (ec.registeredCount + participantsForThis > ec.maxParticipants) {
          return NextResponse.json(
            { success: false, message: `Category ${ec.raceType} is full` },
            { status: 400 }
          );
        }
      }
    }

    // 3. Validate coupon if provided
    let discountAmount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode },
      });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired coupon" },
          { status: 400 }
        );
      }
      if (coupon.siteFor !== "ALL" && coupon.siteFor !== event.siteFor) {
        return NextResponse.json(
          { success: false, message: "Coupon not valid for this event" },
          { status: 400 }
        );
      }
      if (coupon.validUntil && now > coupon.validUntil) {
        return NextResponse.json(
          { success: false, message: "Coupon has expired" },
          { status: 400 }
        );
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, message: "Coupon usage limit reached" },
          { status: 400 }
        );
      }

      // Calculate total first to apply coupon
      let subtotal = 0;
      for (const p of data.participants) {
        const ec = eventCategoryMap.get(p.eventCategoryId)!;
        let unitPrice = ec.discountPrice ?? ec.price;

        if (ec.raceType === "VIRTUAL" && p.virtualSubCategoryId) {
          const settings = (ec.virtualSettings as any[]) || [];
          const sub = settings.find(s => Number(s.categoryId) === p.virtualSubCategoryId);
          if (sub) {
            unitPrice = sub.discountPrice ?? sub.price;
          }
        }
        
        subtotal += unitPrice;
      }

      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          { success: false, message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon` },
          { status: 400 }
        );
      }

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }

    // 4. Calculate totals
    let totalAmount = 0;
    const lineItemsData = data.participants.map(p => {
      const ec = eventCategoryMap.get(p.eventCategoryId)!;
      let unitPrice = ec.discountPrice ?? ec.price;
      
      // Default snapshots
      let catName = ec.category?.name || ec.raceType;
      let catDistance = ec.category?.distanceLabel || `${ec.distance}km`;
      let originalPrice = ec.price;
      let originalDiscount = ec.discountPrice;

      // Override if Virtual sub-category is selected
      if (ec.raceType === "VIRTUAL" && p.virtualSubCategoryId) {
        const settings = (ec.virtualSettings as any[]) || [];
        const sub = settings.find(s => Number(s.categoryId) === p.virtualSubCategoryId);
        if (sub) {
          unitPrice = sub.discountPrice ?? sub.price;
          catName = `${catName} - ${sub.categoryName}`;
          catDistance = sub.categoryName;
          originalPrice = sub.price;
          originalDiscount = sub.discountPrice;
        }
      }

      totalAmount += unitPrice;

      return {
        eventCategoryId: p.eventCategoryId,
        participantName: p.fullName,
        participantEmail: p.email,
        participantPhone: p.phone,
        participantGender: p.gender,
        participantDob: new Date(p.dob),
        participantCity: p.city || null,
        participantState: p.state || null,
        participantCountry: p.country || null,
        participantPinCode: p.pinCode || null,
        participantAddress: p.address || null,
        isRegistrant: p.isRegistrant || false,
        tshirtSize: p.tshirtSize || null,
        // Snapshots
        categoryNameSnapshot: catName,
        distanceSnapshot: catDistance,
        raceTypeSnapshot: ec.raceType,
        unitPriceSnapshot: originalPrice,
        discountPriceSnapshot: originalDiscount,
        finalPriceSnapshot: unitPrice,
      };
    });

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 5. Try to find logged-in user from registrant participant
    let userId: number | null = null;
    const registrantParticipant = data.participants.find(p => p.isRegistrant);
    if (registrantParticipant) {
      const user = await prisma.user.findUnique({
        where: { email: registrantParticipant.email },
      });
      if (user) userId = user.id;
    }

    // 6. Create registration with line items in a transaction
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          eventId: data.eventId,
          userId,
          status: "PENDING",
          totalAmount,
          discountAmount,
          finalAmount,
          couponCode: data.couponCode || null,
          paymentStatus: "UNPAID",
          eventTitleSnapshot: event.title,
          eventDateSnapshot: event.date,
          siteForSnapshot: event.siteFor,
          lineItems: {
            create: lineItemsData,
          },
        },
        include: {
          lineItems: true,
        },
      });

      // Increment registeredCount for each event category
      const categoryCountMap = new Map<number, number>();
      for (const p of data.participants) {
        categoryCountMap.set(
          p.eventCategoryId,
          (categoryCountMap.get(p.eventCategoryId) || 0) + 1
        );
      }
      for (const [ecId, count] of categoryCountMap) {
        await tx.eventCategory.update({
          where: { id: ecId },
          data: { registeredCount: { increment: count } },
        });
      }

      // Increment coupon usage
      if (data.couponCode) {
        await tx.coupon.update({
          where: { code: data.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return reg;
    });

    // 7. Create Razorpay order if amount > 0
    let razorpayOrder = null;
    if (registration.finalAmount > 0) {
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(registration.finalAmount * 100), // Razorpay expects paise
          currency: "INR",
          receipt: `reg_${registration.id}`,
          notes: {
            registrationId: registration.id,
            eventId: event.id,
            eventTitle: event.title,
          },
        });
      } catch (rzpError) {
        console.error("Razorpay order creation failed:", rzpError);
        // We still created the registration in the DB as PENDING/UNPAID
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        registration,
        razorpayOrder: razorpayOrder ? {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        } : null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/registrations — admin: list registrations
export async function GET(request: Request) {
  try {
    // Import auth at method level to avoid circular dependency issues
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (eventId) where.eventId = Number(eventId);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { lineItems: { some: { participantName: { contains: search, mode: "insensitive" } } } },
        { lineItems: { some: { participantEmail: { contains: search, mode: "insensitive" } } } },
        { eventTitleSnapshot: { contains: search, mode: "insensitive" } },
      ];
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        lineItems: true,
        event: { select: { id: true, title: true, siteFor: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, registrations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get registrations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
