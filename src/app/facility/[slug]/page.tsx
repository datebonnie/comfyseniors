import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import PriceDisplay from "@/components/ui/PriceDisplay";
import {
  FacilityHeader,
  InspectionBlock,
  FacilityTabs,
  ContactSidebar,
  SimilarFacilities,
  DeficiencyViewer,
  ValueScore,
  BenchmarkDisplay,
  StaffTurnover,
  InspectionTimeline,
  CostCalculator,
  TourQuestions,
  ViewCounter,
  PhotoGallery,
} from "@/components/facility";
import {
  getFacilityBySlug,
  getFacilityReviews,
  getReviewStats,
  getSimilarFacilities,
  getFacilityDeficiencies,
  getCountyBenchmark,
} from "@/lib/queries";
import type { InspectionDeficiency, CountyBenchmark } from "@/types";

interface FacilityPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: FacilityPageProps): Promise<Metadata> {
  let facility;
  try {
    facility = await getFacilityBySlug(params.slug);
  } catch {
    return { title: "Facility — ComfySeniors" };
  }

  if (!facility) {
    return { title: "Facility Not Found — ComfySeniors" };
  }

  const careLabel = facility.care_types?.[0] ?? "Senior Care";
  const location = [facility.city, facility.state].filter(Boolean).join(", ");

  return {
    title: `${facility.name} — ${careLabel} in ${location} | ComfySeniors`,
    description:
      facility.description?.slice(0, 160) ??
      `View real prices, state inspection records, and reviews for ${facility.name} in ${location}.`,
  };
}

export default async function FacilityPage({ params }: FacilityPageProps) {
  let facility;
  try {
    facility = await getFacilityBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!facility) {
    notFound();
  }

  let reviews: Awaited<ReturnType<typeof getFacilityReviews>> = [];
  let stats: Awaited<ReturnType<typeof getReviewStats>> = { avgRating: 0, reviewCount: 0 };
  let similar: Awaited<ReturnType<typeof getSimilarFacilities>> = [];
  let deficiencies: InspectionDeficiency[] = [];
  let benchmark: CountyBenchmark | null = null;

  try {
    const primaryCareType = facility.care_types?.[0];
    [reviews, stats, similar, deficiencies, benchmark] = await Promise.all([
      getFacilityReviews(facility.id),
      getReviewStats(facility.id),
      getSimilarFacilities(facility, 3),
      getFacilityDeficiencies(facility.id),
      facility.county && primaryCareType
        ? getCountyBenchmark(facility.county, primaryCareType)
        : Promise.resolve(null),
    ]);
  } catch {
    // Defaults already set above
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: facility.name,
    description: facility.description || `Senior care facility in ${facility.city}, ${facility.state || ""}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: facility.address,
      addressLocality: facility.city,
      addressRegion: facility.state,
      postalCode: facility.zip,
      addressCountry: "US",
    },
    ...(facility.phone && { telephone: facility.phone }),
    ...(facility.website && { url: facility.website }),
    ...(facility.lat && facility.lng && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: facility.lat,
        longitude: facility.lng,
      },
    }),
    ...(stats.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.avgRating,
        reviewCount: stats.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(facility.price_min && {
      priceRange: facility.price_max
        ? `$${facility.price_min} - $${facility.price_max}/month`
        : `From $${facility.price_min}/month`,
    }),
  };

  const hasNursingData =
    facility.rn_turnover !== null && facility.rn_turnover !== undefined;

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="gap-8 lg:grid lg:grid-cols-3">
          {/* ─── Main content (2/3) ─── */}
          <div className="lg:col-span-2">
            {/* Header */}
            <FacilityHeader
              facility={facility}
              avgRating={stats.avgRating}
              reviewCount={stats.reviewCount}
            />

            {/* Photo gallery (Verified facilities) */}
            {facility.photos && facility.photos.length > 0 && (
              <div className="mt-5">
                <PhotoGallery
                  photos={facility.photos}
                  facilityName={facility.name}
                />
              </div>
            )}

            {/* Value Score badge */}
            {facility.value_score !== null &&
              facility.value_score !== undefined && (
                <div className="mt-4">
                  <ValueScore score={facility.value_score} size="lg" />
                </div>
              )}

            {/* Price block */}
            <div className="mt-6 rounded-lg border border-cs-border bg-cs-blue-light p-5 sm:p-6">
              <PriceDisplay
                priceMin={facility.price_min}
                priceMax={facility.price_max}
                variant="full"
              />
            </div>

            {/* County benchmark */}
            {benchmark && (
              <div className="mt-4">
                <BenchmarkDisplay
                  facilityPriceMin={facility.price_min}
                  benchmark={benchmark}
                />
              </div>
            )}

            {/* Inspection block — summary */}
            <div className="mt-4">
              <InspectionBlock
                citation_count={facility.citation_count}
                last_inspection={facility.last_inspection}
                inspection_url={facility.inspection_url}
                inspection_summary={facility.inspection_summary}
              />
            </div>

            {/* Staff turnover (nursing homes only) */}
            {hasNursingData && (
              <div className="mt-4">
                <StaffTurnover
                  rnTurnover={facility.rn_turnover}
                  totalTurnover={facility.total_staff_turnover}
                />
              </div>
            )}

            {/* Detailed citation viewer */}
            {deficiencies.length > 0 && (
              <div className="mt-4 rounded-lg border border-cs-border bg-white p-5 sm:p-6">
                <h3 className="mb-4 font-sans text-base font-medium text-cs-blue-dark">
                  Detailed inspection findings
                </h3>
                <DeficiencyViewer deficiencies={deficiencies} />
              </div>
            )}

            {/* Inspection timeline */}
            {deficiencies.length > 0 && (
              <div className="mt-4">
                <InspectionTimeline deficiencies={deficiencies} />
              </div>
            )}

            {/* Tour questions — personalized */}
            <div className="mt-4">
              <TourQuestions
                facilityName={facility.name}
                deficiencies={deficiencies}
              />
            </div>

            {/* Move-in cost calculator */}
            <div className="mt-4">
              <CostCalculator
                priceMin={facility.price_min}
                priceMax={facility.price_max}
              />
            </div>

            {/* Tabs */}
            <div className="mt-6 rounded-lg border border-cs-border bg-white p-5 sm:p-6">
              <FacilityTabs facility={facility} reviews={reviews} />
            </div>
          </div>

          {/* ─── Sidebar (1/3) ─── */}
          <div className="mt-8 space-y-4 lg:mt-0">
            <ViewCounter
              facilityId={facility.id}
              isVerified={facility.is_verified || facility.is_featured}
              citationCount={facility.citation_count ?? 0}
              hasPhotos={Boolean(facility.photos && facility.photos.length > 0)}
              hasDescription={Boolean(
                facility.description && facility.description.length >= 80
              )}
              hasPrice={Boolean(facility.price_min)}
              hasPhone={Boolean(facility.phone)}
            />
            <ContactSidebar
              id={facility.id}
              name={facility.name}
              slug={facility.slug}
              city={facility.city}
              state={facility.state}
              phone={facility.phone}
              website={facility.website}
              email={facility.email}
            />

            {/* Claim-this-listing CTA — only shown on unverified pages.
                Routes directly to the tier picker for THIS facility
                (skipping the /claim landing's selector since we know
                which facility). The public audience for this page is
                families, but facility admins do visit their own page
                regularly — this is the primary entry point for a
                self-serve claim. */}
            {!facility.is_verified && (
              <a
                href={`/for-facilities/claim/${facility.id}`}
                className="block rounded-card border border-cs-lavender bg-cs-lavender-mist p-4 text-center transition-colors hover:bg-cs-lavender/20"
              >
                <p className="text-sm font-semibold text-cs-blue-dark">
                  Are you the facility admin?
                </p>
                <p className="mt-1 text-xs text-cs-muted">
                  Claim this listing to remove the warning, upload
                  photos, and respond to citations.
                </p>
                <span className="mt-2 inline-block text-xs font-medium text-cs-blue">
                  Claim this listing &rarr;
                </span>
              </a>
            )}
          </div>
        </div>

        {/* ─── Last verified timestamps ───
            Display logic honors the is_estimated flags: backfilled rows
            show the source without a date (since the date is a proxy,
            not a real event). Rows with real timestamps show the date. */}
        <div className="mt-8 border-t border-cs-border pt-6 text-center">
          {facility.is_verified &&
          facility.profile_last_updated_by_admin_at ? (
            <p className="text-xs text-cs-muted">
              Facility-verified profile. Last updated by{" "}
              <span className="text-cs-blue-dark">
                {facility.profile_last_updated_by_admin_name || "facility admin"}
              </span>{" "}
              on{" "}
              {new Date(
                facility.profile_last_updated_by_admin_at
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </p>
          ) : facility.data_last_verified_at &&
            facility.data_last_verified_at_is_estimated === false ? (
            <p className="text-xs text-cs-muted">
              Facility data last verified{" "}
              {new Date(facility.data_last_verified_at).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}{" "}
              from the NJ Department of Health.
            </p>
          ) : (
            <p className="text-xs text-cs-muted">
              Facility data from the NJ Department of Health.
            </p>
          )}
        </div>

        {/* Similar facilities */}
        <SimilarFacilities facilities={similar} />
      </div>
    </PageWrapper>
  );
}
