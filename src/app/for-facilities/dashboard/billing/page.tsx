import { getUserFacility } from "@/lib/auth";
import { redirect } from "next/navigation";
import StripeButton from "@/components/ui/StripeButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

export default async function BillingPage() {
  const facility = await getUserFacility();
  if (!facility) redirect("/for-facilities/dashboard");

  const isPro = facility.is_verified && !facility.is_featured;
  const isEnterprise = facility.is_featured;
  const isFree = !isPro && !isEnterprise;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-cs-blue-dark">Billing</h1>
        <p className="mt-1 text-sm text-cs-muted">
          Manage your subscription and plan.
        </p>
      </div>

      {/* Current plan */}
      <div className="mb-8 max-w-xl rounded-card border border-cs-border bg-white p-6">
        <h2 className="mb-2 font-semibold text-cs-blue-dark">Current plan</h2>
        {isEnterprise ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-cs-blue px-3 py-1 text-sm font-semibold text-white">
                Enterprise
              </span>
              <VerifiedBadge size="sm" />
            </div>
            <p className="mt-3 text-sm text-cs-body">
              Your facility has top placement in search results, a Featured
              badge, Verified badge, and a dedicated account manager.
            </p>
          </div>
        ) : isPro ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-cs-lavender px-3 py-1 text-sm font-semibold text-white">
                Pro
              </span>
              <VerifiedBadge size="sm" />
            </div>
            <p className="mt-3 text-sm text-cs-body">
              Your facility has a Verified badge, enhanced profile, and direct
              family inquiries. Upgrade to Enterprise for top search placement.
            </p>
          </div>
        ) : (
          <div>
            <span className="inline-block rounded-full border border-cs-border px-3 py-1 text-sm font-medium text-cs-muted">
              Basic (Free)
            </span>
            <p className="mt-3 text-sm text-cs-body">
              Your facility is listed with basic information. Upgrade to Pro for
              a Verified badge and enhanced profile, or Enterprise for maximum
              visibility.
            </p>
          </div>
        )}

        <p className="mt-3 text-xs text-cs-muted">
          To manage your subscription or cancel, contact{" "}
          <a href="mailto:facilities@comfyseniors.com" className="text-cs-blue hover:underline">
            facilities@comfyseniors.com
          </a>
        </p>
      </div>

      {/* Upgrade options */}
      {(isFree || isPro) && (
        <div className="grid max-w-xl gap-4">
          {isFree && (
            <div className="rounded-card border-2 border-cs-lavender bg-cs-lavender-light p-6">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-cs-blue-dark">
                  Upgrade to Pro
                </h3>
                <VerifiedBadge size="sm" />
              </div>
              <p className="mt-2 text-sm text-cs-body">
                Get a Verified badge, enhanced profile, and direct family inquiries.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-center gap-2 text-sm text-cs-body">
                  <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                  Verified badge — families see your info is confirmed
                </li>
                <li className="flex items-center gap-2 text-sm text-cs-body">
                  <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                  Enhanced profile with details
                </li>
                <li className="flex items-center gap-2 text-sm text-cs-body">
                  <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                  Direct inquiry button
                </li>
              </ul>
              <div className="mt-5">
                <StripeButton
                  plan="pro_annual"
                  className="w-full rounded-btn bg-cs-lavender px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-lavender/90"
                >
                  Upgrade to Pro — $10/mo (early adopter)
                </StripeButton>
              </div>
            </div>
          )}

          <div className="rounded-card border-2 border-cs-blue bg-cs-blue-light p-6">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-cs-blue-dark">
                {isPro ? "Upgrade to Enterprise" : "Go Enterprise"}
              </h3>
              <span className="label rounded-full bg-cs-blue px-2 py-0.5 text-[10px] text-white">
                Best Value
              </span>
            </div>
            <p className="mt-2 text-sm text-cs-body">
              Maximum visibility with top placement, Featured badge, and dedicated support.
            </p>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-center gap-2 text-sm text-cs-body">
                <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                Everything in Pro
              </li>
              <li className="flex items-center gap-2 text-sm text-cs-body">
                <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                Top of search results + Featured badge
              </li>
              <li className="flex items-center gap-2 text-sm text-cs-body">
                <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                Priority in Care Match Quiz
              </li>
              <li className="flex items-center gap-2 text-sm text-cs-body">
                <span className="h-[6px] w-[6px] rounded-full bg-cs-green-ok" />
                Analytics dashboard + dedicated account manager
              </li>
            </ul>
            <div className="mt-5">
              <StripeButton
                plan="enterprise_annual"
                className="w-full rounded-btn bg-cs-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
              >
                Get Enterprise — $100/mo (early adopter)
              </StripeButton>
            </div>
          </div>
        </div>
      )}

      {/* Placement fee info */}
      <div className="mt-8 max-w-xl rounded-card border border-cs-border bg-white p-6">
        <h2 className="mb-2 font-semibold text-cs-blue-dark">
          Placement fees
        </h2>
        <p className="text-sm text-cs-body">
          When a family referred through ComfySeniors becomes a resident at
          your facility, a one-time placement fee equal to one month&apos;s
          rent applies. Track referral codes in the{" "}
          <a href="/for-facilities/dashboard/inquiries" className="text-cs-blue hover:underline">
            Inquiries
          </a>{" "}
          tab.
        </p>
        <p className="mt-2 text-xs text-cs-muted">
          Per your listing agreement, all move-ins from ComfySeniors referrals
          must be reported within 30 days.
        </p>
      </div>
    </div>
  );
}
