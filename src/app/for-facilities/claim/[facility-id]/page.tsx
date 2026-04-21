import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import ClaimTierPicker from "@/components/for-facilities/ClaimTierPicker";
import { createServiceClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Claim your facility — ComfySeniors",
  description:
    "Review your facility's public listing and pick a plan to claim and verify it.",
  robots: { index: false, follow: false },
};

interface Props {
  params: { "facility-id": string };
  searchParams?: { canceled?: string };
}

export default async function ClaimByIdPage({ params, searchParams }: Props) {
  const facilityId = params["facility-id"];

  const supabase = createServiceClient();
  const { data: facility } = await supabase
    .from("facilities")
    .select(
      "id, name, slug, city, state, phone, website, care_types, accepts_medicaid, accepts_medicare, price_min, price_max, citation_count, is_verified, subscription_tier"
    )
    .eq("id", facilityId)
    .maybeSingle();

  if (!facility) {
    notFound();
  }

  // Already verified? Don't let them pay twice.
  if (facility.is_verified && facility.subscription_tier) {
    return (
      <PageWrapper>
        <section className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <div className="rounded-card border border-cs-border bg-white p-8 text-center">
            <h1 className="font-display text-2xl text-cs-blue-dark">
              This listing is already verified.
            </h1>
            <p className="mt-3 text-sm text-cs-muted">
              <strong>{facility.name}</strong> is already a{" "}
              {facility.subscription_tier === "founding"
                ? "Founding Member"
                : facility.subscription_tier === "verified"
                  ? "Verified"
                  : facility.subscription_tier === "claim"
                    ? "Claim"
                    : facility.subscription_tier === "medicaid"
                      ? "Medicare/Medicaid Listing"
                      : "verified"}{" "}
              facility. If you&apos;re the admin and need dashboard access,
              log in with the email you used at checkout.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <Link
                href="/for-facilities/login"
                className="rounded-btn bg-cs-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-cs-blue-dark"
              >
                Log in to dashboard
              </Link>
              <Link
                href={`/facility/${facility.slug}`}
                className="text-xs text-cs-muted underline hover:text-cs-blue-dark"
              >
                View public listing
              </Link>
            </div>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // Count remaining Founding slots — used to hide the tier at cap
  const { count: foundingCount } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true })
    .eq("subscription_tier", "founding");
  const foundingAvailable = (foundingCount ?? 0) < 20;

  const hadCancel = searchParams?.canceled === "true";

  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-3 text-cs-lavender">Claim this listing</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            {facility.name}
          </h1>
          <p className="mt-3 text-sm text-cs-muted">
            {[facility.city, facility.state].filter(Boolean).join(", ")}
            {facility.care_types &&
              facility.care_types.length > 0 &&
              ` · ${facility.care_types.join(", ")}`}
          </p>
          {hadCancel && (
            <p className="mx-auto mt-4 max-w-lg rounded-btn border border-cs-amber-warn/40 bg-[#FEF3C7] px-4 py-2 text-sm text-[#92400E]">
              Checkout canceled. Pick a tier below when you&apos;re ready.
            </p>
          )}
        </div>
      </section>

      {/* Current state snapshot — what families see right now */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-sans text-base font-semibold text-cs-blue-dark">
            What families see on your page right now
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SnapshotChip
              label="Verification"
              value={facility.is_verified ? "Verified" : "Not Verified"}
              bad={!facility.is_verified}
            />
            <SnapshotChip
              label="State citations"
              value={
                facility.citation_count
                  ? `${facility.citation_count} citation${facility.citation_count === 1 ? "" : "s"}`
                  : "Clean record"
              }
              bad={Boolean(facility.citation_count && facility.citation_count > 0)}
            />
            <SnapshotChip
              label="Phone"
              value={facility.phone ? "On file" : "Missing"}
              bad={!facility.phone}
            />
            <SnapshotChip
              label="Website"
              value={facility.website ? "On file" : "Missing"}
              bad={!facility.website}
            />
          </div>
          <p className="mt-3 text-xs text-cs-muted">
            After you claim, you can edit every one of these — plus photos,
            description, amenities, and citation responses — from your
            dashboard.
          </p>
        </div>
      </section>

      {/* Tier picker */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ClaimTierPicker
            facilityId={facility.id}
            facilityName={facility.name}
            acceptsMedicaid={Boolean(facility.accepts_medicaid)}
            acceptsMedicare={Boolean(facility.accepts_medicare)}
            foundingAvailable={foundingAvailable}
          />
        </div>
      </section>
    </PageWrapper>
  );
}

function SnapshotChip({
  label,
  value,
  bad,
}: {
  label: string;
  value: string;
  bad: boolean;
}) {
  return (
    <div
      className={`rounded-card border p-4 ${
        bad
          ? "border-cs-amber-warn/40 bg-[#FEF3C7]"
          : "border-cs-border bg-white"
      }`}
    >
      <p className="label text-cs-muted">{label}</p>
      <p
        className={`mt-1 font-medium ${
          bad ? "text-[#92400E]" : "text-cs-blue-dark"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
