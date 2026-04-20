import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Terms of Service — ComfySeniors",
  description:
    "Terms of Service for ComfySeniors.com. Read the rules that govern your use of our senior care directory.",
};

export default function TermsPage() {
  const lastUpdated = "April 16, 2026";

  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-cs-muted">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose-cs space-y-8 text-cs-body">
            {/* TODO (full LLC metadata): formation date + NJ BRC number
                still pending. Once received, append "Filed [DATE]. NJ
                Business Registration [BRC]." to the sentence below. */}
            <div>
              <p className="text-sm leading-relaxed">
                Welcome to ComfySeniors.com (&ldquo;<strong>ComfySeniors</strong>,&rdquo;
                &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo;
                or &ldquo;<strong>our</strong>&rdquo;), operated by{" "}
                <strong>ComfySeniors LLC</strong>, a New Jersey limited
                liability company. These Terms of Service
                (&ldquo;<strong>Terms</strong>&rdquo;) govern your access
                to and use of our website, services, and content. By using
                ComfySeniors.com, you agree to be bound by these Terms. If
                you do not agree, please do not use the site.
              </p>
            </div>

            <Section title="1. Who We Are">
              <p>
                ComfySeniors is an independent, privately-owned directory of
                assisted living and memory care facilities in Bergen County,
                New Jersey. We help families research, compare, and contact
                senior care facilities. We are <strong>not</strong> a
                healthcare provider, a licensed placement agency, a medical
                professional, or a government agency.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>
                You must be at least 18 years old to use ComfySeniors. By using
                the site, you represent that you meet this requirement and that
                the information you provide is accurate.
              </p>
            </Section>

            <Section title="3. Informational Use Only — Not Medical or Legal Advice">
              <p>
                All content on ComfySeniors — including facility profiles,
                pricing estimates, inspection summaries, ratings, AI-generated
                answers, and the Care Match Quiz — is provided for{" "}
                <strong>informational purposes only</strong>. Nothing on this
                site constitutes medical advice, legal advice, financial
                advice, or a recommendation to select a specific care provider.
                Always consult qualified professionals and verify information
                directly with facilities before making placement decisions.
              </p>
            </Section>

            <Section title="4. Accuracy of Information">
              <p>
                We aggregate data from public sources, including the Centers
                for Medicare &amp; Medicaid Services (CMS), state licensing
                agencies, Google Places, and information submitted by
                facilities themselves. We also use third-party AI to summarize
                and describe facilities.
              </p>
              <p>
                While we work hard to keep data accurate, we make{" "}
                <strong>no warranty</strong> that any facility listing,
                inspection record, pricing estimate, or review is complete,
                current, or free from error. Facility details change
                frequently. <strong>Always verify directly with the facility</strong>{" "}
                before relying on any information shown here.
              </p>
            </Section>

            <Section title="5. User Conduct">
              <p>You agree not to:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Use the site for any unlawful purpose or in violation of these Terms.</li>
                <li>Submit false, defamatory, or misleading reviews or inquiries.</li>
                <li>Scrape, crawl, or harvest data from the site without written permission.</li>
                <li>Attempt to interfere with, disable, or reverse-engineer the site.</li>
                <li>Impersonate another person, facility, or entity.</li>
                <li>Use the site to transmit spam, malware, or harassing content.</li>
              </ul>
            </Section>

            <Section title="6. Inquiries, Tours, and Placements">
              <p>
                When you submit an inquiry through ComfySeniors, we forward
                your contact information (name, phone, email, and the message
                you write) to the facility you selected. We also issue a unique
                tokenized referral code (e.g., <code className="rounded bg-cs-blue-light px-1 py-0.5 text-xs">CS-XXXXX</code>)
                so facilities can identify inquiries that came through our
                directory.
              </p>
              <p>
                ComfySeniors does <strong>not</strong> sell your contact
                information to third parties, ad networks, or lead aggregators.
                See our{" "}
                <Link href="/privacy" className="font-semibold text-cs-blue hover:underline">
                  Privacy Policy
                </Link>{" "}
                for details.
              </p>
            </Section>

            <Section title="7. Reviews">
              <p>
                Reviews submitted to ComfySeniors must reflect your genuine
                experience. We reserve the right to remove any review that
                violates these Terms, appears fraudulent, contains personally
                identifying information about third parties, or is otherwise
                objectionable in our sole discretion. By submitting a review,
                you grant ComfySeniors a non-exclusive, royalty-free,
                perpetual, worldwide license to display, modify, and
                distribute your review on our platform.
              </p>
            </Section>

            <Section title="8. Facility Accounts and Subscriptions">
              <p>
                Facilities may claim a free listing or subscribe to our paid
                Verified plan. Subscription fees, billing terms, and
                cancellation terms are presented at checkout and governed by
                our payment processor, Stripe, Inc. Subscriptions auto-renew
                until canceled. You may cancel at any time through the billing
                portal; no refunds are issued for partial billing periods
                unless required by law.
              </p>
              <p>
                Facilities are solely responsible for the accuracy of content
                they submit, including descriptions, photos, pricing, and
                amenity lists. Misrepresentation may result in removal from
                the directory without refund.
              </p>
            </Section>

            <Section title="9. Referral Program">
              <p>
                Facilities enrolled in our referral program may receive or owe
                referral credits in accordance with the terms presented in
                the facility dashboard. ComfySeniors may modify or terminate
                the referral program at any time. Fraudulent referrals will
                result in forfeiture of credits and possible account
                termination.
              </p>
            </Section>

            <Section title="10. Intellectual Property">
              <p>
                All content on ComfySeniors — including text, graphics, logos,
                the ComfySeniors name and mark, software, and design — is
                owned by ComfySeniors or its licensors and is protected by
                U.S. and international copyright and trademark laws. You may
                not copy, reproduce, or redistribute our content without prior
                written permission, except for brief excerpts with proper
                attribution.
              </p>
              <p>
                Facility names, logos, and trademarks remain the property of
                their respective owners and are used here for identification
                only.
              </p>
            </Section>

            <Section title="11. Third-Party Links and Services">
              <p>
                ComfySeniors links to third-party websites (including facility
                websites, state inspection portals, and Google Maps).
                We do not control these sites and are not responsible for
                their content, privacy practices, or availability.
              </p>
            </Section>

            <Section title="12. Disclaimer of Warranties">
              <p className="uppercase text-sm">
                The site and all content are provided &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; without warranty of any kind,
                express or implied, including but not limited to warranties of
                merchantability, fitness for a particular purpose,
                non-infringement, or accuracy. ComfySeniors does not warrant
                that the site will be uninterrupted, secure, or error-free.
              </p>
            </Section>

            <Section title="13. Limitation of Liability">
              <p className="uppercase text-sm">
                To the fullest extent permitted by law, ComfySeniors and its
                owners, officers, employees, and agents shall not be liable
                for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, arising out of your use of
                the site, any facility selection made based on information
                obtained through the site, or any interaction with a listed
                facility. Our total aggregate liability shall not exceed
                one hundred U.S. dollars ($100).
              </p>
            </Section>

            <Section title="14. Indemnification">
              <p>
                You agree to defend, indemnify, and hold harmless
                ComfySeniors from any claims, damages, losses, liabilities,
                and expenses (including reasonable attorneys&rsquo; fees)
                arising out of your use of the site, your violation of these
                Terms, or your infringement of any third-party right.
              </p>
            </Section>

            <Section title="15. Dispute Resolution & Governing Law">
              <p>
                These Terms are governed by the laws of the State of New
                Jersey, without regard to its conflict-of-laws rules. Any
                dispute arising out of these Terms or your use of the site
                shall be resolved by binding individual arbitration under the
                rules of the American Arbitration Association, conducted in
                New Jersey. You waive any right to participate in a class
                action or class arbitration.
              </p>
            </Section>

            <Section title="16. Changes to These Terms">
              <p>
                We may update these Terms from time to time. Material changes
                will be posted on this page with a new &ldquo;Last updated&rdquo;
                date. Continued use of the site after changes take effect
                constitutes your acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="17. Termination">
              <p>
                We may suspend or terminate your access to the site at any
                time, for any reason, without notice. You may stop using the
                site at any time.
              </p>
            </Section>

            <Section title="18. Contact">
              <p>
                Questions about these Terms? Email us at{" "}
                <a
                  href="mailto:hello@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  hello@comfyseniors.com
                </a>
                .
              </p>
            </Section>
          </div>

          <div className="mt-12 rounded-card border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5">
            <p className="text-sm italic text-cs-lavender">
              We never sell your contact information — not to facilities, not
              to lead aggregators, not to anyone. Read more in our{" "}
              <Link href="/privacy" className="font-semibold underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 font-sans text-lg font-semibold text-cs-blue-dark">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
