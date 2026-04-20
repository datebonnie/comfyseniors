import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Trust & Security — ComfySeniors",
  description:
    "Who runs ComfySeniors, where your data lives, our promises, and straight answers to security questions from Bergen County senior care facilities.",
};

const commitments = [
  // TODO: user to provide final copy. Scaffolded with placeholder-style
  // one-liners that match the site voice; replace wholesale when ready.
  "We never sell facility contact information to third parties, ever.",
  "We show every licensed facility — paying or not.",
  "We publish every review, positive and negative, without filter.",
  "We surface inspection records on every facility page, not behind a paywall.",
  "We charge facilities one flat monthly fee — no placement kickbacks.",
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

      {/* Who runs this */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-display text-2xl font-normal text-cs-blue-dark">
            Who runs ComfySeniors
          </h2>

          {/* TODO: user to provide final bio + photo. Structured so that
              swapping content is one Edit call. */}
          <div className="rounded-card border border-cs-border bg-cs-blue-light/40 p-6">
            <p className="text-sm text-cs-body">
              <strong className="text-cs-blue-dark">
                {/* TODO: Founder name */}
                [Founder name placeholder]
              </strong>{" "}
              built ComfySeniors after watching a family member navigate
              senior care options in Bergen County without straight answers
              on price, inspection history, or verified status.
            </p>
            <p className="mt-3 text-sm text-cs-body">
              {/* TODO: Founder bio paragraph */}
              [Founder bio placeholder — 2-3 sentences on background,
              why Bergen County, why this problem.]
            </p>
            <p className="mt-4 text-xs text-cs-muted">
              One person answers every email at{" "}
              <a
                href="mailto:hello@comfyseniors.com"
                className="font-medium text-cs-blue hover:underline"
              >
                hello@comfyseniors.com
              </a>
              . No outsourced support team, no chatbot gatekeeping.
            </p>
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

      {/* Our commitment */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-normal text-cs-blue-dark">
            Our commitment
          </h2>
          <ol className="space-y-3">
            {commitments.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-r-pill border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cs-blue text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-cs-body leading-relaxed">{c}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-cs-muted">
            {/* TODO: Final "Our commitment" copy from founder */}
            Copy above is scaffolded pending final founder sign-off.
          </p>
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
