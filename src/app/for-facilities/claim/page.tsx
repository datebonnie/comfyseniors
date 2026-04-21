import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import SelfLookupWidget from "@/components/for-facilities/SelfLookupWidget";

export const metadata: Metadata = {
  title: "Claim your facility — ComfySeniors",
  description:
    "Find your facility in the Bergen County directory and claim your verified listing.",
  robots: { index: false, follow: false },
};

/**
 * Entry page for the claim flow when the admin hasn't yet selected a
 * facility. Reuses the SelfLookupWidget to pick from the directory.
 * Once they pick, they land on /for-facilities/claim/[facility-id]
 * where the tier picker is.
 *
 * Arriving here from: the main /for-facilities CTAs, the "Claim this
 * listing" button on a public facility page (bypass this page if the
 * id is already known), or a direct link in outreach email.
 */
export default function ClaimLandingPage() {
  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">
            Bergen County assisted living &amp; memory care
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Claim your facility&apos;s listing.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cs-body">
            Every licensed Bergen County assisted living and memory care
            facility is already in our directory. Search to find yours —
            we&apos;ll show what families see today, and you can pick a
            tier to fix it.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <SelfLookupWidget mode="claim" />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-sans text-lg font-semibold text-cs-blue-dark">
            What happens after you pick a tier
          </h2>
          <ol className="space-y-3 text-sm text-cs-body">
            <Step n={1}>
              You review the real data we have about your facility — what
              families see right now — and pick the tier that fits.
            </Step>
            <Step n={2}>
              You pay via Stripe Checkout ($97, $197, $297, or $397
              depending on tier). No placement fees. Cancel anytime.
            </Step>
            <Step n={3}>
              We email you a one-click login link. No password to create
              or remember.
            </Step>
            <Step n={4}>
              You land on your dashboard with a checklist: upload photos,
              write your description, respond to any open citations.
              Usually 15 minutes of work.
            </Step>
            <Step n={5}>
              Your public page flips to Verified. The &ldquo;Not
              Verified&rdquo; warning is gone. Families contact you
              directly from that point forward.
            </Step>
          </ol>

          <p className="mt-6 text-center text-xs text-cs-muted">
            Not sure which tier fits? Read our{" "}
            <Link href="/for-facilities" className="underline hover:text-cs-blue-dark">
              comparison on the main For Facilities page
            </Link>
            .
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cs-blue text-xs font-semibold text-white">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
