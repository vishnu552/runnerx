import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const bib = searchParams.get("bib");

  if (!eventId || !bib) {
    return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
  }

  try {
    const existingBib = await prisma.registrationLineItem.findFirst({
      where: {
        bibNumber: bib,
        registration: {
          eventId: Number(eventId),
          status: { not: "CANCELLED" }
        }
      }
    });

    return NextResponse.json({ available: !existingBib });
  } catch (error) {
    console.error("Check Bib Error:", error);
    return NextResponse.json({ success: false, message: "Error checking bib" }, { status: 500 });
  }
}
