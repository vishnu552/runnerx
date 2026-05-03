import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRegistrationSchema } from "@/lib/validations";
import { razorpay } from "@/lib/razorpay";
import { Prisma } from "@prisma/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Calculate participant's age as of today (registration date) */
function getAgeToday(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * Generate a human-readable unique registration ID for a participant.
 * Format: {SITE_CODE}-{YEAR}-{SEQUENCE}, e.g. "KTA-2026-00001"
 * Sequences are per-site, per-year and independent from each other.
 * Must be called inside a Prisma transaction for conflict safety.
 */
async function generateUniqueRegId(
  tx: Prisma.TransactionClient,
  siteFor: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${siteFor.toUpperCase()}-${year}`;

  const latest = await tx.registrationLineItem.findFirst({
    where: { uniqueRegId: { startsWith: prefix } },
    orderBy: { uniqueRegId: "desc" },
    select: { uniqueRegId: true },
  });

  let sequence = 1;
  if (latest?.uniqueRegId) {
    const lastPart = latest.uniqueRegId.split("-").pop();
    sequence = parseInt(lastPart ?? "0", 10) + 1;
  }

  return `${prefix}-${String(sequence).padStart(5, "0")}`;
}

// ─── POST /api/registrations ──────────────────────────────────────────────────

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

    // ── PROGRESSIVE SAVE MODE ────────────────────────────────────────────────
    // Saves a single participant to an existing or new PENDING registration.
    // Returns registrationId + lineItemId + uniqueRegId.
    // No Razorpay order is created at this stage.
    if (data.saveMode === "progressive") {
      if (!data.participant) {
        return NextResponse.json(
          { success: false, message: "participant is required in progressive mode" },
          { status: 400 }
        );
      }

      const p = data.participant;

      // 1. Verify event
      const event = await prisma.event.findUnique({
        where: { id: data.eventId },
        include: {
          categories: { include: { category: true } },
        },
      });

      if (!event) {
        return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
      }
      if (event.status !== "PUBLISHED" || !event.isActive) {
        return NextResponse.json(
          { success: false, message: "Event is not currently accepting registrations" },
          { status: 400 }
        );
      }
      const now = new Date();
      if (now < event.registrationStart) {
        return NextResponse.json({ success: false, message: "Registration has not opened yet" }, { status: 400 });
      }
      if (now > event.registrationEnd) {
        return NextResponse.json({ success: false, message: "Registration has closed" }, { status: 400 });
      }

      // 2. Validate category
      const eventCategoryMap = new Map(event.categories.map((ec) => [ec.id, ec]));
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

      // 3. Age validation (as of registration date — today)
      const dob = new Date(p.dob);
      const age = getAgeToday(dob);
      if (ec.ageMin !== null && age < ec.ageMin) {
        return NextResponse.json(
          {
            success: false,
            message: `${p.fullName} does not meet the minimum age (${ec.ageMin} years) for this category`,
          },
          { status: 400 }
        );
      }
      if (ec.ageMax !== null && age > ec.ageMax) {
        return NextResponse.json(
          {
            success: false,
            message: `${p.fullName} exceeds the maximum age (${ec.ageMax} years) for this category`,
          },
          { status: 400 }
        );
      }

      // 4. Build line item data
      let unitPrice = ec.discountPrice ?? ec.price;
      let catName = ec.category?.name || ec.raceType;
      let catDistance = ec.category?.distanceLabel || `${ec.distance}km`;
      let originalPrice = ec.price;
      let originalDiscount = ec.discountPrice;

      if (ec.raceType === "VIRTUAL" && p.virtualSubCategoryId) {
        const settings = (ec.virtualSettings as any[]) || [];
        const sub = settings.find((s) => Number(s.categoryId) === p.virtualSubCategoryId);
        if (sub) {
          unitPrice = sub.discountPrice ?? sub.price;
          catName = `${catName} - ${sub.categoryName}`;
          catDistance = sub.categoryName;
          originalPrice = sub.price;
          originalDiscount = sub.discountPrice;
        }
      }

      // 5. Find userId if participant is the registrant
      let userId: number | null = null;
      if (p.isRegistrant) {
        const user = await prisma.user.findUnique({ where: { email: p.email } });
        if (user) userId = user.id;
      }

      // 6. Save in a transaction
      const { registration, lineItem } = await prisma.$transaction(async (tx) => {
        let reg;

        if (data.registrationId) {
          // Append to existing PENDING registration
          const existing = await tx.registration.findUnique({
            where: { id: data.registrationId },
            include: { lineItems: { select: { participantEmail: true } } },
          });

          if (!existing) {
            throw new Error("Registration not found");
          }
          if (existing.paymentStatus === "PAID") {
            throw new Error("Cannot add participants to an already-paid registration");
          }

          // Duplicate email check within same order
          const emailAlreadyAdded = existing.lineItems.some(
            (li) => li.participantEmail.toLowerCase() === p.email.toLowerCase()
          );
          if (emailAlreadyAdded) {
            throw new Error(`${p.email} has already been added to this registration`);
          }

          reg = existing;
        } else {
          // Create a new PENDING registration
          reg = await tx.registration.create({
            data: {
              eventId: data.eventId,
              userId,
              status: "PENDING",
              totalAmount: 0,
              discountAmount: 0,
              finalAmount: 0,
              paymentStatus: "UNPAID",
              eventTitleSnapshot: event.title,
              eventDateSnapshot: event.date,
              siteForSnapshot: event.siteFor,
            },
          });
        }

        // Generate uniqueRegId inside the transaction
        const uniqueRegId = await generateUniqueRegId(tx, event.siteFor);

        // Create the line item
        const li = await tx.registrationLineItem.create({
          data: {
            registrationId: reg.id,
            eventCategoryId: p.eventCategoryId,
            uniqueRegId,
            status: "PENDING",
            participantName: p.fullName,
            participantEmail: p.email,
            participantPhone: p.phone,
            participantGender: p.gender,
            participantDob: dob,
            participantCity: p.city || null,
            participantState: p.state || null,
            participantCountry: p.country || null,
            participantPinCode: p.pinCode || null,
            participantAddress: p.address || null,
            isRegistrant: p.isRegistrant || false,
            tshirtSize: p.tshirtSize || null,
            emergencyContactName: p.emergencyContactName || null,
            emergencyContactPhone: p.emergencyContactPhone || null,
            categoryNameSnapshot: catName,
            distanceSnapshot: catDistance,
            raceTypeSnapshot: ec.raceType,
            unitPriceSnapshot: originalPrice,
            discountPriceSnapshot: originalDiscount ?? null,
            finalPriceSnapshot: unitPrice,
          },
        });

        return { registration: reg, lineItem: li };
      });

      return NextResponse.json(
        {
          success: true,
          registrationId: registration.id,
          lineItemId: lineItem.id,
          uniqueRegId: lineItem.uniqueRegId,
        },
        { status: 201 }
      );
    }

    // ── GENERATE ORDER MODE ──────────────────────────────────────────────────
    // Called from "Pay Now". Recalculates totals from all saved line items,
    // applies coupon, updates the Registration, and creates a Razorpay order.
    if (data.generateOrder && data.registrationId) {
      const existing = await prisma.registration.findUnique({
        where: { id: data.registrationId },
        include: {
          lineItems: true,
          event: { include: { categories: { include: { category: true } } } },
        },
      });

      if (!existing) {
        return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
      }
      if (existing.paymentStatus === "PAID") {
        return NextResponse.json(
          { success: false, message: "Registration already paid" },
          { status: 400 }
        );
      }
      if (existing.lineItems.length === 0) {
        return NextResponse.json(
          { success: false, message: "No participants found in this registration" },
          { status: 400 }
        );
      }

      const event = existing.event;

      // Recalculate total from existing line items
      let totalAmount = 0;
      for (const li of existing.lineItems) {
        totalAmount += li.finalPriceSnapshot;
      }

      // Validate + apply coupon
      let discountAmount = 0;
      const now = new Date();

      if (data.couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
        if (!coupon || !coupon.isActive) {
          return NextResponse.json({ success: false, message: "Invalid or expired coupon" }, { status: 400 });
        }
        if (coupon.siteFor !== "ALL" && coupon.siteFor !== event.siteFor) {
          return NextResponse.json({ success: false, message: "Coupon not valid for this event" }, { status: 400 });
        }
        if (coupon.validUntil && now > coupon.validUntil) {
          return NextResponse.json({ success: false, message: "Coupon has expired" }, { status: 400 });
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json({ success: false, message: "Coupon usage limit reached" }, { status: 400 });
        }
        if (coupon.minOrderValue && totalAmount < coupon.minOrderValue) {
          return NextResponse.json(
            { success: false, message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon` },
            { status: 400 }
          );
        }
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }

      const finalAmount = Math.max(0, totalAmount - discountAmount);

      // Update registration totals and coupon
      const updatedReg = await prisma.$transaction(async (tx) => {
        const reg = await tx.registration.update({
          where: { id: data.registrationId! },
          data: {
            totalAmount,
            discountAmount,
            finalAmount,
            couponCode: data.couponCode || null,
          },
        });

        if (data.couponCode) {
          await tx.coupon.update({
            where: { code: data.couponCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return reg;
      });

      // Create Razorpay order if amount > 0
      let razorpayOrder = null;
      let debugRzpError = null;
      if (updatedReg.finalAmount > 0) {
        try {
          razorpayOrder = await razorpay.orders.create({
            amount: Math.round(updatedReg.finalAmount * 100),
            currency: "INR",
            receipt: `reg_${updatedReg.id}`,
            notes: {
              registrationId: updatedReg.id,
              eventId: event.id,
              eventTitle: event.title,
            },
          });
        } catch (rzpError: any) {
          console.error("Razorpay order creation failed:", rzpError);
          debugRzpError = rzpError?.message || rzpError?.description || String(rzpError);
        }
      }

      return NextResponse.json(
        {
          success: true,
          registration: updatedReg,
          razorpayOrder: razorpayOrder
            ? { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency }
            : null,
          debugRzpError,
        },
        { status: 200 }
      );
    }

    // ── LEGACY BATCH MODE (kept for backward compatibility) ──────────────────
    // All participants sent at once. No progressive save.
    const participants = data.participants;
    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one participant is required" },
        { status: 400 }
      );
    }

    // 1. Verify the event exists, is published, and registration is open
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        categories: { include: { category: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }
    if (event.status !== "PUBLISHED" || !event.isActive) {
      return NextResponse.json(
        { success: false, message: "Event is not currently accepting registrations" },
        { status: 400 }
      );
    }
    const now = new Date();
    if (now < event.registrationStart) {
      return NextResponse.json({ success: false, message: "Registration has not opened yet" }, { status: 400 });
    }
    if (now > event.registrationEnd) {
      return NextResponse.json({ success: false, message: "Registration has closed" }, { status: 400 });
    }

    // 2. Validate all participant category choices (age + active check)
    const eventCategoryMap = new Map(event.categories.map((ec) => [ec.id, ec]));

    for (const p of participants) {
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
      // Age validation
      const dob = new Date(p.dob);
      const age = getAgeToday(dob);
      if (ec.ageMin !== null && age < ec.ageMin) {
        return NextResponse.json(
          { success: false, message: `${p.fullName} does not meet the minimum age (${ec.ageMin}) for this category` },
          { status: 400 }
        );
      }
      if (ec.ageMax !== null && age > ec.ageMax) {
        return NextResponse.json(
          { success: false, message: `${p.fullName} exceeds the maximum age (${ec.ageMax}) for this category` },
          { status: 400 }
        );
      }
    }

    // 3. Validate coupon if provided
    let discountAmount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ success: false, message: "Invalid or expired coupon" }, { status: 400 });
      }
      if (coupon.siteFor !== "ALL" && coupon.siteFor !== event.siteFor) {
        return NextResponse.json({ success: false, message: "Coupon not valid for this event" }, { status: 400 });
      }
      if (coupon.validUntil && now > coupon.validUntil) {
        return NextResponse.json({ success: false, message: "Coupon has expired" }, { status: 400 });
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ success: false, message: "Coupon usage limit reached" }, { status: 400 });
      }

      let subtotal = 0;
      for (const p of participants) {
        const ec = eventCategoryMap.get(p.eventCategoryId)!;
        let unitPrice = ec.discountPrice ?? ec.price;
        if (ec.raceType === "VIRTUAL" && p.virtualSubCategoryId) {
          const settings = (ec.virtualSettings as any[]) || [];
          const sub = settings.find((s) => Number(s.categoryId) === p.virtualSubCategoryId);
          if (sub) unitPrice = sub.discountPrice ?? sub.price;
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
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
      } else {
        discountAmount = coupon.discountValue;
      }
    }

    // 4. Calculate totals + build line items
    let totalAmount = 0;
    const lineItemsData = participants.map((p) => {
      const ec = eventCategoryMap.get(p.eventCategoryId)!;
      let unitPrice = ec.discountPrice ?? ec.price;
      let catName = ec.category?.name || ec.raceType;
      let catDistance = ec.category?.distanceLabel || `${ec.distance}km`;
      let originalPrice = ec.price;
      let originalDiscount = ec.discountPrice;

      if (ec.raceType === "VIRTUAL" && p.virtualSubCategoryId) {
        const settings = (ec.virtualSettings as any[]) || [];
        const sub = settings.find((s) => Number(s.categoryId) === p.virtualSubCategoryId);
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
        emergencyContactName: p.emergencyContactName || null,
        emergencyContactPhone: p.emergencyContactPhone || null,
        categoryNameSnapshot: catName,
        distanceSnapshot: catDistance,
        raceTypeSnapshot: ec.raceType,
        unitPriceSnapshot: originalPrice,
        discountPriceSnapshot: originalDiscount ?? null,
        finalPriceSnapshot: unitPrice,
      };
    });

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 5. Find userId from registrant participant
    let userId: number | null = null;
    const registrantParticipant = participants.find((p) => p.isRegistrant);
    if (registrantParticipant) {
      const user = await prisma.user.findUnique({ where: { email: registrantParticipant.email } });
      if (user) userId = user.id;
    }

    // 6. Create registration + line items in transaction (with uniqueRegId per item)
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
        },
      });

      // Create line items one by one to generate unique IDs in order
      for (const liData of lineItemsData) {
        const uniqueRegId = await generateUniqueRegId(tx, event.siteFor);
        await tx.registrationLineItem.create({
          data: { ...liData, registrationId: reg.id, uniqueRegId },
        });
      }

      if (data.couponCode) {
        await tx.coupon.update({
          where: { code: data.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return tx.registration.findUnique({
        where: { id: reg.id },
        include: { lineItems: true },
      });
    });

    // 7. Create Razorpay order if amount > 0 AND generateOrder is true
    let razorpayOrder = null;
    if (registration!.finalAmount > 0 && data.generateOrder) {
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(registration!.finalAmount * 100),
          currency: "INR",
          receipt: `reg_${registration!.id}`,
          notes: {
            registrationId: registration!.id,
            eventId: event.id,
            eventTitle: event.title,
          },
        });
      } catch (rzpError) {
        console.error("Razorpay order creation failed:", rzpError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        registration,
        razorpayOrder: razorpayOrder
          ? { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency }
          : null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create registration error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET /api/registrations — admin: list registrations ───────────────────────

export async function GET(request: Request) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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
        { lineItems: { some: { uniqueRegId: { contains: search, mode: "insensitive" } } } },
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

    return NextResponse.json({ success: true, registrations }, { status: 200 });
  } catch (error) {
    console.error("Get registrations error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
