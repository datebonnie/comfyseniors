import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import StripeButton from "@/components/ui/StripeButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import NotVerifiedLabel from "@/components/ui/NotVerifiedLabel";

export const metadata: Metadata = {
  title: "For Facilities — ComfySeniors | Get Verified",
  description:
    "Get verified on America's most honest senior care directory. Direct family leads, zero placement fees, and full reputation tools for $297/month.",
};

const pillars = [
  {
    title: "Your listing works FOR you",
    items: [
      "Verified badge — removes the \"Not Verified\" warning families see right now",
      "Enhanced profile — photos, detailed description, amenities, custom content",
      "Inspection response — add your context next to any citations",
      "Priority placement in search results for your city and care type",
    ],
  },
  {
    title: "Direct family leads, zero referral fees",
    items: [
      "Direct inquiry button on your page — families contact you, not a call center",
      "Every inquiry tracked with a referral code — you see every lead",
      "Zero placement fees — no $5,000–$8,000 charge when someone moves in",
      "One resident from ComfySeniors pays for 17+ months of membership",
    ],
  },
  {
    title: "Reputation management",
    items: [
      "Respond to reviews publicly — show families you listen",
      "Tour question preview — see what families will ask before they visit",
      "Analytics dashboard — page views, clicks, and inquiries over 30 days",
    ],
  },
  {
    title: "Competitive intelligence",
    items: [
      "See how your pricing compares to county averages",
      "Value score vs. competitors in your area",
      "See what families in your city are searching for",
    ],
  },
];

export default function ForFacilitiesPage() {
  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">For senior care facilities</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            One empty bed costs you $6,000 a month.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            ComfySeniors puts your facility in front of families actively
            searching for care — for less than $10 a day. No placement fees.
            No referral commissions. Just families finding you directly.
          </p>
          <div className="mt-8">
            <StripeButton
              plan="verified_monthly"
              className="rounded-btn bg-cs-blue px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-cs-blue-dark"
            >
              Get Verified — $297/month
            </StripeButton>
            <p className="mt-3 text-sm text-cs-muted">
              Cancel anytime. No contracts. No setup fees.
            </p>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
            Right now, this is what families see when they find you.
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <NotVerifiedLabel size="md" />
            <span className="text-sm text-cs-muted">
              &ldquo;Warning: Not verified&rdquo; — on every page, every search
              result, every card.
            </span>
          </div>
          <p className="mt-6 text-cs-body leading-relaxed">
            Your facility is already listed on ComfySeniors. Families in your
            area are already seeing your page. The question is: are they seeing
            a &ldquo;Not Verified&rdquo; warning — or a{" "}
            <span className="inline-flex translate-y-0.5"><VerifiedBadge size="sm" /></span>{" "}
            badge that tells them your information is accurate and up to date?
          </p>
        </div>
      </section>

      {/* ─── THE OFFER ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">
              Everything you get for $297/month
            </span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              The ComfySeniors Verified membership.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-card border border-cs-border bg-white p-6"
              >
                <h3 className="mb-4 font-sans text-base font-semibold text-cs-blue-dark">
                  {pillar.title}
                </h3>
                <ul className="space-y-2.5">
                  {pillar.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-cs-body"
                    >
                      <span className="mt-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE MATH ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-card border-2 border-cs-blue bg-cs-blue-light p-6 sm:p-8">
            <h2 className="font-display text-2xl font-normal text-cs-blue-dark">
              The math that makes this obvious.
            </h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cs-blue font-semibold text-white">
                  1
                </span>
                <div>
                  <p className="font-semibold text-cs-blue-dark">
                    Every empty bed costs you $5,000–$15,000/month
                  </p>
                  <p className="mt-1 text-sm text-cs-body">
                    That&apos;s lost revenue every single month a bed sits unfilled.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cs-blue font-semibold text-white">
                  2
                </span>
                <div>
                  <p className="font-semibold text-cs-blue-dark">
                    Referral services charge $5,000–$8,000 per move-in
                  </p>
                  <p className="mt-1 text-sm text-cs-body">
                    Every time someone moves in through a referral service,
                    you lose a month&apos;s rent in fees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cs-blue font-semibold text-white">
                  3
                </span>
                <div>
                  <p className="font-semibold text-cs-blue-dark">
                    ComfySeniors Verified: $297/month. Zero placement fees.
                  </p>
                  <p className="mt-1 text-sm text-cs-body">
                    If we help you fill just one bed per year, that&apos;s a{" "}
                    <strong>20x return on investment</strong>. And you keep
                    every dollar of that first month&apos;s rent.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-btn bg-cs-blue p-5 text-center">
              <p className="text-2xl font-semibold text-white">
                $297/month &lt; one day of an empty bed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREE vs VERIFIED ─── */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
            Free listing vs. Verified.
          </h2>

          <div className="overflow-hidden rounded-card border border-cs-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cs-border bg-cs-lavender-mist">
                  <th className="px-5 py-4 text-left font-semibold text-cs-blue-dark" />
                  <th className="px-4 py-4 text-center font-semibold text-cs-muted">
                    <div className="flex flex-col items-center gap-1">
                      <NotVerifiedLabel size="sm" />
                      <span>Free</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-cs-blue">
                    <div className="flex flex-col items-center gap-1">
                      <VerifiedBadge size="sm" />
                      <span>$297/mo</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Basic listing", true, true],
                  ["Prices + inspection records shown", true, true],
                  ["\"Not Verified\" warning", true, false],
                  ["Verified badge", false, true],
                  ["Enhanced profile + photos", false, true],
                  ["Inspection response", false, true],
                  ["Priority in search results", false, true],
                  ["Direct family inquiries", false, true],
                  ["Zero placement fees", false, true],
                  ["Review responses", false, true],
                  ["Analytics dashboard", false, true],
                  ["Competitive intelligence", false, true],
                  ["Placement fee on move-in", "$5K–$8K", "$0"],
                ].map(([feature, free, verified], i) => (
                  <tr key={i} className="border-b border-cs-border last:border-0">
                    <td className="px-5 py-3 text-cs-body">{feature}</td>
                    <td className="px-4 py-3 text-center">
                      {free === true ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : free === false ? (
                        <span className="text-cs-muted">&mdash;</span>
                      ) : (
                        <span className="text-xs font-semibold text-cs-red-alert">{free}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {verified === true ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : verified === false ? (
                        <span className="text-cs-muted">&mdash;</span>
                      ) : (
                        <span className="text-xs font-semibold text-cs-green-ok">{verified}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-cs-blue-dark py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-white sm:text-[32px]">
            One bed. That&apos;s all it takes.
          </h2>
          <p className="mt-3 text-[#8B9EC7]">
            If ComfySeniors helps you fill one bed this year, you&apos;ve made
            back your entire membership 20x over. And you&apos;ll never pay a
            placement fee.
          </p>
          <div className="mt-8">
            <StripeButton
              plan="verified_monthly"
              className="rounded-btn bg-white px-8 py-4 text-lg font-semibold text-cs-blue-dark transition-colors hover:bg-cs-blue-light"
            >
              Get Verified — $297/month
            </StripeButton>
            <p className="mt-3 text-sm text-[#8B9EC7]">
              Cancel anytime. No contracts. No setup fees.
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/for-facilities/login"
              className="text-sm text-[#8B9EC7] underline transition-colors hover:text-white"
            >
              Already verified? Log in to your dashboard
            </a>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
