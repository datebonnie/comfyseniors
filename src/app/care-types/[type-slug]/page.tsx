import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import FacilityCard from "@/components/ui/FacilityCard";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import type { CareType, Facility, FacilityWithStats } from "@/types";

interface CareTypePageProps {
  params: { "type-slug": string };
}

const CARE_TYPE_MAP: Record<string, { label: CareType; description: string }> = {
  "assisted-living": {
    label: "Assisted Living",
    description:
      "Assisted living communities provide help with daily activities like bathing, dressing, medication management, and meals — while supporting independence. Ideal for seniors who don't need 24/7 medical care but benefit from hands-on support.",
  },
  "memory-care": {
    label: "Memory Care",
    description:
      "Memory care facilities specialize in caring for seniors with Alzheimer's disease, dementia, and other cognitive impairments. They offer secure environments, structured routines, and staff trained in dementia care techniques.",
  },
};

async function getCareTypeFacilities(careType: CareType) {
  const supabase = createClient();

  const allFacilities: Facility[] = [];
  for (let offset = 0; offset < 2000; offset += 1000) {
    const { data } = await supabase
      .from("facilities")
      .select("*")
      .contains("care_types", [careType])
      .order("is_featured", { ascending: false })
      .order("name")
      .range(offset, offset + 999);
    if (data) allFacilities.push(...(data as Facility[]));
  }
  return allFacilities;
}

async function getReviewStatsForFacilities(
  facilityIds: string[]
): Promise<Map<string, { avg: number; count: number }>> {
  if (facilityIds.length === 0) return new Map();

  const supabase = createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("facility_id, rating")
    .in("facility_id", facilityIds.slice(0, 100))
    .eq("is_published", true);

  const map = new Map<string, number[]>();
  for (const r of reviews ?? []) {
    const arr = map.get(r.facility_id) ?? [];
    arr.push(r.rating);
    map.set(r.facility_id, arr);
  }

  const result = new Map<string, { avg: number; count: number }>();
  for (const [id, ratings] of Array.from(map.entries())) {
    const sum = ratings.reduce((a, b) => a + b, 0);
    result.set(id, {
      avg: Math.round((sum / ratings.length) * 10) / 10,
      count: ratings.length,
    });
  }
  return result;
}

export async function generateMetadata({
  params,
}: CareTypePageProps): Promise<Metadata> {
  const config = CARE_TYPE_MAP[params["type-slug"]];
  if (!config) return { title: "Care Type — ComfySeniors" };

  return {
    title: `${config.label} in Bergen County, NJ — ComfySeniors`,
    description: `Find licensed ${config.label.toLowerCase()} facilities in Bergen County, NJ. Real prices, state inspection records, unfiltered reviews. ${config.description.slice(0, 100)}`,
  };
}

export default async function CareTypePage({ params }: CareTypePageProps) {
  const typeSlug = params["type-slug"];
  const config = CARE_TYPE_MAP[typeSlug];

  if (!config) {
    notFound();
  }

  let facilities: Facility[] = [];
  try {
    facilities = await getCareTypeFacilities(config.label);
  } catch {
    // Empty state
  }

  // Get review stats for first 100 (pagination would handle the rest)
  const statsMap = await getReviewStatsForFacilities(
    facilities.slice(0, 100).map((f) => f.id)
  );

  const facilitiesWithStats: FacilityWithStats[] = facilities
    .slice(0, 60)
    .map((f) => {
      const stats = statsMap.get(f.id);
      return {
        ...f,
        avg_rating: stats?.avg ?? 0,
        review_count: stats?.count ?? 0,
      };
    });

  // Get cities with this care type
  const cityCounts = new Map<string, number>();
  for (const f of facilities) {
    if (f.city) {
      cityCounts.set(f.city, (cityCounts.get(f.city) ?? 0) + 1);
    }
  }
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

  // Average price
  const withPrices = facilities.filter((f) => f.price_min);
  const avgPrice =
    withPrices.length > 0
      ? Math.round(
          withPrices.reduce((sum, f) => sum + (f.price_min ?? 0), 0) /
            withPrices.length
        )
      : null;

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="label mb-2 text-cs-lavender">Care type guide</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            {config.label} in Bergen County, NJ
          </h1>
          <p className="mt-4 max-w-2xl text-cs-body leading-relaxed">
            {config.description}
          </p>

          {/* Stats strip */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <span className="text-2xl font-semibold text-cs-blue">
                {facilities.length}
              </span>
              <span className="ml-1 text-sm text-cs-muted">facilities</span>
            </div>
            {avgPrice && (
              <div>
                <span className="text-2xl font-semibold text-cs-blue">
                  ${avgPrice.toLocaleString()}
                </span>
                <span className="ml-1 text-sm text-cs-muted">avg/month</span>
              </div>
            )}
            <div>
              <span className="text-2xl font-semibold text-cs-blue">
                {cityCounts.size}
              </span>
              <span className="ml-1 text-sm text-cs-muted">cities</span>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <SearchBar
              defaultValue=""
              placeholder={`Search ${config.label.toLowerCase()}...`}
            />
          </div>
        </div>
      </section>

      {/* Top cities */}
      {topCities.length > 0 && (
        <section className="border-b border-cs-border bg-white py-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-cs-blue-dark">
                Top cities:
              </span>
              {topCities.map(([city, count]) => (
                <Link
                  key={city}
                  href={`/cities/${city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-full border border-cs-border-blue bg-cs-blue-light px-3 py-1 text-sm text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
                >
                  {city} ({count})
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-cs-muted">
              Showing {facilitiesWithStats.length} of {facilities.length}{" "}
              {config.label.toLowerCase()} facilities
            </p>
            <Button
              href={`/search?type=${encodeURIComponent(config.label)}`}
              variant="ghost"
              size="sm"
            >
              View all with filters
            </Button>
          </div>

          <div className="space-y-4">
            {facilitiesWithStats.map((f) => (
              <FacilityCard key={f.id} facility={f} />
            ))}
          </div>

          {facilities.length > 60 && (
            <div className="mt-8 text-center">
              <Button
                href={`/search?type=${encodeURIComponent(config.label)}`}
                size="lg"
              >
                View all {facilities.length} {config.label.toLowerCase()}{" "}
                facilities
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Other care types */}
      <section className="border-t border-cs-border bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-xl font-normal text-cs-blue-dark">
            Other care types
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CARE_TYPE_MAP)
              .filter(([slug]) => slug !== typeSlug)
              .map(([slug, ct]) => (
                <Link
                  key={slug}
                  href={`/care-types/${slug}`}
                  className="rounded-pill border border-cs-border-blue bg-cs-blue-light px-4 py-2 text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
                >
                  {ct.label}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cs-lavender-mist py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 font-display text-xl font-normal text-cs-blue-dark">
            Browse {config.label.toLowerCase()} in Bergen County
          </h2>
          <p className="mb-6 text-sm text-cs-muted">
            Compare every licensed facility with real prices, inspection
            records, and unfiltered reviews.
          </p>
          <Button
            href={`/search?type=${encodeURIComponent(config.label)}`}
            size="lg"
          >
            See all {config.label.toLowerCase()}
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
