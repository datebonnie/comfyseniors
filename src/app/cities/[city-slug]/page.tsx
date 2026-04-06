import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import FacilityCard from "@/components/ui/FacilityCard";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import type { Facility, FacilityWithStats } from "@/types";

interface CityPageProps {
  params: { "city-slug": string };
}

function slugToCity(slug: string): string {
  // Convert "jersey-city" back to search term "jersey city"
  return slug.replace(/-/g, " ");
}

function titleCase(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getCityFacilities(citySlug: string) {
  const supabase = createClient();
  const searchTerm = slugToCity(citySlug);

  // Get all facilities matching this city (case-insensitive)
  const allFacilities: Facility[] = [];
  for (let offset = 0; offset < 2000; offset += 1000) {
    const { data } = await supabase
      .from("facilities")
      .select("*")
      .ilike("city", `%${searchTerm}%`)
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
    .in("facility_id", facilityIds)
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

async function getNearbyCities(
  county: string | null,
  currentCity: string
): Promise<string[]> {
  if (!county) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("facilities")
    .select("city")
    .eq("county", county)
    .not("city", "is", null)
    .limit(500);

  if (!data) return [];
  const cities = Array.from(new Set((data as { city: string }[]).map((r) => r.city)))
    .filter((c) => c.toLowerCase() !== currentCity.toLowerCase())
    .sort()
    .slice(0, 12);
  return cities;
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const cityName = titleCase(slugToCity(params["city-slug"]));

  return {
    title: `Senior Care in ${cityName}, NJ — Facilities & Pricing | ComfySeniors`,
    description: `Find licensed senior care facilities in ${cityName}, New Jersey. Compare assisted living, nursing homes, and home care with real prices and inspection records.`,
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const citySlug = params["city-slug"];
  const cityName = titleCase(slugToCity(citySlug));

  let facilities: Facility[] = [];
  try {
    facilities = await getCityFacilities(citySlug);
  } catch {
    // Empty state
  }

  if (facilities.length === 0) {
    notFound();
  }

  // Get review stats
  const statsMap = await getReviewStatsForFacilities(
    facilities.map((f) => f.id)
  );

  const facilitiesWithStats: FacilityWithStats[] = facilities.map((f) => {
    const stats = statsMap.get(f.id);
    return {
      ...f,
      avg_rating: stats?.avg ?? 0,
      review_count: stats?.count ?? 0,
    };
  });

  // Get zip codes in this city
  const zipCodes = Array.from(
    new Set(facilities.map((f) => f.zip).filter(Boolean))
  ).sort();

  // Get care type counts
  const careTypeCounts = new Map<string, number>();
  for (const f of facilities) {
    for (const t of f.care_types ?? []) {
      careTypeCounts.set(t, (careTypeCounts.get(t) ?? 0) + 1);
    }
  }

  // County for nearby cities
  const county = facilities[0]?.county ?? null;
  let nearbyCities: string[] = [];
  try {
    nearbyCities = await getNearbyCities(county, cityName);
  } catch {
    // Skip
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="label mb-2 text-cs-lavender">
            {county ? `${county} County, NJ` : "New Jersey"}
          </p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Senior Care in {cityName}, NJ
          </h1>
          <p className="mt-3 text-cs-body">
            {facilities.length} licensed senior care{" "}
            {facilities.length === 1 ? "facility" : "facilities"} in {cityName},{" "}
            New Jersey.
          </p>

          {/* Zip codes */}
          {zipCodes.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-cs-blue-dark">
                Zip codes:
              </span>
              {zipCodes.map((zip) => (
                <Link
                  key={zip}
                  href={`/search?q=${zip}`}
                  className="rounded-full border border-cs-border-blue bg-white px-3 py-1 text-sm text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
                >
                  {zip}
                </Link>
              ))}
            </div>
          )}

          {/* Care type counts */}
          <div className="mt-4 flex flex-wrap gap-3">
            {Array.from(careTypeCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <span key={type} className="text-sm text-cs-muted">
                  {type}: {count}
                </span>
              ))}
          </div>

          <div className="mt-6 max-w-xl">
            <SearchBar
              defaultValue={cityName}
              placeholder={`Search facilities in ${cityName}...`}
            />
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {facilitiesWithStats.map((f) => (
              <FacilityCard key={f.id} facility={f} />
            ))}
          </div>
        </div>
      </section>

      {/* Nearby cities */}
      {nearbyCities.length > 0 && (
        <section className="border-t border-cs-border bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-display text-xl font-normal text-cs-blue-dark">
              Nearby cities in {county} County
            </h2>
            <div className="flex flex-wrap gap-2">
              {nearbyCities.map((city) => (
                <Link
                  key={city}
                  href={`/cities/${city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-pill border border-cs-border-blue bg-cs-blue-light px-4 py-2 text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue hover:text-white"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-cs-lavender-mist py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 font-display text-xl font-normal text-cs-blue-dark">
            Not sure which type of care you need?
          </h2>
          <p className="mb-6 text-sm text-cs-muted">
            Take our 60-second quiz to find your best match in {cityName}.
          </p>
          <Button href="/match" size="lg">
            Take the Care Match Quiz
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
