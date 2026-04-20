/**
 * Hand-coded static preview of the real /for-facilities/dashboard
 * overview. Mirrors the actual layout — 3 stat cards + 4 quick-action
 * tiles — so what facility admins see on this page is what they get
 * post-signup. Numbers are transparently sample data (notice the
 * fictitious facility name) — not a fabricated client.
 *
 * When the real dashboard changes, update this file to match.
 */
export default function DashboardPreview() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 text-center">
        <span className="label text-cs-lavender">Preview</span>
        <h3 className="mt-2 font-display text-xl font-normal text-cs-blue-dark">
          What you&apos;ll see after claiming
        </h3>
        <p className="mt-1 text-sm text-cs-muted">
          Every Verified facility gets this dashboard. Sample data shown.
        </p>
      </div>

      {/* Simulated dashboard frame */}
      <div className="overflow-hidden rounded-card border border-cs-border bg-cs-blue-light">
        {/* Fake browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-cs-border bg-white px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cs-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-cs-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-cs-border" />
          <span className="ml-3 text-[11px] text-cs-muted">
            comfyseniors.com / for-facilities / dashboard
          </span>
        </div>

        {/* Dashboard content */}
        <div className="p-5 sm:p-6">
          {/* Facility header */}
          <div className="mb-6">
            <h4 className="font-display text-2xl text-cs-blue-dark">
              Harmony House Assisted Living{" "}
              <span className="ml-1 text-xs text-cs-muted">(sample)</span>
            </h4>
            <p className="mt-1 text-sm text-cs-muted">
              Ridgewood, NJ 07450
              <span className="ml-2 rounded-full bg-cs-blue px-2 py-0.5 text-[10px] font-semibold text-white">
                Verified
              </span>
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total Inquiries" value="12" />
            <StatCard label="Pending Conversions" value="3" highlight />
            <StatCard label="Confirmed Move-ins" value="2" />
          </div>

          {/* Quick actions */}
          <div className="mt-6">
            <h5 className="mb-3 font-semibold text-cs-blue-dark">
              Quick actions
            </h5>
            <div className="grid gap-2 sm:grid-cols-2">
              <ActionTile
                title="View inquiries"
                desc="See all referral codes and mark conversions"
              />
              <ActionTile
                title="Edit profile"
                desc="Update your description, contact info, and amenities"
              />
              <ActionTile
                title="View public listing"
                desc="See how families see your facility page"
              />
              <ActionTile
                title="Manage subscription"
                desc="View billing and subscription details"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-cs-muted">
        Every number above is sample data. Your real dashboard pulls live
        numbers from your own facility&apos;s inquiries.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-card border p-4 ${
        highlight
          ? "border-cs-blue bg-cs-blue-light"
          : "border-cs-border bg-white"
      }`}
    >
      <p className="label text-cs-lavender">{label}</p>
      <p className="mt-1.5 font-display text-2xl text-cs-blue-dark">{value}</p>
    </div>
  );
}

function ActionTile({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-card border border-cs-border bg-white p-3">
      <p className="text-sm font-semibold text-cs-blue-dark">{title}</p>
      <p className="mt-0.5 text-xs text-cs-muted">{desc}</p>
    </div>
  );
}
