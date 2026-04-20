import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/admin-auth";

/**
 * Upsert a CRM lead row for a facility.
 * Creates the row if it doesn't exist; updates fields if it does.
 *
 * Auth: requires the admin email session.
 */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    facilityId,
    status,
    source,
    priority,
    value_estimate,
    next_followup_at,
    mark_contacted_now,
  } = body;

  if (!facilityId || !status) {
    return NextResponse.json(
      { ok: false, error: "facilityId and status required" },
      { status: 400 }
    );
  }

  const validStatuses = [
    "new",
    "contacted",
    "replied",
    "demo",
    "paying",
    "lost",
    "unresponsive",
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  const updates: Record<string, unknown> = {
    facility_id: facilityId,
    status,
    source: source || null,
    priority: typeof priority === "number" ? priority : 0,
    value_estimate: value_estimate || null,
    next_followup_at: next_followup_at || null,
  };

  if (mark_contacted_now) {
    updates.last_contacted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("crm_facility_leads")
    .upsert(updates, { onConflict: "facility_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data });
}
