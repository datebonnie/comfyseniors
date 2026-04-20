import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import SearchBar from "@/components/ui/SearchBar";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Button from "@/components/ui/Button";
import { getTopFAQs } from "@/lib/queries";

export const metadata: Metadata = {
  title:
    "Bergen County, NJ Assisted Living and Memory Care — ComfySeniors",
  description:
    "Bergen County, NJ assisted living and memory care — verified listings, real prices, no phone harvesting.",
};

const trustChips = [
  "Real prices shown",
  "State inspection records included",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { code?: string; redirect?: string };
}) {
  // Safety net: if Supabase magic-link redirected here with a stray
  // ?code= parameter (e.g. due to a Supabase URL Configuration mismatch),
  // forward it to the proper /auth/callback handler so the session can
  // be exchanged. Prevents the user from getting stuck on the homepage.
  if (searchParams?.code) {
    const params = new URLSearchParams();
    params.set("code", searchParams.code);
    if (searchParams.redirect) {
      params.set("redirect", searchParams.redirect);
    }
    redirect(`/auth/callback?${params.toString()}`);
  }

  let faqItems: Awaited<ReturnType<typeof getTopFAQs>> = [];
  try {
    faqItems = await getTopFAQs(3);
  } catch {
    // If Supabase is not configured, render with empty FAQ
  }

  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">
            Bergen County, NJ
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Find assisted living in Bergen County. Real prices. Real
            inspection records.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            Every licensed facility. Verified or not, we tell you which.
            We never sell your number.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar size="lg" placeholder="Search Bergen County" />
          </div>

          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {trustChips.map((text) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-xs text-cs-muted"
              >
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-cs-lavender" />
                {text}
              </span>
            ))}
          </div>

          <p className="mx-auto mt-3 max-w-xl text-xs text-cs-muted">
            Every licensed assisted living and memory care facility in
            Bergen County — we tell you which ones are verified.
          </p>
        </div>
      </section>

      {/* ─── FAQ PREVIEW (capped at 3) ─── */}
      {faqItems.length > 0 && (
        <section className="bg-cs-lavender-mist py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <span className="label text-cs-lavender">Common questions</span>
              <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
                Frequently asked questions
              </h2>
            </div>

            <FAQAccordion
              items={faqItems.map((faq) => ({
                question: faq.question,
                answer: faq.answer ?? "",
              }))}
            />

            <div className="mt-8 text-center">
              <Button href="/faq" variant="ghost">
                See all FAQs
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── FACILITY CTA ─── */}
      <section className="bg-cs-blue-light py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 font-display text-xl font-normal text-cs-blue-dark sm:text-2xl">
            Are you a senior care facility?
          </h2>
          <p className="mb-6 text-cs-muted">
            Get your Bergen County listing verified. Direct family
            inquiries. No placement fees.
          </p>
          <Button href="/for-facilities" size="lg">
            Get listed
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
