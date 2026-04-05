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
} from "@/components/facility";
import {
  getFacilityBySlug,
  getFacilityReviews,
  getReviewStats,
  getSimilarFacilities,
} from "@/lib/queries";

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

  try {
    [reviews, stats, similar] = await Promise.all([
      getFacilityReviews(facility.id),
      getReviewStats(facility.id),
      getSimilarFacilities(facility, 3),
    ]);
  } catch {
    // Defaults already set above
  }

  return (
    <PageWrapper>
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

            {/* Price block — ALWAYS above the fold */}
            <div className="mt-6 rounded-lg border border-cs-border bg-cs-blue-light p-5 sm:p-6">
              <PriceDisplay
                priceMin={facility.price_min}
                priceMax={facility.price_max}
                variant="full"
              />
            </div>

            {/* Inspection block — ALWAYS visible */}
            <div className="mt-4">
              <InspectionBlock
                citation_count={facility.citation_count}
                last_inspection={facility.last_inspection}
                inspection_url={facility.inspection_url}
                inspection_summary={facility.inspection_summary}
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
