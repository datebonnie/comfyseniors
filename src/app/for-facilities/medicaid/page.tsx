import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import StripeButton from "@/components/ui/StripeButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

export const metadata: Metadata = {
  title: "For Medicare & Medicaid Facilities — ComfySeniors",
  description:
    "A flat $397/month listing for skilled nursing and Medicare/Medicaid facilities. No placement fees. No surprise per-move-in charges. Designed for facilities that operate under reimbursement caps.",
};

const pillars = [
  {
    title: "Designed for reimbursement-capped facilities",
    items: [
      "Predictable $397/month. No $5K–$8K placement fee ever.",
      "Works with tight Medicare and Medicaid margins",
      "No surprise per-admission charges when a family moves in",
      "Cancel any month — no contract, no penalty",
    ],
  },
  {
    title: "Full Verified listing treatment",
    items: [
      "Verified badge replaces the \"Not Verified\" warning",
      "Your photos, description, and care philosophy — not our auto-generated copy",
      "Inspection response — add context next to any citation",
      "Priority placement when families filter by \"Accepts Medicare\" or \"Accepts Medicaid\"",
    ],
  },
  {
    title: "Direct inquiries — no middleman",
    items: [
      "Families contact you through our inquiry form",
      "Every inquiry tagged with a tracking code so you know where it came from",
      "Real-time dashboard showing page views, inquiries, and conversions",
      "Zero placement fees — keep every first-month payment",
    ],
  },
  {
    title: "Government-payer friendly",
    items: [
      "Your Medicare / Medicaid acceptance is clearly labeled to families",
      "Families filtering by accepted payer find you faster",
      "Staffing ratings and CMS data shown honestly (the good and the hard)",
      "We don't compete with you — we're not a placement service",
    ],
  },
];

export default function MedicaidFacilitiesPage() {
  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">
            For Medicare &amp; Medicaid facilities
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            A flat listing for facilities that can&apos;t afford placement fees.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            If you operate under Medicare or Medicaid reimbursement caps,
            a $5,000–$8,000 placement fee isn&apos;t a cost of doing business —
            it&apos;s a cost of going out of business. So we built a flat tier
            for you: $397 a month, no placement fees, ever.
          </p>
          <div className="mt-8">
            <StripeButton
              plan="medicaid_monthly"
              className="rounded-btn bg-cs-blue px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-cs-blue-dark"
            >
              Get Listed — $397/month
            </StripeButton>
            <p className="mt-3 text-sm text-cs-muted">
              Cancel anytime. No contracts. No setup fees.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHY A DIFFERENT TIER ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
            Why we built a separate tier for you.
          </h2>
          <div className="mt-6 space-y-4 text-cs-body leading-relaxed">
            <p>
              The standard ComfySeniors Verified plan is $297/month and costs
              most private-pay facilities nothing in net — a single move-in
              pays for the subscription for 18 months. That math works when
              you&apos;re collecting $5,000–$8,000 per month per resident out
              of pocket.
            </p>
            <p>
              For Medicare- and Medicaid-accepting facilities,{" "}
              <strong>the math is different.</strong> Government
              reimbursement is capped — often at levels that barely cover
              operating cost. A $5,000 placement fee isn&apos;t proportional
              to the revenue a Medicaid resident generates over their stay.
              For many facilities, paying it would mean refusing new Medicaid
              admissions or closing beds.
            </p>
            <p>
              Neither outcome helps the families we serve. So you get a
              different arrangement: a slightly higher flat fee than the
              private-pay Verified plan ($397 vs. $297), but{" "}
              <strong>zero</strong> per-move-in charges. Predictable,
              affordable at scale, and fair to your revenue model.
            </p>
          </div>
        </div>
      </section>

      {/* ─── THE OFFER ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">
              Everything included for $397/month
            </span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              The Medicare &amp; Medicaid listing.
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

      {/* ─── COMPARISON ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
            Which plan fits your facility?
          </h2>

          <div className="overflow-hidden rounded-card border border-cs-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cs-border bg-cs-lavender-mist">
                  <th className="px-5 py-4 text-left font-semibold text-cs-blue-dark" />
                  <th className="px-4 py-4 text-center font-semibold text-cs-blue">
                    <div className="flex flex-col items-center gap-1">
                      <VerifiedBadge size="sm" />
                      <span>Verified</span>
                      <span className="text-xs font-normal text-cs-muted">
                        $297/mo
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-cs-lavender">
                    <div className="flex flex-col items-center gap-1">
                      <span className="rounded-full bg-cs-lavender px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        M/M Listing
                      </span>
                      <span>Medicare/Medicaid</span>
                      <span className="text-xs font-normal text-cs-muted">
                        $397/mo
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Best for", "Private-pay facilities", "Medicare/Medicaid-heavy facilities"],
                  ["Monthly cost", "$297", "$397"],
                  ["Placement fee per move-in", "$0", "$0"],
                  ["Verified badge", true, true],
                  ["Enhanced profile + photos", true, true],
                  ["Priority search placement", true, true],
                  ["Direct family inquiries", true, true],
                  ["Payer filter placement", "Standard", "Priority (M/M filter)"],
                  ["Designed for reimbursement caps", false, true],
                  ["Cancel anytime", true, true],
                ].map(([feature, verified, medicaid], i) => (
                  <tr key={i} className="border-b border-cs-border last:border-0">
                    <td className="px-5 py-3 text-cs-body">{feature}</td>
                    <td className="px-4 py-3 text-center">
                      {verified === true ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : verified === false ? (
                        <span className="text-cs-muted">&mdash;</span>
                      ) : (
                        <span className="text-xs text-cs-body">{verified}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {medicaid === true ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : medicaid === false ? (
                        <span className="text-cs-muted">&mdash;</span>
                      ) : (
                        <span className="text-xs text-cs-body">{medicaid}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-sm text-cs-muted">
            Not sure which one fits? If your facility is primarily private-pay
            (assisted living, memory care, independent living) →{" "}
            <Link
              href="/for-facilities"
              className="font-semibold text-cs-blue hover:underline"
            >
              see the Verified plan
            </Link>
            . If you primarily accept Medicare or Medicaid (nursing home,
            skilled nursing, long-term care) → this page is for you.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-cs-blue-dark py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-white sm:text-[32px]">
            Predictable cost. Honest listing. Zero placement fees.
          </h2>
          <p className="mt-3 text-[#8B9EC7]">
            $397 a month, flat. No per-resident charges. No placement fees on
            Medicaid move-ins. Built for the way your facility actually
            operates.
          </p>
          <div className="mt-8">
            <StripeButton
              plan="medicaid_monthly"
              className="rounded-btn bg-white px-8 py-4 text-lg font-semibold text-cs-blue-dark transition-colors hover:bg-cs-blue-light"
            >
              Get Listed — $397/month
            </StripeButton>
            <p className="mt-3 text-sm text-[#8B9EC7]">
              Cancel anytime. No contracts. No setup fees.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/for-facilities/login"
              className="text-sm text-[#8B9EC7] underline transition-colors hover:text-white"
            >
              Already listed? Log in to your dashboard
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
