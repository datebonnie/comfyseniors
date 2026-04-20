import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title:
    "About Us — ComfySeniors | Bergen County Assisted Living & Memory Care",
  description:
    "Why we built ComfySeniors: real prices, real inspection records, and zero phone harvesting for Bergen County, NJ assisted living and memory care.",
};

const promises = [
  "We show real prices on every listing.",
  "We never share your contact info with anyone.",
  "We list every licensed facility — paying or not.",
  "We publish every review — positive and negative.",
  "We show state inspection records on every page.",
];

const neverList = [
  "Sell your phone number or email to facilities",
  "Take referral fees that bias our recommendations",
  "Suppress negative reviews for paying facilities",
  "Hide citations or inspection failures",
  "Require you to create an account to browse",
  "Use tracking cookies or invasive analytics",
];

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            About ComfySeniors
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-cs-muted">
            The most honest senior care directory in Bergen County, NJ.
            Built for families, not facilities.
          </p>
        </div>
      </section>

      {/* Why we built this */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            Why we built this
          </h2>
          <div className="space-y-4 text-cs-body leading-relaxed">
            <p>
              If you&apos;ve ever searched for senior care online, you know how
              it works. You find a listing site, you enter your information, and
              within minutes your phone starts ringing. Sales reps from
              facilities you&apos;ve never heard of call you at dinner, at work,
              on weekends.
            </p>
            <p>
              The biggest referral sites in this industry make money by selling
              your contact information to facilities. They earn thousands of
              dollars per referral — which means their incentive is to push you
              toward whoever pays them the most, not whoever is best for your
              family.
            </p>
            <p>
              Prices are hidden behind &ldquo;request a quote&rdquo; forms.
              Inspection records are buried. Negative reviews are suppressed.
              Everything is designed to get you on the phone with a sales team
              before you have real information.
            </p>
            <p className="font-medium text-cs-blue-dark">
              We built ComfySeniors because families deserve better.
            </p>
          </div>
        </div>
      </section>

      {/* 5 Promises */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-2xl font-normal text-cs-blue-dark">
            Our 5 promises to families
          </h2>
          <ol className="space-y-3">
            {promises.map((promise, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-r-pill border-l-[3px] border-cs-lavender bg-white p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cs-blue text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-cs-body leading-relaxed">
                  {promise}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How we make money */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            How we make money
          </h2>
          <div className="space-y-4 text-cs-body leading-relaxed">
            <p>
              We believe you should know exactly how a business makes money
              before you trust it with something as important as care for your
              family. Every major senior care directory charges facilities when
              families move in. We do too. The difference is we tell you exactly
              what it is and what we charge.
            </p>

            <p>
              ComfySeniors is <strong>free for families</strong> — always. We
              will never charge you to search, compare, or contact facilities.
            </p>

            <div className="rounded-pill border border-cs-blue bg-cs-blue-light p-5 sm:p-6">
              <h3 className="mb-4 font-sans text-lg font-semibold text-cs-blue-dark">
                How facilities pay us
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-cs-blue-dark">
                    Private-pay facilities: placement fee
                  </p>
                  <p className="mt-1 text-sm">
                    When a family we referred becomes a resident at a private-pay
                    facility, we charge that facility a one-time placement fee
                    equal to <strong>one month&apos;s rent</strong>. That&apos;s
                    it. The industry standard is 100&ndash;150% of first
                    month&apos;s rent — most major referral directories charge
                    facilities up to 150%. We charge 100%, nothing more.
                  </p>
                  <p className="mt-1 text-sm">
                    At current assisted living rates of
                    $5,000&ndash;$8,000 per month, that means a typical
                    ComfySeniors placement fee is{" "}
                    <strong>$5,000&ndash;$8,000</strong> — paid by the facility,
                    never by you.
                  </p>
                </div>

                <div className="border-t border-cs-blue/20 pt-4">
                  <p className="font-semibold text-cs-blue-dark">
                    Verified subscription: $297/month flat
                  </p>
                  <p className="mt-1 text-sm">
                    Some facilities prefer to eliminate placement fees
                    altogether and pay us a flat{" "}
                    <strong>$297 per month</strong>. Verified subscribers
                    pay this rate regardless of how many residents move in —
                    no per-family fee, ever. With a single move-in per year,
                    Verified pays for itself in about five weeks; after that,
                    every family we send them is free.
                  </p>
                  <p className="mt-1 text-sm">
                    For you, Verified changes nothing about what you see —
                    same listings, same prices, same inspection records. The
                    only visible difference is a small{" "}
                    <strong>&ldquo;Verified&rdquo; badge</strong> next to
                    a facility&apos;s name, indicating they&apos;ve claimed
                    their listing and pay us directly rather than
                    per-move-in. It&apos;s an information signal, not a
                    quality endorsement.
                  </p>
                </div>

                <div className="border-t border-cs-blue/20 pt-4">
                  <p className="font-semibold text-cs-blue-dark">
                    Medicare/Medicaid facilities: $397/month flat
                  </p>
                  <p className="mt-1 text-sm">
                    Facilities that primarily serve residents on{" "}
                    <strong>Medicare or Medicaid</strong> operate under strict
                    government reimbursement caps, which means they can&apos;t
                    absorb a $5,000&ndash;$8,000 placement fee the way
                    private-pay facilities can — if they tried, they&apos;d
                    either go out of business or stop accepting new Medicare
                    residents. Neither outcome helps families.
                  </p>
                  <p className="mt-1 text-sm">
                    So for these facilities, we charge a flat{" "}
                    <strong>$397 per month</strong> with <strong>zero</strong>{" "}
                    per-resident charges. This keeps Medicare- and
                    Medicaid-accepting facilities affordable for families who
                    depend on government coverage, while still letting us
                    sustain the directory.
                  </p>
                </div>
              </div>
            </div>

            <p>
              Featured or not, every facility gets the same honest listing with
              real prices, real reviews, and real inspection records. Payment
              never changes what we show you — it only changes where a facility
              appears in search results.
            </p>

            <p>
              We do <strong>not</strong> sell leads. We do{" "}
              <strong>not</strong> share your contact information with
              facilities. We do <strong>not</strong> earn more by steering you
              toward one facility over another.
            </p>
          </div>
        </div>
      </section>

      {/* What we will never do */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            What we will never do
          </h2>
          <ul className="space-y-3">
            {neverList.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-cs-body leading-relaxed"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B91C1C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who built this */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            Who built this
          </h2>
          <p className="mb-6 text-cs-body leading-relaxed">
            ComfySeniors was built by people who went through the same
            frustrating search you&apos;re going through now. We looked for
            honest information about senior care and found an
            industry designed to harvest our data instead of help our families.
          </p>
          <p className="text-cs-body leading-relaxed">
            So we built the directory we wished existed.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cs-blue-light py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-display text-2xl font-normal text-cs-blue-dark">
            Ready to find the right care?
          </h2>
          <p className="mb-6 text-cs-muted">
            Browse every licensed assisted living and memory care facility
            in Bergen County — no account needed.
          </p>
          <Button href="/search" size="lg">
            Start searching
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
