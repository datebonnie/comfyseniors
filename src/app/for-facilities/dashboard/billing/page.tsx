import { getUserFacility } from "@/lib/auth";
import { redirect } from "next/navigation";
import StripeButton from "@/components/ui/StripeButton";

export default async function BillingPage() {
  const facility = await getUserFacility();
  if (!facility) redirect("/for-facilities/dashboard");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-cs-blue-dark">Billing</h1>
        <p className="mt-1 text-sm text-cs-muted">
          Manage your subscription and featured listing status.
        </p>
      </div>

      {/* Current plan */}
      <div className="mb-8 max-w-xl rounded-card border border-cs-border bg-white p-6">
        <h2 className="mb-2 font-semibold text-cs-blue-dark">Current plan</h2>
        {facility.is_featured ? (
          <div>
            <span className="inline-block rounded-full bg-cs-blue px-3 py-1 text-sm font-semibold text-white">
              Featured
            </span>
            <p className="mt-3 text-sm text-cs-body">
              Your facility appears at the top of search results with a
              &ldquo;Featured&rdquo; badge. Families see you first.
            </p>
            <p className="mt-2 text-xs text-cs-muted">
              To manage your subscription or cancel, contact{" "}
              <a
                href="mailto:hello@comfyseniors.com"
                className="text-cs-blue hover:underline"
              >
                hello@comfyseniors.com
              </a>
            </p>
          </div>
        ) : (
          <div>
            <span className="inline-block rounded-full border border-cs-border px-3 py-1 text-sm font-medium text-cs-muted">
              Free listing
            </span>
            <p className="mt-3 text-sm text-cs-body">
              Your facility is listed with basic information. Upgrade to
              Featured for top placement, enhanced profile, and direct
              family inquiries.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade section */}
      {!facility.is_featured && (
        <div className="max-w-xl rounded-card border-2 border-cs-blue bg-cs-blue-light p-6">
          <h2 className="mb-2 font-semibold text-cs-blue-dark">
            Upgrade to Featured
          </h2>
          <p className="text-sm text-cs-body">
            Get seen first by NJ families searching for care.
          </p>

          <ul className="mt-4 space-y-2">
            {[
              "Top of search results",
              "\"Featured\" badge on your listing",
              "Direct inquiry button",
              "Enhanced profile with details",
              "Priority in Care Match Quiz results",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-cs-body"
              >
                <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2">
            <StripeButton
              plan="annual"
              className="w-full rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
            >
              Upgrade — $200/mo (billed annually)
            </StripeButton>
            <StripeButton
              plan="monthly"
              className="w-full rounded-btn border border-cs-border px-6 py-2.5 text-sm font-medium text-cs-body transition-colors hover:bg-white"
            >
              Or $300/mo billed monthly
            </StripeButton>
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
          rent applies. This is tracked through referral codes — mark
          conversions in the{" "}
          <a
            href="/for-facilities/dashboard/inquiries"
            className="text-cs-blue hover:underline"
          >
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
