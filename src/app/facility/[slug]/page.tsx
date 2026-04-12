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
  const location = [facility.city, "NJ"].filter(Boolean).join(", ");

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
    description: facility.description || `Senior care facility in ${facility.city}, NJ`,
    address: {
      "@type": "PostalAddress",
      streetAddress: facility.address,
      addressLocality: facility.city,
      addressRegion: "NJ",
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
          <div className="mt-8 lg:mt-0">
            <ContactSidebar
              id={facility.id}
              name={facility.name}
              phone={facility.phone}
              website={facility.website}
              email={facility.email}
            />
          </div>
        </div>

        {/* Similar facilities */}
        <SimilarFacilities facilities={similar} />
      </div>
    </PageWrapper>
  );
}
