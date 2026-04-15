import { getUserFacility } from "@/lib/auth";
import { createAuthClient } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardOverview() {
  const facility = await getUserFacility();
  const supabase = createAuthClient();

  // Get inquiry stats
  let totalInquiries = 0;
  let pendingConversions = 0;
  let convertedCount = 0;

  if (facility) {
    const { count: total } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("facility_id", facility.id);

    const { count: converted } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("facility_id", facility.id)
      .not("converted_at", "is", null);

    totalInquiries = total ?? 0;
    convertedCount = converted ?? 0;
    pendingConversions = totalInquiries - convertedCount;
  }

  if (!facility) {
    return (
      <div>
        <h1 className="font-display text-2xl text-cs-blue-dark">
          Welcome to your dashboard
        </h1>
        <p className="mt-2 text-cs-muted">
          Your account isn&apos;t linked to a facility yet. Contact us at{" "}
          <a href="mailto:hello@comfyseniors.com" className="text-cs-blue hover:underline">
            hello@comfyseniors.com
          </a>{" "}
          to connect your facility listing.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-cs-blue-dark">
          {facility.name}
        </h1>
        <p className="mt-1 text-sm text-cs-muted">
          {facility.city}, {facility.state} {facility.zip}
          {facility.is_featured && (
            <span className="ml-2 rounded-full bg-cs-blue px-2 py-0.5 text-[10px] font-semibold text-white">
              Featured
            </span>
          )}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Inquiries"
          value={totalInquiries}
          href="/for-facilities/dashboard/inquiries"
        />
        <StatCard
          label="Pending Conversions"
          value={pendingConversions}
          href="/for-facilities/dashboard/inquiries"
          highlight={pendingConversions > 0}
        />
        <StatCard
          label="Confirmed Move-ins"
          value={convertedCount}
          href="/for-facilities/dashboard/inquiries"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-4 font-semibold text-cs-blue-dark">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/for-facilities/dashboard/inquiries"
            className="rounded-card border border-cs-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-cs-blue-dark">View inquiries</p>
            <p className="mt-1 text-xs text-cs-muted">
              See all referral codes and mark conversions
            </p>
          </Link>
          <Link
            href="/for-facilities/dashboard/profile"
            className="rounded-card border border-cs-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-cs-blue-dark">Edit profile</p>
            <p className="mt-1 text-xs text-cs-muted">
              Update your description, contact info, and amenities
            </p>
          </Link>
          <Link
            href={`/facility/${facility.slug}`}
            className="rounded-card border border-cs-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-cs-blue-dark">View public listing</p>
            <p className="mt-1 text-xs text-cs-muted">
              See how families see your facility page
            </p>
          </Link>
          <Link
            href="/for-facilities/dashboard/billing"
            className="rounded-card border border-cs-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-cs-blue-dark">
              {facility.is_featured ? "Manage subscription" : "Upgrade to Featured"}
            </p>
            <p className="mt-1 text-xs text-cs-muted">
              {facility.is_featured
                ? "View billing and subscription details"
                : "Get top placement in search results"}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-card border p-5 transition-shadow hover:shadow-md ${
        highlight
          ? "border-cs-blue bg-cs-blue-light"
          : "border-cs-border bg-white"
      }`}
    >
      <p className="label text-cs-lavender">{label}</p>
      <p className="mt-2 font-display text-3xl text-cs-blue-dark">{value}</p>
    </Link>
  );
}
