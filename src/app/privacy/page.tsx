import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy — ComfySeniors",
  description:
    "How ComfySeniors collects, uses, and protects your personal information. We never sell your data — ever.",
};

export default function PrivacyPage() {
  const lastUpdated = "April 16, 2026";

  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-cs-muted">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-card border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5">
            <p className="text-sm italic text-cs-lavender">
              <strong>Our core promise:</strong> We never sell your phone
              number, email, or personal information to anyone — not to
              facilities, not to lead aggregators, not to advertisers. Not
              now, not ever.
            </p>
          </div>

          <div className="mt-10 space-y-8 text-cs-body">
            {/* TODO (post-LLC filing): replace the sentence below with
                "ComfySeniors is operated by ComfySeniors, LLC, a New
                Jersey limited liability company formed [DATE], registered
                agent [AGENT], NJ Business Registration [BRC]." Pending
                certificate of formation — interim language below
                intentionally avoids incorrect legal claims. */}
            <Section title="1. Who We Are">
              <p>
                ComfySeniors.com (&ldquo;<strong>ComfySeniors</strong>,&rdquo;
                &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>&rdquo;)
                is an independent senior care directory, currently operated
                as a New Jersey business. This Privacy Policy explains what
                information we collect, how we use it, and your rights. By
                using our site, you agree to this policy.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>
                <strong>Information you provide directly.</strong> When you
                submit an inquiry, write a review, create a facility account,
                ask a question through our AI answer engine, or email us, we
                collect the information you share — typically your name,
                email address, phone number (optional), ZIP code, care
                preferences, and the message you write.
              </p>
              <p>
                <strong>Information collected automatically.</strong> When
                you visit the site, our analytics tool (Plausible Analytics)
                records privacy-preserving metrics such as the page you
                viewed, approximate country, referring site, device type,
                and browser. Plausible does <strong>not</strong> use cookies
                and does <strong>not</strong> track you across websites.
              </p>
              <p>
                <strong>Facility view counts.</strong> We count the number
                of times each facility listing is viewed per month. This
                count is aggregate and not tied to any individual user.
              </p>
              <p>
                <strong>Facility accounts.</strong> If a facility claims a
                listing, we collect the contact details of the authorized
                representative and basic business information.
              </p>
              <p>
                <strong>Payment information.</strong> We do not handle or
                store payment card data. All payments are processed by
                Stripe, Inc., which is PCI-DSS compliant. See{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  Stripe&rsquo;s Privacy Policy
                </a>
                .
              </p>
            </Section>

            <Section title="3. How We Use Your Information">
              <ul className="list-disc space-y-1 pl-6">
                <li>To deliver inquiries to the facility you selected.</li>
                <li>To respond to your questions or support requests.</li>
                <li>To display reviews and community feedback on facility pages.</li>
                <li>To operate facility dashboards, including inquiry tracking.</li>
                <li>To detect and prevent fraud, spam, or abuse.</li>
                <li>To improve site content, search relevance, and AI answers.</li>
                <li>To send transactional emails (receipts, inquiry confirmations, password links).</li>
                <li>To send opt-in marketing emails (only if you explicitly subscribe; unsubscribe anytime).</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </Section>

            <Section title="4. What We Do NOT Do">
              <ul className="list-disc space-y-1 pl-6">
                <li>We do <strong>not</strong> sell your personal information. Ever.</li>
                <li>We do <strong>not</strong> share your information with lead aggregators, &ldquo;placement&rdquo; networks, or data brokers.</li>
                <li>We do <strong>not</strong> allow third-party advertising networks to track you on our site.</li>
                <li>We do <strong>not</strong> use your inquiry data to train third-party AI models.</li>
              </ul>
            </Section>

            <Section title="5. When We Share Information">
              <p>We share personal information only in these specific cases:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>With the facility you inquire about.</strong> When
                  you submit an inquiry, we forward your message and contact
                  details to that single facility so they can follow up. We
                  include a tokenized referral code so the facility knows
                  the inquiry came through ComfySeniors.
                </li>
                <li>
                  <strong>With service providers.</strong> We use trusted
                  vendors to operate the site: Supabase (database &amp;
                  auth), Resend (email delivery), Stripe (payments),
                  Plausible (privacy-first analytics), Vercel (hosting),
                  and Anthropic (AI answer engine). These vendors may
                  process your data solely to provide services to us, under
                  confidentiality and data-protection obligations.
                </li>
                <li>
                  <strong>When legally required.</strong> We may disclose
                  information to comply with a subpoena, court order, or
                  applicable law, or to protect the rights, safety, or
                  property of ComfySeniors or others.
                </li>
                <li>
                  <strong>In a business transfer.</strong> If ComfySeniors
                  is ever acquired or merged, user information may be
                  transferred to the successor entity, subject to the same
                  privacy commitments.
                </li>
              </ul>
            </Section>

            <Section title="6. Cookies and Tracking">
              <p>
                We keep cookies to the absolute minimum. We use only:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>Essential cookies</strong> for logged-in facility
                  accounts (session auth only).
                </li>
                <li>
                  <strong>No advertising cookies.</strong>
                </li>
                <li>
                  <strong>No third-party social-media tracking pixels.</strong>
                </li>
              </ul>
              <p>
                Our analytics provider, Plausible, is cookieless by design.
              </p>
            </Section>

            <Section title="7. Data Retention">
              <p>
                We retain personal information only as long as reasonably
                necessary for the purposes described above. Inquiry records
                are retained for up to 3 years for fraud prevention and
                referral accounting. Facility account data is retained for
                the duration of the account plus 1 year after closure.
                Analytics data is aggregated and retained indefinitely in
                non-identifying form.
              </p>
            </Section>

            <Section title="8. Your Rights">
              <p>
                Depending on where you live, you may have rights to:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Access the personal information we hold about you.</li>
                <li>Correct inaccurate information.</li>
                <li>Delete your information (&ldquo;right to be forgotten&rdquo;).</li>
                <li>Opt out of marketing emails at any time.</li>
                <li>Receive a portable copy of your data.</li>
                <li>Opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information (we don&rsquo;t do this anyway).</li>
              </ul>
              <p>
                To exercise any right, email us at{" "}
                <a
                  href="mailto:hello@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  hello@comfyseniors.com
                </a>
                . We will respond within 30 days.
              </p>
            </Section>

            <Section title="9. California Residents (CCPA/CPRA)">
              <p>
                California residents have specific rights under the CCPA and
                CPRA, including the right to know, delete, correct, and opt
                out of &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of
                personal information. ComfySeniors does not sell or share
                personal information as those terms are defined under
                California law. To submit a verifiable consumer request,
                email{" "}
                <a
                  href="mailto:hello@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  hello@comfyseniors.com
                </a>
                .
              </p>
            </Section>

            <Section title="10. Children&rsquo;s Privacy">
              <p>
                ComfySeniors is not intended for children under 18. We do
                not knowingly collect personal information from children.
                If you believe a child has provided us with personal
                information, please contact us and we will delete it.
              </p>
            </Section>

            <Section title="11. Security">
              <p>
                We use industry-standard measures — HTTPS encryption,
                hashed passwords (via Supabase Auth), row-level security,
                and access controls — to protect your information. No
                system is perfectly secure, and we cannot guarantee
                absolute security. Please use a strong, unique password for
                your facility account.
              </p>
            </Section>

            <Section title="12. International Users">
              <p>
                ComfySeniors operates in the United States. If you access
                the site from outside the U.S., your information may be
                transferred to, stored, and processed in the U.S. under
                U.S. law.
              </p>
            </Section>

            <Section title="13. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time.
                Material changes will be posted here with a new
                &ldquo;Last updated&rdquo; date. Significant changes may
                also be announced via email to registered users.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>
                Questions, concerns, or privacy requests? Email{" "}
                <a
                  href="mailto:hello@comfyseniors.com"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  hello@comfyseniors.com
                </a>
                . Also see our{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal"
                  className="font-semibold text-cs-blue hover:underline"
                >
                  Legal Disclaimers
                </Link>
                .
              </p>
            </Section>
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
