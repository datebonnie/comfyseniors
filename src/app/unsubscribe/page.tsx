import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import UnsubscribeForm from "./UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe — ComfySeniors",
  description:
    "Unsubscribe from ComfySeniors marketing emails. Your facility directory listing is not affected.",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { e?: string; t?: string };
}

export default function UnsubscribePage({ searchParams }: Props) {
  const email = searchParams.e;
  const token = searchParams.t;

  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Unsubscribe
          </h1>
          <p className="mt-3 text-cs-muted">
            Stop receiving ComfySeniors marketing emails.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <UnsubscribeForm email={email} token={token} />

          <div className="mt-10 rounded-card border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5">
            <p className="text-sm text-cs-blue-dark">
              <strong>Important:</strong> Unsubscribing stops future marketing
              emails only. Your facility&rsquo;s public directory listing on
              ComfySeniors.com is built from public data (CMS inspection
              records, state licensing registries, Google Places) and is not
              affected. To claim, edit, or request review of a listing, visit{" "}
              <Link
                href="/for-facilities"
                className="font-semibold text-cs-blue hover:underline"
              >
                /for-facilities
              </Link>{" "}
              or email{" "}
              <a
                href="mailto:facilities@comfyseniors.com"
                className="font-semibold text-cs-blue hover:underline"
              >
                facilities@comfyseniors.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
