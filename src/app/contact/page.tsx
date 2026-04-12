import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact Us — ComfySeniors",
  description:
    "Get in touch with ComfySeniors. Questions about senior care in New Jersey, facility listings, or partnerships.",
};

export default function ContactPage() {
  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Get in touch
          </h1>
          <p className="mt-3 text-cs-muted">
            Have a question about senior care, your listing, or how ComfySeniors
            works? We&apos;re here to help.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Families */}
            <div className="rounded-card border border-cs-border bg-white p-6">
              <h2 className="mb-3 font-semibold text-cs-blue-dark">
                For families
              </h2>
              <p className="text-sm text-cs-body">
                Have a question about finding care in New Jersey? Try our FAQ
                or AI answer engine first — they cover most common questions
                instantly.
              </p>
              <div className="mt-4 space-y-2">
                <Button href="/faq" variant="ghost" size="sm">
                  Visit FAQ
                </Button>
              </div>
              <p className="mt-4 text-sm text-cs-body">
                Still need help? Email us:
              </p>
              <a
                href="mailto:hello@comfyseniors.com"
                className="mt-1 block text-sm font-semibold text-cs-blue hover:underline"
              >
                hello@comfyseniors.com
              </a>
            </div>

            {/* Facilities */}
            <div className="rounded-card border border-cs-border bg-white p-6">
              <h2 className="mb-3 font-semibold text-cs-blue-dark">
                For facilities
              </h2>
              <p className="text-sm text-cs-body">
                Want to claim your listing, upgrade to Featured, or have
                questions about your account? We&apos;re happy to help.
              </p>
              <div className="mt-4 space-y-2">
                <Button href="/for-facilities" variant="ghost" size="sm">
                  Get listed
                </Button>
              </div>
              <p className="mt-4 text-sm text-cs-body">
                Facility support:
              </p>
              <a
                href="mailto:facilities@comfyseniors.com"
                className="mt-1 block text-sm font-semibold text-cs-blue hover:underline"
              >
                facilities@comfyseniors.com
              </a>
            </div>

            {/* Press / partnerships */}
            <div className="rounded-card border border-cs-border bg-white p-6">
              <h2 className="mb-3 font-semibold text-cs-blue-dark">
                Press &amp; partnerships
              </h2>
              <p className="text-sm text-cs-body">
                Media inquiries, partnership proposals, or speaking requests.
              </p>
              <a
                href="mailto:hello@comfyseniors.com"
                className="mt-3 block text-sm font-semibold text-cs-blue hover:underline"
              >
                hello@comfyseniors.com
              </a>
            </div>

            {/* Social */}
            <div className="rounded-card border border-cs-border bg-white p-6">
              <h2 className="mb-3 font-semibold text-cs-blue-dark">
                Follow us
              </h2>
              <p className="text-sm text-cs-body">
                Senior care tips, facility spotlights, and industry
                transparency — follow @comfyseniors.
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://www.instagram.com/comfyseniors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-cs-blue hover:underline"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@comfyseniors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-cs-blue hover:underline"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Promise */}
          <div className="mt-10 rounded-card border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5">
            <p className="text-sm italic text-cs-lavender">
              We respond to every email within 24 hours. We never sell your
              contact information to anyone — including facilities.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
