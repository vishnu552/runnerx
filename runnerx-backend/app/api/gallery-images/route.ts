import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteFor = searchParams.get("siteFor");
    const year = searchParams.get("year");

    const where: any = {};
    if (siteFor) where.siteFor = siteFor;
    if (year) where.year = year;

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Fetch Gallery Images Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const siteFor = formData.get("siteFor") as string;
    const year = formData.get("year") as string;
    const mediaType = formData.get("mediaType") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const file = formData.get("file") as File;

    if (!siteFor || !file) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Handle file upload
    let imagePath = "";
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    
    let ext = "bin";
    if (mimeType.startsWith("image/")) {
      ext = mimeType.split("/")[1].replace("svg+xml", "svg").replace("jpeg", "jpg");
    } else if (mimeType.startsWith("video/")) {
      ext = mimeType.split("/")[1];
    }
    
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "gallery");
    await mkdir(uploadsDir, { recursive: true });
    
    const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);
    imagePath = `/uploads/gallery/${fileName}`;

    const image = await prisma.galleryImage.create({
      data: {
        siteFor,
        year: year ? String(year) : null,
        mediaType: mediaType || (mimeType.startsWith("video/") ? "VIDEO" : "IMAGE"),
        imagePath,
        sortOrder,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error: any) {
    console.error("Create Gallery Image Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error",
    }, { status: 500 });
  }
}
