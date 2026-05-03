import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { getSession } from "@/lib/auth";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Client sends: POST /api/upload?filename=photo.png
// with raw file as body (Content-Type: image/png)
export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!request.body) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // Get file metadata from query params
    const { searchParams } = new URL(request.url);
    const originalName = searchParams.get("filename") || "upload";
    const mimeType = request.headers.get("content-type") || "";

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPG, PNG, WebP and SVG are allowed." },
        { status: 400 }
      );
    }

    // Sanitize filename and make unique
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Stream request body directly to disk — no buffering, no size limits
    const filePath = join(uploadDir, uniqueName);
    const fileStream = createWriteStream(filePath);
    const nodeReadable = Readable.fromWeb(request.body as any);
    await pipeline(nodeReadable, fileStream);

    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
