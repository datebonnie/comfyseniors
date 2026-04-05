import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import SearchBar from "@/components/ui/SearchBar";
import FacilityCard from "@/components/ui/FacilityCard";
import Button from "@/components/ui/Button";
import { FilterSidebar } from "@/components/search";
import { Pagination } from "@/components/search";
import type { CareType, SearchFilters } from "@/types";
import {
  searchFacilities,
  getDistinctCounties,
  getDistinctLanguages,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Find Senior Care in New Jersey — ComfySeniors",
  description:
    "Search and compare every licensed senior care facility in New Jersey. Filter by care type, price, location, and inspection record.",
};

const PER_PAGE = 20;

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function parseFilters(searchParams: SearchPageProps["searchParams"]): SearchFilters {
  const getStr = (key: string): string | undefined => {
    const val = searchParams[key];
    return typeof val === "string" ? val : undefined;
  };

  const getArr = (key: string): string[] => {
    const val = searchParams[key];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
    return [];
  };

  return {
    q: getStr("q"),
    careTypes: getArr("type").filter(Boolean) as CareType[],
    county: getStr("county"),
    city: getStr("city"),
    priceMin: getStr("priceMin") ? Number(getStr("priceMin")) : undefined,
    priceMax: getStr("priceMax") ? Number(getStr("priceMax")) : undefined,
    acceptsMedicaid: getStr("medicaid") === "true",
    acceptsMedicare: getStr("medicare") === "true",
    languages: getArr("lang"),
    cleanRecordOnly: getStr("clean") === "true",
    sort: (getStr("sort") as SearchFilters["sort"]) || "relevance",
  };
}

function createPageUrl(
  searchParams: SearchPageProps["searchParams"],
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, v));
    } else if (val) {
      params.set(key, val);
    }
  }
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseFilters(searchParams);
  const page = Math.max(
    1,
    Number(typeof searchParams.page === "string" ? searchParams.page : "1")
  );

  let results: Awaited<ReturnType<typeof searchFacilities>> = { data: [], count: 0 };
  let counties: string[] = [];
  let languages: string[] = [];

  try {
    [results, counties, languages] = await Promise.all([
      searchFacilities(filters, page, PER_PAGE),
      getDistinctCounties(),
      getDistinctLanguages(),
    ]);
  } catch {
    // Defaults already set above
  }

  const totalPages = Math.ceil(results.count / PER_PAGE);

  return (
    <PageWrapper>
      {/* Search header */}
      <section className="border-b border-cs-border bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            <SearchBar defaultValue={filters.q ?? ""} />
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gap-8 md:grid md:grid-cols-[260px_1fr]">
            <FilterSidebar counties={counties} languages={languages} />

            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-cs-muted">
                  {results.count > 0 ? (
                    <>
                      Showing{" "}
                      <span className="font-medium text-cs-blue-dark">
                        {(page - 1) * PER_PAGE + 1}&ndash;
                        {Math.min(page * PER_PAGE, results.count)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-cs-blue-dark">
                        {results.count}
                      </span>{" "}
                      facilities
                    </>
                  ) : (
                    "No facilities found"
                  )}
                </p>
              </div>

              {results.data.length > 0 ? (
                <div className="space-y-4">
                  {results.data.map((facility) => (
                    <FacilityCard key={facility.id} facility={facility} />
                  ))}
                </div>
              ) : (
                <div className="rounded-card border border-cs-border bg-white p-10 text-center">
                  <p className="text-lg font-semibold text-cs-blue-dark">
                    No facilities match your filters
                  </p>
                  <p className="mt-2 text-sm text-cs-muted">
                    Try broadening your search or removing some filters.
                  </p>
                  <div className="mt-6">
                    <Button href="/search" variant="ghost">
                      Clear all filters
                    </Button>
                  </div>
                </div>
              )}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                createPageUrl={(p) => createPageUrl(searchParams, p)}
              />
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
