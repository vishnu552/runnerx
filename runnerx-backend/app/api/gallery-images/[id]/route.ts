import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const formData = await req.formData();
    
    const siteFor = formData.get("siteFor") as string;
    const year = formData.get("year") as string;
    const mediaType = formData.get("mediaType") as string;
    const sortOrder = formData.get("sortOrder") ? parseInt(formData.get("sortOrder") as string) : undefined;
    const isActive = formData.get("isActive") === "true";
    const file = formData.get("file") as File | null;

    const existing = await prisma.galleryImage.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Gallery item not found" }, { status: 404 });
    }

    // Handle file upload if changed
    let imagePath = existing.imagePath;
    if (file) {
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
    }

    const updated = await prisma.galleryImage.update({
      where: { id: parseInt(params.id) },
      data: {
        siteFor: siteFor !== undefined ? siteFor : existing.siteFor,
        year: year !== undefined ? (year ? String(year) : null) : existing.year,
        mediaType: mediaType !== undefined ? mediaType : existing.mediaType,
        imagePath,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, image: updated });
  } catch (error: any) {
    console.error("Update Gallery Image Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error",
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.galleryImage.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Gallery Image Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
