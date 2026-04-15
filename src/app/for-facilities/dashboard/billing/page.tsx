import { getUserFacility } from "@/lib/auth";
import { redirect } from "next/navigation";
import StripeButton from "@/components/ui/StripeButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

export default async function BillingPage() {
  const facility = await getUserFacility();
  if (!facility) redirect("/for-facilities/dashboard");

  const isVerified = facility.is_verified || facility.is_featured;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-cs-blue-dark">Billing</h1>
        <p className="mt-1 text-sm text-cs-muted">
          Manage your ComfySeniors membership.
        </p>
      </div>

      {/* Current plan */}
      <div className="mb-8 max-w-xl rounded-card border border-cs-border bg-white p-6">
        <h2 className="mb-2 font-semibold text-cs-blue-dark">Current plan</h2>
        {isVerified ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-cs-blue px-3 py-1 text-sm font-semibold text-white">
                Verified Member
              </span>
              <VerifiedBadge size="sm" />
            </div>
            <p className="mt-3 text-sm text-cs-body">
              Your facility is Verified. You have priority placement, direct
              family inquiries, zero placement fees, and full analytics.
            </p>
            <p className="mt-3 text-xs text-cs-muted">
              To manage your subscription or cancel, contact{" "}
              <a
                href="mailto:facilities@comfyseniors.com"
                className="text-cs-blue hover:underline"
              >
                facilities@comfyseniors.com
              </a>
            </p>
          </div>
        ) : (
          <div>
            <span className="inline-block rounded-full border border-cs-amber-warn/30 bg-[#FEF3C7] px-3 py-1 text-sm font-medium text-[#92400E]">
              Free listing — Not Verified
            </span>
            <p className="mt-3 text-sm text-cs-body">
              Your facility is listed but shows a &ldquo;Not Verified&rdquo;
              warning to families. You&apos;re also subject to placement fees
              ($5,000–$8,000) when a referred family moves in.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade */}
      {!isVerified && (
        <div className="max-w-xl rounded-card border-2 border-cs-blue bg-cs-blue-light p-6">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-cs-blue-dark">
              Get Verified
            </h3>
            <VerifiedBadge size="sm" />
          </div>
          <p className="mt-2 text-sm text-cs-body">
            $297/month. Cancel anytime. Zero placement fees.
          </p>

          <div className="mt-4 rounded-btn bg-cs-blue/10 p-4">
            <p className="text-sm font-semibold text-cs-blue-dark">
              The math:
            </p>
            <p className="mt-1 text-sm text-cs-body">
              One empty bed costs you $5,000–$15,000/month. One move-in from
              a referral service costs $5,000–$8,000. ComfySeniors Verified
              costs $297/month with zero placement fees. One bed filled per
              year = 20x ROI.
            </p>
          </div>

          <ul className="mt-4 space-y-2">
            {[
              "Verified badge — removes \"Not Verified\" warning",
              "Priority in search results",
              "Direct family inquiries",
              "Zero placement fees (saves $5K–$8K per move-in)",
              "Respond to reviews",
              "Analytics dashboard",
              "Competitive intelligence",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-cs-body"
              >
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-cs-green-ok" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <StripeButton
              plan="verified_monthly"
              className="w-full rounded-btn bg-cs-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cs-blue-dark"
            >
              Get Verified — $297/month
            </StripeButton>
            <p className="mt-2 text-center text-xs text-cs-muted">
              Cancel anytime. No contracts.
            </p>
          </div>
        </div>
      )}

      {/* Placement fee info */}
      <div className="mt-8 max-w-xl rounded-card border border-cs-border bg-white p-6">
        <h2 className="mb-2 font-semibold text-cs-blue-dark">
          Placement fees
        </h2>
        {isVerified ? (
          <div className="rounded-btn bg-cs-green-ok/10 p-3">
            <p className="text-sm font-semibold text-cs-green-ok">
              You pay zero placement fees as a Verified member.
            </p>
            <p className="mt-1 text-xs text-cs-body">
              When families find you through ComfySeniors and move in, you
              keep every dollar. No referral commissions. Ever.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-cs-body">
              As a free listing, a one-time placement fee equal to one
              month&apos;s rent applies when a referred family becomes a
              resident. Verified members pay zero placement fees.
            </p>
            <p className="mt-2 text-xs text-cs-muted">
              Upgrade to Verified to eliminate placement fees entirely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
