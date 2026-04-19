import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/admin-auth";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-cs-blue-light text-cs-blue-dark",
  contacted: "bg-yellow-100 text-yellow-800",
  replied: "bg-cs-lavender/15 text-cs-lavender",
  demo: "bg-orange-100 text-orange-800",
  paying: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  unresponsive: "bg-gray-100 text-gray-700",
};

interface SearchParams {
  status?: string;
  segment?: string;
  state?: string;
  followup?: string;
  q?: string;
  page?: string;
}

const PAGE_SIZE = 50;

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createAdminSupabaseClient();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  // Build the facilities query — facilities with email are the lead
  // universe. We left-join CRM data via a follow-up query (PostgREST
  // doesn't support left-join elegantly without a view).
  let q = supabase
    .from("facilities")
    .select(
      "id,name,slug,city,state,email,phone,care_types,accepts_medicaid,accepts_medicare,price_min,value_score",
      { count: "exact" }
    )
    .not("email", "is", null);

  if (searchParams.state) {
    q = q.eq("state", searchParams.state.toUpperCase());
  }
  if (searchParams.segment === "medicaid") {
    q = q.or("accepts_medicaid.eq.true,accepts_medicare.eq.true");
  } else if (searchParams.segment === "private-pay") {
    q = q.eq("accepts_medicaid", false).eq("accepts_medicare", false);
  }
  if (searchParams.q) {
    q = q.ilike("name", `%${searchParams.q}%`);
  }

  q = q
    .order("name", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  const { data: facilitiesRaw, count, error: facError } = await q;

  type FacilityRow = {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    state: string | null;
    email: string | null;
    phone: string | null;
    care_types: string[] | null;
    accepts_medicaid: boolean | null;
    accepts_medicare: boolean | null;
    price_min: number | null;
    value_score: number | null;
  };

  type CrmRow = {
    facility_id: string;
    status: string;
    priority: number | null;
    last_contacted_at: string | null;
    next_followup_at: string | null;
    value_estimate: number | null;
  };

  const facilities = (facilitiesRaw as FacilityRow[] | null) ?? [];

  // Fetch CRM rows for the facilities on this page in one shot
  const ids = facilities.map((f) => f.id);

  let crmRows: CrmRow[] = [];
  if (ids.length > 0) {
    const { data: crmRaw } = await supabase
      .from("crm_facility_leads")
      .select("facility_id,status,priority,last_contacted_at,next_followup_at,value_estimate")
      .in("facility_id", ids);
    crmRows = (crmRaw as CrmRow[] | null) ?? [];
  }

  const crmByFacility = new Map<string, CrmRow>(
    crmRows.map((r) => [r.facility_id, r])
  );

  // Apply status filter (post-fetch since lazy CRM rows may not exist)
  const defaultCrm: CrmRow = {
    facility_id: "",
    status: "new",
    priority: 0,
    last_contacted_at: null,
    next_followup_at: null,
    value_estimate: null,
  };

  let rows = facilities.map((f) => ({
    ...f,
    crm: crmByFacility.get(f.id) ?? defaultCrm,
  }));

  if (searchParams.status) {
    rows = rows.filter((r) => r.crm.status === searchParams.status);
  }
  if (searchParams.followup === "overdue") {
    const now = new Date();
    rows = rows.filter(
      (r) =>
        r.crm.next_followup_at !== null &&
        new Date(r.crm.next_followup_at) < now
    );
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cs-blue-dark">Leads</h1>
          <p className="mt-1 text-sm text-cs-muted">
            {count?.toLocaleString() || 0} facilities with emails. Showing
            page {page} of {totalPages}.
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="rounded-btn border border-cs-border bg-white px-3 py-1.5 text-xs font-medium text-cs-body transition-colors hover:border-cs-blue"
        >
          Clear filters
        </Link>
      </div>

      {/* Filter bar */}
      <form
        action="/admin/leads"
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-card border border-cs-border bg-white p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="label mb-1 block text-cs-muted">Search by name</label>
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="Sunrise…"
            className="w-full rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
          />
        </div>
        <div>
          <label className="label mb-1 block text-cs-muted">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
          >
            <option value="">Any</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="demo">Demo scheduled</option>
            <option value="paying">Paying</option>
            <option value="lost">Lost</option>
            <option value="unresponsive">Unresponsive</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 block text-cs-muted">Segment</label>
          <select
            name="segment"
            defaultValue={searchParams.segment || ""}
            className="rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
          >
            <option value="">Any</option>
            <option value="medicaid">Medicare/Medicaid</option>
            <option value="private-pay">Private-pay</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 block text-cs-muted">State</label>
          <input
            type="text"
            name="state"
            maxLength={2}
            defaultValue={searchParams.state || ""}
            placeholder="NJ"
            className="w-16 rounded-btn border border-cs-border bg-white px-3 py-2 text-sm uppercase outline-none focus:border-cs-blue"
          />
        </div>
        <div>
          <label className="label mb-1 block text-cs-muted">Follow-up</label>
          <select
            name="followup"
            defaultValue={searchParams.followup || ""}
            className="rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
          >
            <option value="">Any</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-btn bg-cs-blue px-4 py-2 text-sm font-medium text-white hover:bg-cs-blue-dark"
        >
          Apply
        </button>
      </form>

      {facError && (
        <div className="rounded-card border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Error loading facilities: {facError.message}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-card border border-cs-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cs-border bg-cs-blue-light text-left">
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Facility</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Location</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Status</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Last contact</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Tier</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark">Value</th>
              <th className="px-4 py-3 font-semibold text-cs-blue-dark"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-cs-muted">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const isMM = Boolean(r.accepts_medicaid || r.accepts_medicare);
                return (
                  <tr key={r.id} className="border-b border-cs-border hover:bg-cs-blue-light/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${r.id}`}
                        className="font-medium text-cs-blue-dark hover:underline"
                      >
                        {r.name}
                      </Link>
                      <div className="text-xs text-cs-muted">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-cs-body">
                      {r.city}, {r.state}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`label inline-block rounded-full px-2 py-0.5 text-[10px] ${
                          STATUS_COLORS[r.crm.status] || STATUS_COLORS.new
                        }`}
                      >
                        {r.crm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-cs-muted">
                      {r.crm.last_contacted_at
                        ? new Date(r.crm.last_contacted_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {isMM ? (
                        <span className="rounded-full bg-cs-lavender/15 px-2 py-0.5 text-cs-lavender">
                          M/M $397
                        </span>
                      ) : (
                        <span className="rounded-full bg-cs-blue-light px-2 py-0.5 text-cs-blue-dark">
                          Verified $297
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-cs-muted">
                      Score {r.value_score ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/leads/${r.id}`}
                        className="text-xs font-medium text-cs-blue hover:underline"
                      >
                        Open →
                      </Link>
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
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count || 0)} of {count?.toLocaleString()}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <PaginationLink page={page - 1} searchParams={searchParams}>
                ← Previous
              </PaginationLink>
            )}
            {page < totalPages && (
              <PaginationLink page={page + 1} searchParams={searchParams}>
                Next →
              </PaginationLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationLink({
  page,
  searchParams,
  children,
}: {
  page: number;
  searchParams: SearchParams;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== "page") params.set(k, v);
  });
  params.set("page", String(page));
  return (
    <Link
      href={`/admin/leads?${params.toString()}`}
      className="rounded-btn border border-cs-border bg-white px-3 py-1.5 font-medium text-cs-blue-dark hover:border-cs-blue"
    >
      {children}
    </Link>
  );
}
