import { NextRequest, NextResponse } from "next/server";

const FASHN_API_KEY = process.env.FASHN_API_KEY || "";
const FASHN_API_URL = "https://api.fashn.ai/v1";

// Demo mode sample results — replace with real Unsplash try-on style images
const DEMO_RESULTS = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=85&fit=crop",
];

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Demo mode
  if (id.startsWith("demo_")) {
    // Simulate 3s processing delay
    const createdAt = parseInt(id.replace("demo_", ""));
    const elapsed = Date.now() - createdAt;
    if (elapsed < 3000) {
      return NextResponse.json({ status: "processing" });
    }
    const randomImg = DEMO_RESULTS[Math.floor(Math.random() * DEMO_RESULTS.length)];
    return NextResponse.json({ status: "completed", output: [randomImg] });
  }

  if (!FASHN_API_KEY || FASHN_API_KEY === "fa-REPLACE_WITH_YOUR_KEY") {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${FASHN_API_URL}/status/${id}`, {
      headers: { Authorization: `Bearer ${FASHN_API_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await res.json();
    // Fashn.ai statuses: "starting" | "processing" | "completed" | "failed"
    return NextResponse.json({
      status: data.status,
      output: data.output || null,
      error: data.error || null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
