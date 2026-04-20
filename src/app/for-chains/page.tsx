import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import PortfolioLeadForm from "./PortfolioLeadForm";

export const metadata: Metadata = {
  title: "Portfolio Deals for 25+ Senior Care Facilities — ComfySeniors",
  description:
    "Operating 25+ senior care facilities? One contract. One invoice. Bulk verified-listing pricing and a dedicated point of contact. Custom portfolio deals from ComfySeniors.",
};

const valueProps = [
  {
    title: "One contract, not 25 separate invoices",
    body: "A single Master Services Agreement covers every facility in your portfolio. Centralized billing, annual or monthly, direct ACH available at scale.",
  },
  {
    title: "Bulk pricing that beats per-facility rates",
    body: "Custom discount off the $297/mo Verified tier scaling with portfolio size. We'll show you the math on a 15-minute call — no PDF-forward drip sequence.",
  },
  {
    title: "Dedicated operator relationship",
    body: "One human you email — same person every time. Facility onboarding help, dashboard access for regional managers, and quarterly portfolio reports showing inquiry and conversion stats across every location.",
  },
];

export default function ForChainsPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">For multi-facility operators</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            25+ facilities? We build portfolio deals.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            One contract. One invoice. All your facilities, verified and
            saving you money. Portfolio deals are custom-negotiated — no
            pricing page, no self-serve checkout.
          </p>
        </div>
      </section>

      {/* Value prop */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {valueProps.map((v) => (
              <div
                key={v.title}
                className="rounded-card border border-cs-border bg-white p-6"
              >
                <h3 className="font-sans text-base font-semibold text-cs-blue-dark">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cs-body">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Tell us about your portfolio
            </h2>
            <p className="mt-2 text-sm text-cs-muted">
              We&apos;ll reach out within one business day. Six fields, no
              marketing spam.
            </p>
          </div>

          <PortfolioLeadForm />
        </div>
      </section>

      {/* Alternative path */}
      <section className="bg-cs-lavender-mist py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 font-display text-xl font-normal text-cs-blue-dark sm:text-2xl">
            Under 25 facilities?
          </h2>
          <p className="mb-6 text-sm text-cs-muted">
            Single-facility operators use our standard tiers — Claim at
            $97/month or Grow at $297/month. Self-serve, Stripe checkout,
            live in minutes.
          </p>
          <Link
            href="/for-facilities"
            className="inline-flex items-center justify-center rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
          >
            See single-facility pricing
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
