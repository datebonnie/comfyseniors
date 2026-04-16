import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { facilityId } = await req.json();
  if (!facilityId) {
    return NextResponse.json({ error: "Missing facilityId" }, { status: 400 });
  }

  const supabase = createClient();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Try to increment existing row
  const { data: existing } = await supabase
    .from("facility_views")
    .select("id, view_count")
    .eq("facility_id", facilityId)
    .eq("month", month)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("facility_views")
      .update({ view_count: (existing.view_count || 0) + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("facility_views").insert({
      facility_id: facilityId,
      month,
      view_count: 1,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const month = req.nextUrl.searchParams.get("month");

  if (!facilityId || !month) {
    return NextResponse.json({ count: 0 });
  }

  const supabase = createClient();

  const { data } = await supabase
    .from("facility_views")
    .select("view_count")
    .eq("facility_id", facilityId)
    .eq("month", month)
    .maybeSingle();

  return NextResponse.json({ count: data?.view_count ?? 0 });
}
