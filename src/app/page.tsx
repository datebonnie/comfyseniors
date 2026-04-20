import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import DecisionEngine from "@/components/home/DecisionEngine";

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
  searchParams?: {
    code?: string;
    redirect?: string;
    ds?: string;
    for?: string;
    care?: string;
  };
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

  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section className="bg-cs-blue-light py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">
            New Jersey&apos;s Answer to Assisted Living
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Find Care. Feel Comfortable.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.65] text-cs-body">
            Every licensed facility in Bergen County, with all the data
            you need to feel comfortable.
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

      {/* ─── DECISION ENGINE (replaces FAQ section) ─── */}
      <section className="bg-cs-lavender-mist py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <span className="label text-cs-lavender">3-step engine</span>
            <h2 className="mt-2 font-display text-2xl font-normal text-cs-blue-dark sm:text-[32px]">
              Find care in 3 clicks
            </h2>
            <p className="mt-2 text-sm text-cs-muted">
              No signup. No phone number. No hassle.
            </p>
          </div>

          <DecisionEngine
            ds={searchParams?.ds}
            forWho={searchParams?.for}
            care={searchParams?.care}
          />
        </div>
      </section>

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
