import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Referral Partners — ComfySeniors",
  description:
    "Partner with ComfySeniors to help families find honest senior care. For elder law attorneys, discharge planners, social workers, and geriatric care managers.",
};

const partnerTypes = [
  {
    title: "Elder Law Attorneys",
    desc: "Your clients need care placement advice alongside legal planning. Give them a trusted, transparent resource instead of a referral service that sells their phone number.",
    benefit: "Strengthen client trust by recommending a directory that shows real prices and never harvests contact information.",
  },
  {
    title: "Hospital Discharge Planners",
    desc: "When patients need post-acute placement, families are overwhelmed and under time pressure. ComfySeniors gives them instant access to every option with real inspection records.",
    benefit: "Reduce readmissions by helping families make informed placement decisions quickly.",
  },
  {
    title: "Geriatric Care Managers",
    desc: "You know the facilities. Your clients need to see the data. ComfySeniors shows what you already know — which facilities have clean records and which don't.",
    benefit: "Back up your recommendations with transparent data that families can verify themselves.",
  },
  {
    title: "Social Workers",
    desc: "Families in crisis need honest information fast. ComfySeniors has 20,000+ facilities across 50 states with prices, inspection records, and no hidden agendas.",
    benefit: "Give families a self-service tool that respects their autonomy and privacy.",
  },
  {
    title: "Financial Advisors",
    desc: "Senior care costs are the #1 retirement expense families don't plan for. ComfySeniors shows real pricing so your clients can budget accurately.",
    benefit: "Help clients plan for care costs using actual market data, not estimates.",
  },
  {
    title: "Home Health Agencies",
    desc: "When clients need more care than you can provide at home, refer them to ComfySeniors to find the right facility — without losing their trust to a call center.",
    benefit: "Maintain the relationship by recommending a transparent resource, not a lead broker.",
  },
];

const howItWorks = [
  {
    num: "1",
    title: "Share ComfySeniors with your clients",
    desc: "Link to comfyseniors.com, the Care Match Quiz, or a specific city/state page. No signup required for families.",
  },
  {
    num: "2",
    title: "Families search and compare independently",
    desc: "They browse real prices, inspection records, and reviews at their own pace. No one calls them. No one sells their information.",
  },
  {
    num: "3",
    title: "Families contact facilities directly",
    desc: "When they're ready, they reach out on their own terms. Every inquiry gets a referral code for tracking.",
  },
];

export default function PartnersPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-cs-blue-light py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">Referral partners</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Help families find care they can trust.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            You already help families navigate senior care. Partner with
            ComfySeniors to give them transparent information — real prices,
            real inspection records, and zero phone harvesting.
          </p>
          <div className="mt-8">
            <a
              href="mailto:partners@comfyseniors.com?subject=Partnership inquiry"
              className="inline-flex rounded-btn bg-cs-blue px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-cs-blue-dark"
            >
              Become a partner
            </a>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 font-display text-2xl font-normal text-cs-blue-dark">
            Why professionals partner with us
          </h2>
          <p className="text-cs-body leading-relaxed">
            Most senior care referral services sell family contact information
            to facilities. Families get bombarded with calls before they&apos;ve
            had time to think. That erodes the trust you&apos;ve built with
            your clients.
          </p>
          <p className="mt-4 text-cs-body leading-relaxed">
            ComfySeniors is different. We never collect family phone numbers or
            emails. Families browse freely, compare honestly, and contact
            facilities when they&apos;re ready. When you recommend ComfySeniors,
            you&apos;re protecting your clients — not handing them off.
          </p>
        </div>
      </section>

      {/* Partner types */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Who we work with</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Built for the professionals families already trust.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {partnerTypes.map((partner) => (
              <div
                key={partner.title}
                className="rounded-card border border-cs-border bg-white p-6"
              >
                <h3 className="font-sans text-base font-semibold text-cs-blue-dark">
                  {partner.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cs-muted">
                  {partner.desc}
                </p>
                <p className="mt-3 rounded-btn border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-3 text-xs leading-relaxed text-cs-body">
                  <strong>Your benefit:</strong> {partner.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-display text-2xl font-normal text-cs-blue-dark">
            How partnering works
          </h2>

          <div className="space-y-6">
            {howItWorks.map((step) => (
              <div key={step.num} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cs-blue text-sm font-semibold text-white">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-semibold text-cs-blue-dark">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-cs-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources to share */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center font-display text-2xl font-normal text-cs-blue-dark">
            Share these with your clients
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-cs-border bg-white p-5 text-center">
              <p className="font-semibold text-cs-blue-dark">Search directory</p>
              <p className="mt-1 text-xs text-cs-muted">
                comfyseniors.com/search
              </p>
              <Button href="/search" variant="ghost" size="sm" className="mt-3">
                Open
              </Button>
            </div>
            <div className="rounded-card border border-cs-border bg-white p-5 text-center">
              <p className="font-semibold text-cs-blue-dark">Care Match Quiz</p>
              <p className="mt-1 text-xs text-cs-muted">
                60-second matching tool
              </p>
              <Button href="/match" variant="ghost" size="sm" className="mt-3">
                Open
              </Button>
            </div>
            <div className="rounded-card border border-cs-border bg-white p-5 text-center">
              <p className="font-semibold text-cs-blue-dark">FAQ Hub</p>
              <p className="mt-1 text-xs text-cs-muted">
                AI-powered answers
              </p>
              <Button href="/faq" variant="ghost" size="sm" className="mt-3">
                Open
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cs-blue-dark py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-white sm:text-[32px]">
            Ready to partner?
          </h2>
          <p className="mt-3 text-[#8B9EC7]">
            Email us at partners@comfyseniors.com or reach out on social media
            @comfyseniors. We respond within 24 hours.
          </p>
          <div className="mt-8">
            <a
              href="mailto:partners@comfyseniors.com?subject=Partnership inquiry"
              className="inline-flex rounded-btn bg-white px-8 py-4 text-lg font-semibold text-cs-blue-dark transition-colors hover:bg-cs-blue-light"
            >
              Email us: partners@comfyseniors.com
            </a>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
