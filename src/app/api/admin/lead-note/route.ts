import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/admin-auth";

/**
 * Append a free-form note to a facility's CRM lead.
 * If no CRM lead row exists yet for the facility, create one (status=new)
 * before attaching the note.
 *
 * Auth: requires the admin email session.
 */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { facilityId, body } = await req.json();
  if (!facilityId || !body?.trim()) {
    return NextResponse.json(
      { ok: false, error: "facilityId and body required" },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  // Ensure a CRM lead row exists (lazy creation)
  const { data: existing } = await supabase
    .from("crm_facility_leads")
    .select("id")
    .eq("facility_id", facilityId)
    .maybeSingle();

  let leadId = existing?.id;

  if (!leadId) {
    const { data: newLead, error: createErr } = await supabase
      .from("crm_facility_leads")
      .insert({ facility_id: facilityId, status: "new" })
      .select("id")
      .single();
    if (createErr) {
      return NextResponse.json(
        { ok: false, error: createErr.message },
        { status: 500 }
      );
    }
    leadId = newLead.id;
  }

  const { data, error } = await supabase
    .from("crm_lead_notes")
    .insert({
      lead_id: leadId,
      body: body.trim(),
      author: user.email,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, note: data });
}
