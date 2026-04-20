import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

/**
 * Autocomplete endpoint backing the "See Your Facility Page" widget
 * on /for-facilities. Bergen-scoped, top 8 matches by name ILIKE.
 * Returns only non-PII fields so this endpoint is safe to leave
 * unauthenticated.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const supabase = createClient();

  // Escape % and _ so user input can't widen the ILIKE
  const safe = q.replace(/[\\%_]/g, (c) => `\\${c}`);

  const { data, error } = await supabase
    .from("facilities")
    .select("id, name, slug, city, is_verified")
    .eq("county", "Bergen")
    .ilike("name", `%${safe}%`)
    .order("is_verified", { ascending: false })
    .order("name", { ascending: true })
    .limit(8);

  if (error) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
