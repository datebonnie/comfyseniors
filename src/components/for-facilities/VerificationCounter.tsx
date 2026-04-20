import { createClient } from "@/lib/supabase";

/**
 * Server component. Two display modes:
 *   - count > 0: "[count] Bergen County facilities verified this month"
 *     with the 3 most recent verified names + dates.
 *   - count == 0: Founding Member fallback — "first 20 facilities get
 *     $197/mo for life. N/20 claimed so far."
 *
 * "Verified this month" means verified_at ≥ start of the current calendar
 * month, AND verified_at_is_estimated = false (don't count backfilled
 * rows — their dates aren't real verifications, and counting them would
 * violate the "never fabricate" constraint).
 */
export default async function VerificationCounter() {
  const supabase = createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: monthCount },
    { data: recent },
    { count: foundingCount },
  ] = await Promise.all([
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true)
      .eq("verified_at_is_estimated", false)
      .gte("verified_at", monthStart),
    supabase
      .from("facilities")
      .select("name, verified_at")
      .eq("is_verified", true)
      .eq("verified_at_is_estimated", false)
      .not("verified_at", "is", null)
      .order("verified_at", { ascending: false })
      .limit(3),
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("subscription_tier", "founding"),
  ]);

  const verifiedThisMonth = monthCount || 0;
  const foundingClaimed = foundingCount || 0;

  // ── Fallback: Founding Member pitch when nobody's verified this month ──
  if (verifiedThisMonth === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-card border-l-[3px] border-cs-lavender bg-cs-lavender-mist px-5 py-4 text-sm">
        <p className="font-semibold text-cs-blue-dark">
          Founding Member program
        </p>
        <p className="mt-1 text-cs-body">
          First 20 Bergen County facilities get{" "}
          <strong>$197/month for life</strong>.{" "}
          <strong>
            {foundingClaimed}/20 claimed
          </strong>{" "}
          so far.
        </p>
      </div>
    );
  }

  // ── Live counter: real verifications this month ──
  return (
    <div className="mx-auto max-w-2xl rounded-card border border-cs-border bg-white px-5 py-4 text-sm">
      <p className="font-semibold text-cs-blue-dark">
        {verifiedThisMonth}{" "}
        {verifiedThisMonth === 1 ? "facility" : "facilities"} verified this
        month
      </p>
      {recent && recent.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-cs-body">
          {recent.map((r, i) => (
            <li
              key={`${r.name}-${i}`}
              className="text-xs"
            >
              <span className="font-medium text-cs-blue-dark">{r.name}</span>
              {r.verified_at && (
                <span className="ml-2 text-cs-muted">
                  {new Date(r.verified_at as string).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
