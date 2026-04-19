import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/admin-auth";

const STATUSES = [
  { key: "new", label: "New", color: "bg-cs-blue-light text-cs-blue-dark" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { key: "replied", label: "Replied", color: "bg-cs-lavender/15 text-cs-lavender" },
  { key: "demo", label: "Demo scheduled", color: "bg-orange-100 text-orange-800" },
  { key: "paying", label: "Paying", color: "bg-green-100 text-green-800" },
  { key: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
  { key: "unresponsive", label: "Unresponsive", color: "bg-gray-100 text-gray-700" },
] as const;

export default async function AdminOverviewPage() {
  const supabase = createAdminSupabaseClient();

  // Pull every CRM row in one shot — even at 50K facilities,
  // the table itself stays small (lazy creation per facility).
  const { data: leads, error } = await supabase
    .from("crm_facility_leads")
    .select("status, value_estimate, last_contacted_at, next_followup_at");

  const byStatus = new Map<string, number>();
  let totalMrrPipeline = 0;
  let payingMrr = 0;
  let overdueFollowups = 0;
  const now = new Date();

  for (const row of leads || []) {
    byStatus.set(row.status, (byStatus.get(row.status) || 0) + 1);

    if (row.status === "paying" && row.value_estimate) {
      payingMrr += row.value_estimate;
    } else if (row.value_estimate && row.status !== "lost" && row.status !== "unresponsive") {
      totalMrrPipeline += row.value_estimate;
    }

    if (row.next_followup_at && new Date(row.next_followup_at) < now) {
      overdueFollowups += 1;
    }
  }

  // Total facilities with email = potential lead universe
  const { count: emailedFacilityCount } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true })
    .not("email", "is", null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cs-blue-dark">Overview</h1>
        <p className="mt-1 text-sm text-cs-muted">
          Sales pipeline at a glance. Click any tile to filter the leads list.
        </p>
      </div>

      {error && (
        <div className="rounded-card border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Error loading CRM data: {error.message}. Did you run migration 010?
        </div>
      )}

      {/* Big numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStat
          label="Paying MRR"
          value={`$${payingMrr.toLocaleString()}`}
          accent="green"
        />
        <BigStat
          label="Pipeline MRR (est.)"
          value={`$${totalMrrPipeline.toLocaleString()}`}
          accent="blue"
        />
        <BigStat
          label="Overdue follow-ups"
          value={overdueFollowups.toLocaleString()}
          accent={overdueFollowups > 0 ? "red" : "muted"}
          href="/admin/leads?followup=overdue"
        />
        <BigStat
          label="Universe (emailed facilities)"
          value={(emailedFacilityCount || 0).toLocaleString()}
          accent="muted"
        />
      </div>

      {/* Status pipeline */}
      <div>
        <h2 className="mb-3 font-sans text-base font-semibold text-cs-blue-dark">
          Pipeline by status
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {STATUSES.map((s) => (
            <Link
              key={s.key}
              href={`/admin/leads?status=${s.key}`}
              className="rounded-card border border-cs-border bg-white p-4 transition-colors hover:border-cs-blue"
            >
              <span
                className={`label inline-block rounded-full px-2 py-0.5 text-[10px] ${s.color}`}
              >
                {s.label}
              </span>
              <p className="mt-2 text-2xl font-semibold text-cs-blue-dark">
                {(byStatus.get(s.key) || 0).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 font-sans text-base font-semibold text-cs-blue-dark">
          Common views
        </h2>
        <div className="flex flex-wrap gap-2">
          <QuickLink href="/admin/leads">All leads</QuickLink>
          <QuickLink href="/admin/leads?status=new">New (uncontacted)</QuickLink>
          <QuickLink href="/admin/leads?status=replied">Replied — chase!</QuickLink>
          <QuickLink href="/admin/leads?followup=overdue">
            Overdue follow-ups
          </QuickLink>
          <QuickLink href="/admin/leads?segment=medicaid">
            Medicare/Medicaid only
          </QuickLink>
          <QuickLink href="/admin/leads?status=paying">
            Paying customers
          </QuickLink>
        </div>
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  accent,
  href,
}: {
  label: string;
  value: string;
  accent: "green" | "blue" | "red" | "muted";
  href?: string;
}) {
  const accentClass = {
    green: "text-green-700",
    blue: "text-cs-blue-dark",
    red: "text-red-700",
    muted: "text-cs-muted",
  }[accent];

  const content = (
    <div className="rounded-card border border-cs-border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-cs-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl font-normal ${accentClass}`}>
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-shadow hover:shadow-sm">
        {content}
      </Link>
    );
  }
  return content;
}

function QuickLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-btn border border-cs-border bg-white px-3 py-1.5 text-xs font-medium text-cs-body transition-colors hover:border-cs-blue hover:text-cs-blue-dark"
    >
      {children}
    </Link>
  );
}
