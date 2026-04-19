import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/admin-auth";
import LeadActions from "./LeadActions";
import NoteFormClient from "./NoteFormClient";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-cs-blue-light text-cs-blue-dark",
  contacted: "bg-yellow-100 text-yellow-800",
  replied: "bg-cs-lavender/15 text-cs-lavender",
  demo: "bg-orange-100 text-orange-800",
  paying: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  unresponsive: "bg-gray-100 text-gray-700",
};

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminSupabaseClient();

  const { data: facility } = await supabase
    .from("facilities")
    .select(
      "id,name,slug,city,state,county,email,phone,website,care_types," +
        "accepts_medicaid,accepts_medicare,price_min,price_max,beds," +
        "value_score,overall_rating,citation_count,last_inspection,is_verified"
    )
    .eq("id", params.id)
    .single();

  if (!facility) notFound();

  const { data: existingLead } = await supabase
    .from("crm_facility_leads")
    .select("*")
    .eq("facility_id", facility.id)
    .maybeSingle();

  const lead = existingLead || {
    id: null,
    facility_id: facility.id,
    status: "new",
    source: null,
    priority: 0,
    last_contacted_at: null,
    next_followup_at: null,
    value_estimate: facility.accepts_medicaid || facility.accepts_medicare ? 397 : 297,
  };

  const { data: notes } = lead.id
    ? await supabase
        .from("crm_lead_notes")
        .select("id,body,author,created_at")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
    : { data: [] as Array<{ id: string; body: string; author: string | null; created_at: string }> };

  const isMM = facility.accepts_medicaid || facility.accepts_medicare;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/leads"
          className="text-xs text-cs-muted hover:text-cs-blue-dark"
        >
          ← Back to leads
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-cs-blue-dark">
              {facility.name}
            </h1>
            <p className="mt-1 text-sm text-cs-muted">
              {facility.city}, {facility.state}{" "}
              {facility.county && (
                <span className="text-cs-muted/70">· {facility.county} County</span>
              )}
            </p>
          </div>
          <span
            className={`label inline-block rounded-full px-3 py-1 text-xs ${
              STATUS_COLORS[lead.status] || STATUS_COLORS.new
            }`}
          >
            {lead.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: facility data */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-card border border-cs-border bg-white p-5">
            <h2 className="mb-3 font-sans text-base font-semibold text-cs-blue-dark">
              Contact
            </h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <DataRow label="Email">
                {facility.email ? (
                  <a
                    href={`mailto:${facility.email}`}
                    className="text-cs-blue hover:underline"
                  >
                    {facility.email}
                  </a>
                ) : (
                  "—"
                )}
              </DataRow>
              <DataRow label="Phone">
                {facility.phone ? (
                  <a
                    href={`tel:${facility.phone}`}
                    className="text-cs-blue hover:underline"
                  >
                    {facility.phone}
                  </a>
                ) : (
                  "—"
                )}
              </DataRow>
              <DataRow label="Website">
                {facility.website ? (
                  <a
                    href={facility.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cs-blue hover:underline"
                  >
                    {facility.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                ) : (
                  "—"
                )}
              </DataRow>
              <DataRow label="Public listing">
                <a
                  href={`/facility/${facility.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cs-blue hover:underline"
                >
                  /facility/{facility.slug} ↗
                </a>
              </DataRow>
            </dl>
          </div>

          <div className="rounded-card border border-cs-border bg-white p-5">
            <h2 className="mb-3 font-sans text-base font-semibold text-cs-blue-dark">
              Facility profile
            </h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <DataRow label="Care types">
                {(facility.care_types || []).join(", ") || "—"}
              </DataRow>
              <DataRow label="Beds">{facility.beds || "—"}</DataRow>
              <DataRow label="Pricing">
                {facility.price_min
                  ? `$${facility.price_min.toLocaleString()}${
                      facility.price_max ? `–$${facility.price_max.toLocaleString()}` : ""
                    }/mo`
                  : "—"}
              </DataRow>
              <DataRow label="Value score">
                {facility.value_score ?? "—"} / 100
              </DataRow>
              <DataRow label="CMS rating">
                {facility.overall_rating ? `${facility.overall_rating}★` : "—"}
              </DataRow>
              <DataRow label="Citations">
                {facility.citation_count ?? 0}
              </DataRow>
              <DataRow label="Verified">
                {facility.is_verified ? "Yes ✓" : "No"}
              </DataRow>
              <DataRow label="Pitched tier">
                {isMM ? (
                  <span className="font-semibold text-cs-lavender">
                    M/M Listing — $397/mo
                  </span>
                ) : (
                  <span className="font-semibold text-cs-blue-dark">
                    Verified — $297/mo
                  </span>
                )}
              </DataRow>
            </dl>
          </div>

          {/* Notes */}
          <div className="rounded-card border border-cs-border bg-white p-5">
            <h2 className="mb-3 font-sans text-base font-semibold text-cs-blue-dark">
              Notes ({(notes || []).length})
            </h2>

            {/* Add-note form */}
            <NoteFormClient leadId={lead.id} facilityId={facility.id} />

            <ul className="mt-4 space-y-3">
              {(notes || []).length === 0 ? (
                <li className="text-sm text-cs-muted">
                  No notes yet. Add the first one above.
                </li>
              ) : (
                notes!.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-btn border border-cs-border bg-cs-blue-light/40 p-3 text-sm"
                  >
                    <p className="whitespace-pre-wrap text-cs-body">{n.body}</p>
                    <p className="mt-2 text-[11px] text-cs-muted">
                      {n.author || "admin"} ·{" "}
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Right: lead actions */}
        <div className="space-y-4">
          <LeadActions
            facilityId={facility.id}
            leadId={lead.id}
            currentStatus={lead.status}
            currentSource={lead.source}
            currentPriority={lead.priority || 0}
            currentValueEstimate={lead.value_estimate ?? null}
            currentNextFollowup={lead.next_followup_at}
            currentLastContacted={lead.last_contacted_at}
            isMM={isMM}
          />
        </div>
      </div>
    </div>
  );
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-cs-muted">{label}</dt>
      <dd className="mt-0.5 text-cs-body">{children}</dd>
    </div>
  );
}

