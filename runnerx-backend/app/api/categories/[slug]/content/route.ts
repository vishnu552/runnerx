import { NextResponse } from "next/server";

// This route has been replaced by /api/categories/[slug]/tabs
// Redirect any requests to the new endpoint

type Params = Promise<{ slug: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const siteFor = searchParams.get("siteFor") || "KTA";

  // Redirect to the main category endpoint which now includes tabs
  const url = new URL(`/api/categories/${slug}?siteFor=${siteFor}`, request.url);
  return NextResponse.redirect(url, 301);
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message: "This endpoint has been deprecated. Use /api/categories/[slug]/tabs instead.",
    },
    { status: 410 }
  );
}
