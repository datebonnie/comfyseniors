import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Legal & Disclaimers — ComfySeniors",
  description:
    "Legal notices, disclaimers, data sources, DMCA takedown policy, and contact information for ComfySeniors.com.",
};

export default function LegalPage() {
  const lastUpdated = "April 16, 2026";

  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Legal &amp; Disclaimers
          </h1>
          <p className="mt-3 text-sm text-cs-muted">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Quick nav */}
          <div className="mb-10 rounded-card border border-cs-border bg-white p-5">
            <p className="mb-3 label text-cs-muted">On this page</p>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              <li><a href="#disclaimer" className="text-cs-blue hover:underline">General Disclaimer</a></li>
              <li><a href="#not-affiliated" className="text-cs-blue hover:underline">Not Affiliated with Government</a></li>
              <li><a href="#medical" className="text-cs-blue hover:underline">No Medical or Legal Advice</a></li>
              <li><a href="#data-sources" className="text-cs-blue hover:underline">Data Sources &amp; Attribution</a></li>
              <li><a href="#ai" className="text-cs-blue hover:underline">AI-Generated Content</a></li>
              <li><a href="#pricing" className="text-cs-blue hover:underline">Pricing Estimates</a></li>
              <li><a href="#reviews" className="text-cs-blue hover:underline">Reviews Policy</a></li>
              <li><a href="#advertising" className="text-cs-blue hover:underline">Advertising Disclosure</a></li>
              <li><a href="#dmca" className="text-cs-blue hover:underline">DMCA / Copyright</a></li>
              <li><a href="#trademarks" className="text-cs-blue hover:underline">Trademarks</a></li>
              <li><a href="#accessibility" className="text-cs-blue hover:underline">Accessibility</a></li>
              <li><a href="#contact" className="text-cs-blue hover:underline">Legal Contact</a></li>
            </ul>
          </div>

          <div className="space-y-10 text-cs-body">
            <Section id="disclaimer" title="General Disclaimer">
              <p>
                ComfySeniors.com is an independent, privately owned senior
                care directory. The information on this site is provided
                &ldquo;as is&rdquo; for general informational purposes only,
                without warranty of any kind, express or implied. We do our
                best to keep data accurate and current, but errors and
                omissions are inevitable in a directory of this size.{" "}
                <strong>
                  Always verify facility details directly with the facility
                  before making a placement decision.
                </strong>
              </p>
            </Section>

            <Section id="not-affiliated" title="Not Affiliated with Any Government Agency">
              <p>
                ComfySeniors is not affiliated with, endorsed by, or
                sponsored by the Centers for Medicare &amp; Medicaid
                Services (CMS), the U.S. Department of Health &amp; Human
                Services, any state department of health, or any other
                government agency. Data sourced from these agencies is
                presented in summarized form for user convenience and is
                available in its original form on the respective agency
                websites.
              </p>
            </Section>

            <Section id="medical" title="No Medical, Legal, or Financial Advice">
              <p>
                Nothing on ComfySeniors constitutes medical advice, legal
                advice, financial advice, or a professional recommendation.
                Our AI answer engine, Care Match Quiz, cost calculator, and
                facility profiles are informational tools only. Always
                consult qualified professionals — physicians, elder-care
                attorneys, geriatric care managers, financial planners — for
                decisions about care, legal matters, or finances.
              </p>
              <p>
                In a medical emergency, call 911 or your local emergency
                number immediately. Do not use this website for emergencies.
              </p>
            </Section>

            <Section id="data-sources" title="Data Sources & Attribution">
              <p>
                Facility data on ComfySeniors is aggregated from the
                following public and third-party sources:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>Centers for Medicare &amp; Medicaid Services
                  (CMS) Provider Data Catalog</strong> — nursing home
                  ratings, staff turnover, inspection records, and
                  deficiencies.{" "}
                  <a
                    href="https://data.cms.gov/provider-data/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cs-blue hover:underline"
                  >
                    data.cms.gov
                  </a>
                </li>
                <li>
                  <strong>State department of health licensing agencies</strong>{" "}
                  for assisted living, memory care, and other facility
                  types not regulated by CMS.
                </li>
                <li>
                  <strong>Google Places API</strong> for hours of
                  operation, aggregate star ratings, and geographic
                  coordinates. Google and the Google logo are trademarks
                  of Google LLC.
                </li>
                <li>
                  <strong>Facility-submitted content</strong> — descriptions,
                  photos, amenities, and pricing provided by facilities
                  that have claimed their listing.
                </li>
              </ul>
              <p>
                Attribution to original sources is maintained wherever
                technically feasible. If you are a rights holder and
                believe content has been used incorrectly, please see our{" "}
                <a href="#dmca" className="font-semibold text-cs-blue hover:underline">
                  DMCA policy
                </a>{" "}
                below.
              </p>
            </Section>

            <Section id="ai" title="AI-Generated Content Disclosure">
              <p>
                Some content on ComfySeniors — including certain facility
                descriptions, FAQ answers, Care Match recommendations, and
                inspection summaries — is generated or assisted by large
                language models (currently Anthropic&rsquo;s Claude). AI
                content is clearly intended as a starting point, not a
                substitute for primary sources.
              </p>
              <p>
                AI systems can produce inaccurate, outdated, or
                incomplete information (&ldquo;hallucinations&rdquo;). Do not
                rely on AI-generated content for medical, legal, financial,
                or placement decisions. Always verify with authoritative
                sources and the facility directly.
              </p>
            </Section>

            <Section id="pricing" title="Pricing Estimates">
              <p>
                Prices shown on ComfySeniors are <strong>estimates</strong>{" "}
                based on regional market data, facility self-reporting, and
                industry benchmarks. Actual pricing depends on level of
                care, unit type, occupancy, move-in specials, and other
                factors that change frequently. The only binding price is
                the one quoted directly by the facility in writing.
              </p>
            </Section>

            <Section id="reviews" title="Reviews Policy">
              <p>
                Reviews on ComfySeniors reflect the personal opinions of
                the individuals who submitted them. We do not verify every
                review, but we do remove reviews that are demonstrably
                fraudulent, threatening, defamatory, or that violate our{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  Terms of Service
                </Link>
                .
              </p>
              <p>
                Facilities cannot pay to suppress, remove, or hide negative
                reviews. Verified-plan subscribers receive enhanced
                branding and dashboard features but receive no editorial
                control over reviews or ratings.
              </p>
            </Section>

            <Section id="advertising" title="Advertising & Revenue Disclosure">
              <p>
                ComfySeniors is supported by facility subscriptions (the
                Verified plan) and by optional placement referral fees paid
                by facilities when a family tours and moves in through our
                inquiry codes. We disclose this clearly because
                transparency is a core value.
              </p>
              <p>
                <strong>What paid listings do get:</strong> a &ldquo;Verified&rdquo;
                badge, enhanced profile customization, tour-question
                templates, and access to the facility dashboard.
              </p>
              <p>
                <strong>What paid listings do NOT get:</strong> preferential
                ranking in search results beyond a clearly labeled
                &ldquo;Verified&rdquo; indicator, control over reviews,
                control over inspection data, or the ability to hide
                negative information.
              </p>
            </Section>

            <Section id="dmca" title="DMCA / Copyright Takedown">
              <p>
                ComfySeniors respects the intellectual property rights of
                others. If you believe that content on our site infringes
                your copyright, please send a written notice containing
                the following information to our designated DMCA agent:
              </p>
              <ol className="list-decimal space-y-1 pl-6">
                <li>A physical or electronic signature of the copyright owner or authorized agent.</li>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Identification of the allegedly infringing material and its URL on our site.</li>
                <li>Your contact information (address, phone, email).</li>
                <li>A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the owner or authorized to act on the owner&rsquo;s behalf.</li>
              </ol>
              <p>
                Send DMCA notices to:{" "}
                <a
                  href="mailto:legal@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  legal@comfyseniors.com
                </a>
                .
              </p>
              <p>
                We will respond to valid DMCA notices promptly, typically
                within 10 business days. Repeat infringers may have their
                accounts terminated.
              </p>
            </Section>

            <Section id="trademarks" title="Trademarks">
              <p>
                <strong>ComfySeniors</strong>, the ComfySeniors logo, and
                related marks are trademarks of ComfySeniors.com. All
                other trademarks, service marks, trade names, and logos
                appearing on the site are the property of their respective
                owners, used for identification purposes only. Their use
                does not imply endorsement of or by ComfySeniors.
              </p>
            </Section>

            <Section id="accessibility" title="Accessibility Statement">
              <p>
                ComfySeniors is committed to digital accessibility. We
                strive to conform to Web Content Accessibility Guidelines
                (WCAG) 2.1 Level AA. If you encounter an accessibility
                barrier, please email{" "}
                <a
                  href="mailto:hello@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  hello@comfyseniors.com
                </a>{" "}
                with the page URL and a description of the issue, and we
                will work to resolve it.
              </p>
            </Section>

            <Section id="removal" title="Facility Listing Removal Requests">
              <p>
                A facility may request removal or correction of its public
                listing by emailing{" "}
                <a
                  href="mailto:facilities@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  facilities@comfyseniors.com
                </a>{" "}
                from a verifiable facility email address. We typically
                process verified removal requests within 10 business days.
                Information sourced from public government records (e.g.,
                CMS inspection data) may remain available as required by
                public-interest and transparency principles.
              </p>
            </Section>

            <Section id="contact" title="Legal Contact">
              <p>
                For all legal matters — DMCA notices, law-enforcement
                requests, subpoenas, and privacy inquiries — contact:
              </p>
              <div className="rounded-card border border-cs-border bg-white p-5">
                <p className="text-sm">
                  <strong>ComfySeniors.com — Legal</strong>
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:legal@comfyseniors.com"
                    className="font-semibold text-cs-blue hover:underline"
                  >
                    legal@comfyseniors.com
                  </a>
                  <br />
                  General:{" "}
                  <a
                    href="mailto:hello@comfyseniors.com"
                    className="font-semibold text-cs-blue hover:underline"
                  >
                    hello@comfyseniors.com
                  </a>
                </p>
              </div>
              <p className="pt-2">
                See also:{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                ·{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </Section>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <h2 className="mb-3 font-sans text-lg font-semibold text-cs-blue-dark">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
