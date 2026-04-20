import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/admin-auth";

const EVENT_TYPES = [
  "facility_self_lookup",
  "cta_click_verified",
  "cta_click_claim",
  "cta_click_grow",
  "cta_click_founding",
  "cta_click_medicaid",
  "chain_form_submit",
] as const;

const PAGE_SIZE = 50;

interface SearchParams {
  type?: string;
  page?: string;
}

type EngagementRow = {
  id: string;
  event_type: string;
  facility_id: string | null;
  metadata: Record<string, unknown> | null;
  user_agent: string | null;
  created_at: string;
};

type FacilityLookup = { id: string; name: string; slug: string };

export default async function EngagementPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createAdminSupabaseClient();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;
  const typeFilter = searchParams.type || "";

  // Tile counts
  const nowIso = new Date().toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const baseCount = (fn: ReturnType<typeof supabase.from>) =>
    fn.select("*", { count: "exact", head: true });

  const [
    { count: last24h },
    { count: last7d },
    { count: last30d },
    { count: allTime },
  ] = await Promise.all([
    baseCount(supabase.from("engagement_events")).gte("created_at", dayAgo).lte("created_at", nowIso),
    baseCount(supabase.from("engagement_events")).gte("created_at", weekAgo).lte("created_at", nowIso),
    baseCount(supabase.from("engagement_events")).gte("created_at", monthAgo).lte("created_at", nowIso),
    baseCount(supabase.from("engagement_events")),
  ]);

  // Fetch page of rows
  let listQuery = supabase
    .from("engagement_events")
    .select("id,event_type,facility_id,metadata,user_agent,created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (typeFilter) listQuery = listQuery.eq("event_type", typeFilter);

  const { data: eventsRaw, count: totalForPage } = await listQuery;
  const events = (eventsRaw as EngagementRow[] | null) ?? [];

  // Hydrate facility names for rows that have facility_id
  const facilityIds = Array.from(
    new Set(events.map((e) => e.facility_id).filter((v): v is string => !!v))
  );
  let facilityMap = new Map<string, FacilityLookup>();
  if (facilityIds.length) {
    const { data: facilitiesRaw } = await supabase
      .from("facilities")
      .select("id,name,slug")
      .in("id", facilityIds);
    facilityMap = new Map(
      ((facilitiesRaw as FacilityLookup[] | null) ?? []).map((f) => [f.id, f])
    );
  }

  const totalPages = Math.max(1, Math.ceil((totalForPage || 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cs-blue-dark">Engagement</h1>
        <p className="mt-1 text-sm text-cs-muted">
          Facility-side signals. Anon writes from the site, read-only here.
        </p>
      </div>

      {/* Top tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStat label="Last 24h" value={last24h || 0} />
        <BigStat label="Last 7 days" value={last7d || 0} />
        <BigStat label="Last 30 days" value={last30d || 0} />
        <BigStat label="All time" value={allTime || 0} />
      </div>

      {/* Filter */}
      <form
        action="/staff/engagement"
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-card border border-cs-border bg-white p-4"
      >
        <div>
          <label className="label mb-1 block text-cs-muted">Event type</label>
          <select
            name="type"
            defaultValue={typeFilter}
            className="rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
          >
            <option value="">All</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-btn bg-cs-blue px-4 py-2 text-sm font-medium text-white hover:bg-cs-blue-dark"
        >
          Apply
        </button>
        {typeFilter && (
          <Link
            href="/staff/engagement"
            className="rounded-btn border border-cs-border bg-white px-3 py-1.5 text-xs font-medium text-cs-body hover:border-cs-blue"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-card border border-cs-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cs-border bg-cs-blue-light text-left">
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">When</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Event</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Facility</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Metadata</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">UA</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-cs-muted"
                >
                  No engagement events match these filters.
                </td>
              </tr>
            ) : (
              events.map((e) => {
                const fac = e.facility_id ? facilityMap.get(e.facility_id) : null;
                const metaPreview = e.metadata
                  ? JSON.stringify(e.metadata).slice(0, 80)
                  : "—";
                const ua = (e.user_agent || "—").slice(0, 40);
                return (
                  <tr key={e.id} className="border-b border-cs-border">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-cs-muted">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cs-blue-light px-2 py-0.5 text-[10px] font-semibold text-cs-blue-dark">
                        {e.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {fac ? (
                        <Link
                          href={`/staff/leads/${fac.id}`}
                          className="text-cs-blue hover:underline"
                        >
                          {fac.name}
                        </Link>
                      ) : (
                        <span className="text-cs-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-cs-muted">
                      {metaPreview}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-cs-muted"
                      title={e.user_agent || ""}
                    >
                      {ua}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-cs-muted">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <PageLink
                page={page - 1}
                type={typeFilter}
                label="← Previous"
              />
            )}
            {page < totalPages && (
              <PageLink page={page + 1} type={typeFilter} label="Next →" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-cs-border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-cs-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-normal text-cs-blue-dark">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function PageLink({
  page,
  type,
  label,
}: {
  page: number;
  type: string;
  label: string;
}) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("page", String(page));
  return (
    <Link
      href={`/staff/engagement?${params.toString()}`}
      className="rounded-btn border border-cs-border bg-white px-3 py-1.5 font-medium text-cs-blue-dark hover:border-cs-blue"
    >
      {label}
    </Link>
  );
}
