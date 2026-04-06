import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import StripeButton from "@/components/ui/StripeButton";

export const metadata: Metadata = {
  title: "For Facilities — ComfySeniors | Get Listed in NJ's Senior Care Directory",
  description:
    "List your senior care facility on ComfySeniors.com. Get found by NJ families searching for honest, transparent care options. Free and featured listings available.",
};

const valueProps = [
  {
    title: "Families trust transparency",
    desc: "ComfySeniors shows real prices, real reviews, and real inspection records. Families who find you here already trust the information they're seeing — which means higher-quality inquiries.",
  },
  {
    title: "No lead selling, ever",
    desc: "We don't sell family contact information to five competing facilities. When a family reaches out to you through ComfySeniors, that inquiry is yours alone.",
  },
  {
    title: "Every facility gets listed",
    desc: "We list every licensed NJ facility — paying or not. If your facility isn't listed, families will wonder why. Facilities that choose not to be listed must have something to hide.",
  },
  {
    title: "Direct family inquiries",
    desc: "Families contact you directly through our anonymous relay. No middleman, no sales calls, no shared leads. Just real families reaching out on their own terms.",
  },
];

const freeFeatures = [
  { feature: "Basic facility listing", free: true, featured: true },
  { feature: "Real prices displayed", free: true, featured: true },
  { feature: "State inspection records shown", free: true, featured: true },
  { feature: "Family reviews published", free: true, featured: true },
  { feature: "Care type badges", free: true, featured: true },
  { feature: "Top of search results", free: false, featured: true },
  { feature: "\"Featured\" badge on listing", free: false, featured: true },
  { feature: "Enhanced profile (photos, details)", free: false, featured: true },
  { feature: "Direct inquiry button", free: false, featured: true },
  { feature: "Analytics dashboard", free: false, featured: true },
  { feature: "Priority in Care Match Quiz results", free: false, featured: true },
];

const featuredBenefits = [
  {
    title: "Top placement in search",
    desc: "Featured facilities appear first in search results and city pages. Families see you before anyone else.",
  },
  {
    title: "Enhanced profile",
    desc: "Add photos, detailed descriptions, and highlight your amenities. Make your listing stand out with a complete, polished profile.",
  },
  {
    title: "Direct family inquiries",
    desc: "A prominent \"Send a message\" button on your profile lets families reach out directly — anonymously and on their terms.",
  },
  {
    title: "Analytics dashboard",
    desc: "See how many families viewed your listing, clicked through, and sent inquiries. Track your performance over 30 days.",
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
            Comfortable being found by NJ Families?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            ComfySeniors is where New Jersey families go for honest information
            about senior care. Every licensed facility gets listed — the only
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
              The directory families actually trust.
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

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Compare plans</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Free vs. Featured
            </h2>
            <p className="mt-3 text-cs-muted">
              Every facility gets a free listing. Featured facilities get seen first.
            </p>
          </div>

          <div className="overflow-hidden rounded-card border border-cs-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cs-border bg-cs-lavender-mist">
                  <th className="px-5 py-4 text-left font-semibold text-cs-blue-dark">
                    Feature
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-cs-muted">
                    Free
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-cs-blue">
                    Featured
                  </th>
                </tr>
              </thead>
              <tbody>
                {freeFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i < freeFeatures.length - 1 ? "border-b border-cs-border" : ""}
                  >
                    <td className="px-5 py-3.5 text-cs-body">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center">
                      {row.free ? (
                        <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                      ) : (
                        <span className="text-cs-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block h-[7px] w-[7px] rounded-full bg-cs-green-ok" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FEATURED BENEFITS ─── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Featured benefits</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              What Featured gets you.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {featuredBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-card border border-cs-border bg-cs-lavender-mist p-6"
              >
                <h3 className="font-sans text-base font-semibold text-cs-blue-dark">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cs-muted">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Pricing</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Simple, transparent pricing.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Free tier */}
            <div className="rounded-card border border-cs-border bg-white p-6 sm:p-8">
              <h3 className="font-sans text-lg font-semibold text-cs-blue-dark">
                Free Listing
              </h3>
              <p className="mt-1 text-sm text-cs-muted">
                Every licensed NJ facility
              </p>
              <p className="mt-4 font-display text-4xl text-cs-blue-dark">
                $0
                <span className="text-base font-sans text-cs-muted"> / forever</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {freeFeatures
                  .filter((f) => f.free)
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

            {/* Featured tier */}
            <div className="rounded-card border-2 border-cs-blue bg-white p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="font-sans text-lg font-semibold text-cs-blue-dark">
                  Featured
                </h3>
                <span className="label rounded-full bg-cs-blue px-2.5 py-0.5 text-[10px] text-white">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-cs-muted">
                Stand out and get found first
              </p>

              <div className="mt-4 space-y-1">
                <p className="font-display text-4xl text-cs-blue">
                  $200
                  <span className="text-base font-sans text-cs-muted"> / month</span>
                </p>
                <p className="text-xs text-cs-muted">
                  Billed annually ($2,400/yr) &mdash; save $1,200
                </p>
              </div>

              <p className="mt-2 text-sm text-cs-body">
                Or <strong className="text-cs-blue-dark">$300/month</strong> billed monthly
              </p>

              <ul className="mt-6 space-y-2.5">
                {freeFeatures.map((f) => (
                  <li key={f.feature} className="flex items-center gap-2 text-sm text-cs-body">
                    <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-cs-green-ok" />
                    {f.feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-2">
                <StripeButton
                  plan="annual"
                  className="w-full rounded-btn bg-cs-blue px-7 py-3 text-base font-medium text-white transition-colors hover:bg-cs-blue-dark"
                >
                  Upgrade to Featured — $200/mo
                </StripeButton>
                <StripeButton
                  plan="monthly"
                  className="w-full rounded-btn border border-cs-border px-7 py-2.5 text-sm font-medium text-cs-body transition-colors hover:bg-cs-blue-light"
                >
                  Or $300/mo billed monthly
                </StripeButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLACEMENT FEE DISCLOSURE ─── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-pill border border-cs-blue bg-cs-blue-light p-6 sm:p-8">
            <h3 className="font-display text-xl font-normal text-cs-blue-dark">
              Our placement fee &mdash; fully transparent
            </h3>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-cs-body">
              <p>
                For <strong>private-pay facilities</strong>: when a family we
                referred becomes a resident, we charge a one-time placement fee
                equal to <strong>one month&apos;s rent</strong>. The industry
                standard is 100&ndash;150% of first month&apos;s rent &mdash; A
                Place for Mom charges up to 150%. We charge 100%, nothing more.
              </p>
              <p>
                At current NJ assisted living rates of $5,000&ndash;$8,000/month,
                that means a typical placement fee of{" "}
                <strong>$5,000&ndash;$8,000</strong> &mdash; paid only when a
                referred family moves in.
              </p>
              <p>
                For <strong>Medicare/Medicaid facilities</strong>: flat monthly
                listing fee only ($200&ndash;$300/mo). No placement fees.
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
            Join 700+ New Jersey facilities already listed on ComfySeniors.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="rounded-btn bg-white px-7 py-3 text-base font-medium text-cs-blue-dark transition-colors hover:bg-cs-blue-light">
              Claim your free listing
            </button>
            <button className="rounded-btn border border-[#8B9EC7] px-7 py-3 text-base font-medium text-white transition-colors hover:bg-white/10">
              Upgrade to Featured
            </button>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
