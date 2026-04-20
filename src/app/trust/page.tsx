import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Trust & Security — ComfySeniors",
  description:
    "Who runs ComfySeniors, where your data lives, our promises, and straight answers to security questions from Bergen County senior care facilities.",
};

/**
 * Final commitments copy approved by the founder. Do not edit without
 * explicit approval — these are on-brand promises with specific
 * numeric claims that need to stay accurate as the product evolves.
 */
const commitments: { title: string; body: React.ReactNode }[] = [
  {
    title: "We will never charge you a placement fee.",
    body: (
      <>
        Not 30% of first month&apos;s rent. Not 60%. Nothing. Referral
        services built a $3B industry by taxing your move-ins. We
        don&apos;t. When a family finds you through ComfySeniors, you
        pay us nothing beyond your flat monthly subscription.
      </>
    ),
  },
  {
    title: "Families contact you directly. We never broker the inquiry.",
    body: (
      <>
        Every inquiry button on your page is a <code>tel:</code> link or
        a <code>mailto:</code> link to YOU. We don&apos;t sit in the
        middle. We don&apos;t &ldquo;qualify&rdquo; leads. We don&apos;t
        sell your warm lead to three of your competitors. The family
        emails you, the family calls you, the relationship is yours from
        the first word.
      </>
    ),
  },
  {
    title: "You will never be outranked by whoever paid the most.",
    body: (
      <>
        We don&apos;t sell placement. Search results are ranked by
        relevance to the family&apos;s criteria — location, care type,
        budget — and by verification status. A facility cannot buy its
        way above yours inside the same tier. Verified facilities do
        rank above unverified facilities for the same search — that&apos;s
        the point of verification. What we don&apos;t do: let anyone pay
        for a higher position among Verified facilities. Inside the
        tier, everyone competes on accuracy, reviews, and family fit —
        never on payment.
      </>
    ),
  },
  {
    title:
      "Your citations are your story to tell, not a weapon we use against you.",
    body: (
      <>
        When state health departments publish inspection citations, we
        publish them too — transparency is non-negotiable for families.
        But Verified facilities can post a public response next to any
        citation, in your own words. Families see what happened AND what
        you did about it. No other directory does this. We can do this
        together, to bring comfort to these families.
      </>
    ),
  },
  {
    title:
      "If you ever feel misrepresented on ComfySeniors, you email me personally.",
    body: (
      <>
        No <code>support@</code>. Not a ticket system.{" "}
        <a
          href="mailto:bmontero@comfyseniors.com"
          className="font-semibold text-cs-blue hover:underline"
        >
          bmontero@comfyseniors.com
        </a>
        . I respond within 24 hours, every time. When this business is
        big enough that I can&apos;t, I&apos;ll rewrite this promise.
      </>
    ),
  },
];

const securityFaqs: { q: string; a: string }[] = [
  {
    q: "Is my facility's data sold or shared?",
    a: "No. Not to other facilities, not to lead aggregators, not to advertisers. Your public profile is built from public data (NJ Department of Health licensing, CMS inspection records, Google Places). Anything you add via the dashboard — photos, descriptions, amenities — is yours and not resold. See our Privacy Policy for the legal detail.",
  },
  {
    q: "Who can see my dashboard analytics?",
    a: "Only you, via magic-link login tied to your facility's email. We do not share your page-view or inquiry counts with other facilities, partners, or advertisers. An internal ComfySeniors admin (one person) can see aggregate numbers for debugging and billing purposes.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your Verified or Claim status turns off at the end of the billing period and your listing reverts to the public default (built from the same public data everyone else has). Custom content you added via the dashboard — photos, description overrides — is retained in your row for up to 12 months in case you return, then deleted on written request. To request immediate deletion, email facilities@comfyseniors.com.",
  },
  {
    q: "Is ComfySeniors HIPAA compliant?",
    a: "HIPAA does not apply to us because we do not collect Protected Health Information (PHI). Our directory contains facility information and family inquiry metadata (name, ZIP, care interest), never patient medical records. If you plan to share PHI with us — don't. Keep HIPAA-protected resident data in your own systems.",
  },
  {
    q: "Where are your servers located and who hosts them?",
    a: "Our application runs on Vercel (AWS us-east-1 region). Our database runs on Supabase (AWS us-east-1). Payments are processed by Stripe (SOC 2 Type II, PCI DSS Level 1). Email delivery is handled by Resend. Analytics is Plausible, which is cookieless and GDPR-compliant by default. All traffic is HTTPS.",
  },
];

export default function TrustPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-cs-blue-light py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">Trust &amp; Security</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Who runs this, where your data lives, what we promise.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            ComfySeniors is an independent Bergen County directory. Facility
            admins pay $97–$397/month for listings. We never sell family
            contact information. This page exists so you can verify both
            claims before trusting us with your facility data.
          </p>
        </div>
      </section>

      {/* Who runs this — founder bio */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-display text-2xl font-normal text-cs-blue-dark">
            Brandoll Montero, Founder
          </h2>

          <div className="rounded-card border border-cs-border bg-cs-blue-light/40 p-6">
            <p className="text-sm leading-relaxed text-cs-body">
              I&apos;m a New York City native who built my career in sales at
              Tesla, Zara, and Lacoste — brands obsessed with how customers
              feel at the moment of choice. Senior care is the highest-stakes
              purchase a family will ever make, and the industry&apos;s sales
              process doesn&apos;t treat it that way. I started ComfySeniors
              to change two things at once: how families find honest
              information, and how facilities reach families without getting
              gouged by referral services. We&apos;re New Jersey–built,
              operator-first, and we will do everything we can to make sure
              our people Find Care, and Feel Comfortable.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-cs-border pt-4 text-sm">
              <a
                href="https://www.linkedin.com/in/brandoll-m-002574141/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-cs-blue hover:underline"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
                LinkedIn
              </a>
              <span aria-hidden="true" className="text-cs-muted">·</span>
              <a
                href="mailto:bmontero@comfyseniors.com"
                className="inline-flex items-center gap-1.5 font-medium text-cs-blue hover:underline"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                bmontero@comfyseniors.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Where your data lives */}
      <section className="bg-cs-lavender-mist py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-display text-2xl font-normal text-cs-blue-dark">
            Where your data lives
          </h2>
          <p className="mb-6 text-sm text-cs-body">
            Here&apos;s every service we use. You can verify each one&apos;s
            security posture on their public pages.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <StackCard
              name="Vercel"
              role="App hosting"
              note="Serves every page + API route. AWS us-east-1."
              href="https://vercel.com/security"
            />
            <StackCard
              name="Supabase"
              role="Database + auth"
              note="Your facility data, inquiry records, session logins. AWS us-east-1. Row-level security on every table."
              href="https://supabase.com/security"
            />
            <StackCard
              name="Stripe"
              role="Billing"
              note="Subscription payments. SOC 2 Type II, PCI DSS Level 1. We never see or store your card data."
              href="https://stripe.com/docs/security"
            />
            <StackCard
              name="Resend"
              role="Email delivery"
              note="Transactional emails (inquiry notifications, receipts, login links)."
              href="https://resend.com/docs/security"
            />
            <StackCard
              name="Plausible"
              role="Privacy-first analytics"
              note="Page-view counts. Cookieless, no user tracking, GDPR compliant."
              href="https://plausible.io/data-policy"
            />
            <StackCard
              name="Next.js 14"
              role="Application framework"
              note="Open source. You can read every line of code that serves this site."
              href="https://nextjs.org"
            />
          </div>
        </div>
      </section>

      {/* Our Promises to Every Verified Facility on ComfySeniors */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            Our Promises to Every Verified Facility on ComfySeniors
          </h2>
          <ol className="space-y-4">
            {commitments.map((c, i) => (
              <li
                key={i}
                className="rounded-r-pill border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cs-blue text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-cs-blue-dark">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-cs-body">
                      {c.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Security FAQ */}
      <section className="bg-cs-lavender-mist py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            Security FAQ
          </h2>
          <div className="space-y-3">
            {securityFaqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-pill border border-cs-border bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-sans text-sm font-medium text-cs-blue-dark transition-colors hover:text-cs-blue [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-cs-blue transition-transform group-open:rotate-180"
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pr-10 text-sm leading-relaxed text-cs-body">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTAs */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 font-display text-xl font-normal text-cs-blue-dark sm:text-2xl">
            Still have questions?
          </h2>
          <p className="mb-6 text-cs-muted">
            Short answers from a human inbox beat long ones from a chatbot.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-btn border border-cs-blue bg-white px-5 py-2.5 text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue-light"
            >
              Contact us
            </Link>
            <Link
              href="/for-facilities"
              className="rounded-btn bg-cs-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
            >
              Back to For Facilities
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

function StackCard({
  name,
  role,
  note,
  href,
}: {
  name: string;
  role: string;
  note: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-card border border-cs-border bg-white p-4 transition-colors hover:border-cs-blue"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-semibold text-cs-blue-dark">{name}</p>
        <span className="text-[10px] uppercase tracking-wide text-cs-lavender">
          {role}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-cs-muted">{note}</p>
    </a>
  );
}
