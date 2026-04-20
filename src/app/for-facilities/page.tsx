import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import StripeButton from "@/components/ui/StripeButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import NotVerifiedLabel from "@/components/ui/NotVerifiedLabel";

export const metadata: Metadata = {
  title:
    "For Facilities — Bergen County, NJ Listings | ComfySeniors",
  description:
    "Remove the 'Not Verified' warning Bergen County families see next to your facility. Direct inquiries. No placement fees. $297/month, cancel anytime.",
};

const whatYouGet = [
  "Verified badge — removes the \"Not Verified\" warning families see right now",
  "Direct family inquiries — every lead routed straight to your inbox with a tracking code",
  "Zero placement fees on every move-in",
  "Enhanced profile — your photos, description, amenities",
  "Inspection response — add your context next to any citation",
  "Analytics dashboard — page views, inquiries, conversions",
];

export default function ForFacilitiesPage() {
  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">
            For Bergen County senior care facilities
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Every month you&apos;re not verified, Bergen County families see
            a warning next to your facility.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            Remove the warning. Get direct inquiries. No placement fees.
            $297/month, cancel anytime.
          </p>
          <div className="mt-8">
            <StripeButton
              plan="verified_monthly"
              className="rounded-btn bg-cs-blue px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-cs-blue-dark"
            >
              Remove my warning — $297/month
            </StripeButton>
            <p className="mt-3 text-sm text-cs-muted">
              Cancel anytime. No contracts. No setup fees.
            </p>
            <p className="mt-5 text-sm text-cs-muted">
              Primarily Medicare or Medicaid?{" "}
              <Link
                href="/for-facilities/medicaid"
                className="font-semibold text-cs-lavender hover:underline"
              >
                See the Medicare/Medicaid tier &rarr;
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
            Right now, this is what Bergen County families see when they
            find you.
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <NotVerifiedLabel size="md" />
            <span className="text-sm text-cs-muted">
              &ldquo;Warning: Not verified&rdquo; — on every page, every search
              result, every card.
            </span>
          </div>
          <p className="mt-6 text-cs-body leading-relaxed">
            Your facility is already listed on ComfySeniors. Families in
            Bergen County are already seeing your page. The question is:
            are they seeing a &ldquo;Not Verified&rdquo; warning — or a{" "}
            <span className="inline-flex translate-y-0.5"><VerifiedBadge size="sm" /></span>{" "}
            badge that tells them your information is accurate and up to date?
          </p>
        </div>
      </section>

      {/* ─── WHAT YOU GET (single section) ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">
              Everything you get for $297/month
            </span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              What you get.
            </h2>
          </div>

          <div className="rounded-card border border-cs-border bg-white p-6 sm:p-8">
            <ul className="space-y-3">
              {whatYouGet.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base text-cs-body"
                >
                  <span className="mt-2 inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                  {item}
                </li>
              ))}
            </ul>
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

      {/* ─── FREE vs VERIFIED comparison table (unchanged — best converter) ─── */}
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

      {/* ─── TWO PRICING TIERS (Claim vs Grow) ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
            Pick your tier.
          </h2>
          <p className="mb-10 text-center text-sm text-cs-muted">
            Both tiers remove the &ldquo;Not Verified&rdquo; warning. Grow
            adds direct inquiries, enhanced profile, and analytics.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Claim — $97 */}
            <div className="rounded-card border border-cs-border bg-white p-6">
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className="font-display text-xl text-cs-blue-dark">
                  Claim
                </h3>
                <p className="text-2xl font-semibold text-cs-blue-dark">
                  $97
                  <span className="text-sm font-normal text-cs-muted">/mo</span>
                </p>
              </div>
              <p className="mb-4 text-xs uppercase tracking-wide text-cs-muted">
                The basics, fast
              </p>

              <ul className="mb-6 space-y-2">
                {[
                  "Verified badge — removes \"Not Verified\" warning",
                  "Basic verified profile (your description + amenities)",
                  "Respond to reviews publicly",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-cs-body"
                  >
                    <span className="mt-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                    {item}
                  </li>
                ))}
              </ul>

              <StripeButton
                plan="claim_monthly"
                className="block w-full rounded-btn border border-cs-blue bg-white px-6 py-3 text-center text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
              >
                Claim my listing — $97/month
              </StripeButton>
            </div>

            {/* Grow — $297 (recommended, highlighted) */}
            <div className="relative rounded-card border-2 border-cs-lavender bg-cs-lavender-mist p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-cs-lavender px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Recommended
              </span>

              <div className="mb-1 flex items-baseline justify-between">
                <h3 className="font-display text-xl text-cs-blue-dark">
                  Grow
                </h3>
                <p className="text-2xl font-semibold text-cs-blue-dark">
                  $297
                  <span className="text-sm font-normal text-cs-muted">/mo</span>
                </p>
              </div>
              <p className="mb-4 text-xs uppercase tracking-wide text-cs-lavender">
                Everything in Claim, plus inquiries
              </p>

              <ul className="mb-6 space-y-2">
                {[
                  "Everything in Claim",
                  "Direct inquiry button on your facility page",
                  "Enhanced profile with photos",
                  "Priority placement in search results",
                  "Analytics dashboard (views, inquiries, conversions)",
                  "Competitive intelligence (county pricing, value scores)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-cs-body"
                  >
                    <span className="mt-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-lavender" />
                    {item}
                  </li>
                ))}
              </ul>

              <StripeButton
                plan="verified_monthly"
                className="block w-full rounded-btn bg-cs-blue px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
              >
                Remove my warning — $297/month
              </StripeButton>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
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
              Remove my warning — $297/month
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
