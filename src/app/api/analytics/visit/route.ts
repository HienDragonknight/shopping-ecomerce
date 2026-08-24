import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const INITIAL_BASE_OFFSET = 4270;

function getStartOfToday() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const vnDateStr = formatter.format(now); // "YYYY-MM-DD"
  return new Date(`${vnDateStr}T00:00:00+07:00`).toISOString();
}

export async function GET() {
  try {
    const startOfDay = getStartOfToday();

    // 1. Total DB count
    const { count: totalDbCount, error: totalErr } = await supabase
      .from("site_visits")
      .select("*", { count: "exact", head: true });

    if (totalErr) {
      console.error("Error fetching total visits:", totalErr);
    }

    // 2. Today DB count
    const { count: todayDbCount, error: todayErr } = await supabase
      .from("site_visits")
      .select("*", { count: "exact", head: true })
      .gte("visited_at", startOfDay);

    if (todayErr) {
      console.error("Error fetching today visits:", todayErr);
    }

    const totalCount = (totalDbCount || 0) + INITIAL_BASE_OFFSET;
    const todayCount = todayDbCount || 0;

    return NextResponse.json({
      success: true,
      totalVisits: totalCount,
      todayVisits: todayCount,
      baseOffset: INITIAL_BASE_OFFSET,
      dbTotal: totalDbCount || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("API analytics error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let path = "/";
    try {
      const body = await request.json();
      if (body?.path) path = body.path;
    } catch {
      // no JSON body, use default
    }

    const userAgent = request.headers.get("user-agent") || "";

    // Insert new visit log
    const { error: insertErr } = await supabase.from("site_visits").insert([
      {
        path,
        user_agent: userAgent,
        visited_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.error("Error inserting site visit:", insertErr);
    }

    // Return latest counts
    return GET();
  } catch (err: any) {
    console.error("API analytics POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to log visit" },
      { status: 500 }
    );
  }
}
