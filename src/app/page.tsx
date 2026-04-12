import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import SearchBar from "@/components/ui/SearchBar";
import FacilityCard from "@/components/ui/FacilityCard";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Button from "@/components/ui/Button";
import type { CareType } from "@/types";
import {
  getFeaturedFacilities,
  getTopFAQs,
  getFacilityCount,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "ComfySeniors — New Jersey's Most Honest Senior Care Directory",
  description:
    "Find every licensed senior care facility in New Jersey with real prices, state inspection records, and unfiltered reviews. No pressure. No lead selling.",
};

const careTypes: { type: CareType; slug: string }[] = [
  { type: "Assisted Living", slug: "Assisted Living" },
  { type: "Memory Care", slug: "Memory Care" },
  { type: "Independent Living", slug: "Independent Living" },
  { type: "Nursing Home", slug: "Nursing Home" },
  { type: "Home Care", slug: "Home Care" },
];

const trustItems = [
  "Thousands of facilities listed",
  "Real prices shown",
  "We never sell your number",
  "State inspection records included",
];

const steps = [
  {
    num: "01",
    title: "Search or browse",
    desc: "Find facilities by location, care type, or budget. No signup needed — ever.",
  },
  {
    num: "02",
    title: "Compare side by side",
    desc: "See real prices, reviews, and state inspection records for every facility.",
  },
  {
    num: "03",
    title: "Contact on your terms",
    desc: "Reach out directly to facilities when you're ready. We never share your info.",
  },
];

const differentiators = [
  {
    title: "Real prices listed",
    desc: "No hidden pricing. See actual monthly costs on every listing.",
  },
  {
    title: "Zero phone harvesting",
    desc: "We never collect, store, or sell your phone number or email.",
  },
  {
    title: "Federal inspection records",
    desc: "Every facility shows its citation history from the NJ Dept of Health.",
  },
  {
    title: "Unfiltered reviews",
    desc: "All reviews are published — positive and negative. No suppression, ever.",
  },
];

export default async function HomePage() {
  let featuredFacilities: Awaited<ReturnType<typeof getFeaturedFacilities>> = [];
  let faqItems: Awaited<ReturnType<typeof getTopFAQs>> = [];
  let facilityCount = 0;

  try {
    [featuredFacilities, faqItems, facilityCount] = await Promise.all([
      getFeaturedFacilities(3),
      getTopFAQs(3),
      getFacilityCount(),
    ]);
  } catch {
    // If Supabase is not configured, render with empty data
  }

  const trustDisplay = trustItems.map((text) =>
    text.includes("700+") && facilityCount > 0
      ? `${facilityCount.toLocaleString()}+ facilities listed`
      : text
  );

  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">
            America&apos;s senior care directory
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Find Care. Feel Comfortable.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            Every licensed senior care facility &mdash; real prices, inspection
            records, and we never sell your number. Browse at your own pace.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar size="lg" />
          </div>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {trustDisplay.map((text) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-xs text-cs-muted"
              >
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-cs-lavender" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CARE TYPE STRIP ─── */}
      <section className="border-b border-cs-border bg-white py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4">
          {careTypes.map(({ type, slug }) => (
            <Link
              key={type}
              href={`/search?type=${encodeURIComponent(slug)}`}
              className="rounded-pill border-[1.5px] border-cs-border-blue bg-cs-blue-light px-4 py-2 text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
            >
              {type}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-b border-cs-border bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">How it works</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Three steps. No pressure.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-pill border border-cs-border bg-cs-lavender-mist p-6 sm:p-8"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cs-blue text-xs font-semibold text-white">
                  {step.num}
                </span>
                <h3 className="mt-4 font-sans text-lg font-semibold text-cs-blue-dark">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cs-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED FACILITIES ─── */}
      {featuredFacilities.length > 0 && (
        <section className="bg-cs-lavender-mist py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <span className="label text-cs-lavender">Featured facilities</span>
              <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
                Trusted senior care facilities
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredFacilities.map((f) => (
                <FacilityCard key={f.id} facility={f} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button href="/search" variant="ghost">
                Browse all facilities
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY COMFYSENIORS ─── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="label text-cs-lavender">Why ComfySeniors</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              The honest alternative.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((d) => (
              <div
                key={d.title}
                className="rounded-r-pill border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-5"
              >
                <h3 className="text-[13px] font-semibold text-cs-blue-dark">
                  {d.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-cs-muted">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ PREVIEW ─── */}
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
            Get listed free on America&apos;s most honest senior care
            directory.
          </p>
          <Button href="/for-facilities" size="lg">
            Get listed free
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
