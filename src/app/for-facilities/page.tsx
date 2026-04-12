import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import StripeButton from "@/components/ui/StripeButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

export const metadata: Metadata = {
  title: "For Facilities — ComfySeniors | Get Listed in America's Senior Care Directory",
  description:
    "List your senior care facility on ComfySeniors.com. Get found by families searching for honest, transparent care options. Basic, Pro, and Enterprise plans available.",
};

const valueProps = [
  {
    title: "Families trust transparency",
    desc: "ComfySeniors shows real prices, real reviews, and real inspection records. Families who find you here already trust the information — which means higher-quality inquiries.",
  },
  {
    title: "No lead selling, ever",
    desc: "We don't sell family contact information to five competing facilities. When a family reaches out to you through ComfySeniors, that inquiry is yours alone.",
  },
  {
    title: "Every facility gets listed",
    desc: "We list every licensed facility — paying or not. If your facility isn't listed, families will wonder why. Facilities that choose not to be listed must have something to hide.",
  },
  {
    title: "Direct family inquiries",
    desc: "Families contact you directly through our anonymous relay. No middleman, no sales calls, no shared leads. Just real families reaching out on their own terms.",
  },
];

const planFeatures = [
  { feature: "Basic facility listing", basic: true, pro: true, enterprise: true },
  { feature: "Real prices displayed", basic: true, pro: true, enterprise: true },
  { feature: "Inspection records shown", basic: true, pro: true, enterprise: true },
  { feature: "Family reviews published", basic: true, pro: true, enterprise: true },
  { feature: "Care type badges", basic: true, pro: true, enterprise: true },
  { feature: "Verified badge", basic: false, pro: true, enterprise: true },
  { feature: "Enhanced profile (photos, details)", basic: false, pro: true, enterprise: true },
  { feature: "Direct inquiry button", basic: false, pro: true, enterprise: true },
  { feature: "Priority in search results", basic: false, pro: false, enterprise: true },
  { feature: "\"Featured\" badge on listing", basic: false, pro: false, enterprise: true },
  { feature: "Priority in Care Match Quiz", basic: false, pro: false, enterprise: true },
  { feature: "Analytics dashboard", basic: false, pro: false, enterprise: true },
  { feature: "Dedicated account manager", basic: false, pro: false, enterprise: true },
];

export default function ForFacilitiesPage() {
  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">For senior care facilities</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Comfortable being found by American Families?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            ComfySeniors is where families go for honest information about
            senior care. Every licensed facility gets listed — the only
            question is whether yours stands out.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="#pricing" size="lg">
              See pricing
            </Button>
            <Button href="#pricing" variant="ghost" size="lg">
              Claim your free listing
            </Button>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Why list on ComfySeniors</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              America&apos;s most trusted senior care directory.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="rounded-r-pill border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5 sm:p-6"
              >
                <h3 className="text-[14px] font-semibold text-cs-blue-dark">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cs-muted">
                  {prop.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Pricing</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Simple, transparent plans.
            </h2>
            <p className="mt-3 text-cs-muted">
              Every facility gets a free listing. Upgrade for verification,
              enhanced profiles, and top placement.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* BASIC — Free */}
            <div className="rounded-card border border-cs-border bg-white p-6 sm:p-8">
              <h3 className="font-sans text-lg font-semibold text-cs-blue-dark">
                Basic
              </h3>
              <p className="mt-1 text-sm text-cs-muted">
                Every licensed facility
              </p>
              <p className="mt-4 font-display text-4xl text-cs-blue-dark">
                $0
                <span className="text-base font-sans text-cs-muted"> / forever</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {planFeatures
                  .filter((f) => f.basic)
                  .map((f) => (
                    <li key={f.feature} className="flex items-center gap-2 text-sm text-cs-body">
                      <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                      {f.feature}
                    </li>
                  ))}
              </ul>
              <div className="mt-8">
                <Button variant="ghost" className="w-full">
                  Claim your free listing
                </Button>
              </div>
            </div>

            {/* PRO — $25/mo */}
            <div className="rounded-card border-2 border-cs-lavender bg-white p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="font-sans text-lg font-semibold text-cs-blue-dark">
                  Pro
                </h3>
                <VerifiedBadge />
              </div>
              <p className="text-sm text-cs-muted">
                Verified listing with enhanced profile
              </p>

              <div className="mt-4 space-y-1">
                <p className="font-display text-4xl text-cs-lavender">
                  $10
                  <span className="text-base font-sans text-cs-muted"> / month</span>
                </p>
                <p className="text-xs font-semibold text-cs-lavender">
                  Early adopter price — first 1,000 facilities only
                </p>
                <p className="text-xs text-cs-muted">
                  Regular price: $25/month
                </p>
              </div>

              <ul className="mt-6 space-y-2.5">
                {planFeatures
                  .filter((f) => f.pro)
                  .map((f) => (
                    <li key={f.feature} className="flex items-center gap-2 text-sm text-cs-body">
                      <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                      {f.feature}
                    </li>
                  ))}
              </ul>
              <div className="mt-8 space-y-2">
                <StripeButton
                  plan="pro_annual"
                  className="w-full rounded-btn bg-cs-lavender px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-lavender/90"
                >
                  Get Pro — $10/mo
                </StripeButton>
                <StripeButton
                  plan="pro_monthly"
                  className="w-full rounded-btn border border-cs-border px-6 py-2 text-xs font-medium text-cs-muted transition-colors hover:bg-cs-lavender-mist"
                >
                  Or $25/mo after early adopter slots fill
                </StripeButton>
              </div>
            </div>

            {/* ENTERPRISE — $250/mo */}
            <div className="rounded-card border-2 border-cs-blue bg-white p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="font-sans text-lg font-semibold text-cs-blue-dark">
                  Enterprise
                </h3>
                <span className="label rounded-full bg-cs-blue px-2.5 py-0.5 text-[10px] text-white">
                  Best Value
                </span>
              </div>
              <p className="text-sm text-cs-muted">
                Maximum visibility and dedicated support
              </p>

              <div className="mt-4 space-y-1">
                <p className="font-display text-4xl text-cs-blue">
                  $100
                  <span className="text-base font-sans text-cs-muted"> / month</span>
                </p>
                <p className="text-xs font-semibold text-cs-blue">
                  Early adopter price — first 1,000 facilities only
                </p>
                <p className="text-xs text-cs-muted">
                  Regular price: $250/month
                </p>
              </div>

              <ul className="mt-6 space-y-2.5">
                {planFeatures.map((f) => (
                  <li key={f.feature} className="flex items-center gap-2 text-sm text-cs-body">
                    <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                    {f.feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-2">
                <StripeButton
                  plan="enterprise_annual"
                  className="w-full rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
                >
                  Get Enterprise — $100/mo
                </StripeButton>
                <StripeButton
                  plan="enterprise_monthly"
                  className="w-full rounded-btn border border-cs-border px-6 py-2 text-xs font-medium text-cs-muted transition-colors hover:bg-cs-blue-light"
                >
                  Or $250/mo after early adopter slots fill
                </StripeButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Compare plans</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Feature comparison
            </h2>
          </div>

          <div className="overflow-hidden rounded-card border border-cs-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cs-border bg-cs-lavender-mist">
                  <th className="px-5 py-4 text-left font-semibold text-cs-blue-dark">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-cs-muted">
                    Basic
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-cs-lavender">
                    Pro
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-cs-blue">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i < planFeatures.length - 1 ? "border-b border-cs-border" : ""}
                  >
                    <td className="px-5 py-3.5 text-cs-body">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.basic ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : (
                        <span className="text-cs-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.pro ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : (
                        <span className="text-cs-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-cs-border bg-cs-lavender-mist">
                  <td className="px-5 py-4 font-semibold text-cs-blue-dark">
                    Price
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-cs-blue-dark">
                    Free
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-cs-lavender">$10/mo</span>
                    <br />
                    <span className="text-[10px] text-cs-muted">early adopter</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-cs-blue">$100/mo</span>
                    <br />
                    <span className="text-[10px] text-cs-muted">early adopter</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── VERIFIED BADGE SECTION ─── */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-pill border border-cs-blue bg-cs-blue-light p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <VerifiedBadge size="md" />
              <h3 className="font-display text-xl font-normal text-cs-blue-dark">
                The Verified Badge
              </h3>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-cs-body">
              <p>
                Pro and Enterprise facilities earn a <strong>Verified</strong> badge
                on their listing. This badge tells families that all information
                displayed — pricing, contact details, services, and descriptions —
                has been confirmed accurate and is actively maintained.
              </p>
              <p>
                In a market where outdated and misleading information is common,
                verification is a powerful trust signal. Families consistently
                choose verified facilities over unverified ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLACEMENT FEE DISCLOSURE ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-pill border border-cs-border bg-cs-lavender-mist p-6 sm:p-8">
            <h3 className="font-display text-xl font-normal text-cs-blue-dark">
              Placement fees &mdash; fully transparent
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-cs-body">
              <p>
                For <strong>private-pay facilities</strong>: when a family we
                referred becomes a resident, we charge a one-time placement fee
                equal to <strong>one month&apos;s rent</strong>. The industry
                standard is 100&ndash;150%. We charge 100%, nothing more.
              </p>
              <p>
                For <strong>Medicare/Medicaid facilities</strong>: flat monthly
                listing fee only. No placement fees.
              </p>
              <p className="font-medium text-cs-blue-dark">
                Every major directory charges placement fees. We just tell you
                exactly what ours are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-cs-blue-dark py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-normal text-white sm:text-[32px]">
            Ready to be found?
          </h2>
          <p className="mt-3 text-[#8B9EC7]">
            Join 16,000+ facilities already listed on ComfySeniors across 25 states.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="rounded-btn bg-white px-7 py-3 text-base font-medium text-cs-blue-dark transition-colors hover:bg-cs-blue-light">
              Claim your free listing
            </button>
            <button className="rounded-btn border border-[#8B9EC7] px-7 py-3 text-base font-medium text-white transition-colors hover:bg-white/10">
              Upgrade to Pro or Enterprise
            </button>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
