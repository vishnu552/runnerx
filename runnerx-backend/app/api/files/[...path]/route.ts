import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join, normalize, sep, extname } from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const uploadsDir = join(process.cwd(), "uploads");
  const requested = normalize(join(uploadsDir, ...parts));

  if (!requested.startsWith(uploadsDir + sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const stats = await stat(requested);
    if (!stats.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const ext = extname(requested).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    const nodeStream = createReadStream(requested);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(stats.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
