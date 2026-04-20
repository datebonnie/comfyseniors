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
  title: "Bergen County Assisted Living & Memory Care — ComfySeniors",
  description:
    "Search every licensed assisted living and memory care facility in Bergen County, NJ. Real prices, state inspection records, unfiltered reviews.",
};

const PER_PAGE = 20;

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Default county for the Bergen-County-only pivot. Users can override
// by explicitly setting ?county=Foo, but the bare /search lands in
// Bergen.
const DEFAULT_COUNTY = "Bergen";

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

  // Honor an explicit empty county (?county=) as "all counties" — that
  // way users CAN escape the default if they actively want to.
  const countyParam = searchParams["county"];
  const county =
    countyParam === undefined
      ? DEFAULT_COUNTY
      : typeof countyParam === "string"
        ? countyParam
        : undefined;

  // Accept both naming conventions for price filtering:
  //   priceMin / priceMax  — used by FilterSidebar's number inputs
  //   budget_min / budget_max — emitted by the homepage DecisionEngine
  // The DecisionEngine's "Not sure yet" option emits no budget params,
  // which correctly results in undefined here (no budget filter).
  const priceMinRaw = getStr("priceMin") || getStr("budget_min");
  const priceMaxRaw = getStr("priceMax") || getStr("budget_max");

  return {
    q: getStr("q"),
    careTypes: getArr("type").filter(Boolean) as CareType[],
    county,
    city: getStr("city"),
    priceMin: priceMinRaw ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw ? Number(priceMaxRaw) : undefined,
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

  // Progressive relaxation: if the user's exact filters match nothing,
  // retry without the "optional" filters (budget, payer toggles, clean
  // record). Never show an empty page when something broader would
  // match — the 3-step engine's last step can produce combinations
  // (e.g. "Memory Care + under $5K in Bergen") that no facility
  // actually satisfies, and silence is worse than a clear "we
  // loosened your filters" message.
  //
  // Care type and county are NOT relaxed — they're core intent
  // signals. If Bergen has zero Memory Care facilities at any price,
  // we still show zero (that's honest). In practice Bergen has 16
  // Memory Care facilities, so type-only retries always have hits.
  const hadOptionalFilters =
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.cleanRecordOnly ||
    filters.acceptsMedicaid ||
    filters.acceptsMedicare;

  let relaxed = false;
  if (results.count === 0 && hadOptionalFilters) {
    const relaxedFilters = {
      ...filters,
      priceMin: undefined,
      priceMax: undefined,
      cleanRecordOnly: false,
      acceptsMedicaid: false,
      acceptsMedicare: false,
    };
    try {
      const retry = await searchFacilities(relaxedFilters, 1, PER_PAGE);
      if (retry.count > 0) {
        results = retry;
        relaxed = true;
      }
    } catch {
      // leave results empty
    }
  }

  const totalPages = Math.ceil(results.count / PER_PAGE);

  // Build a human-readable description of which filters got relaxed,
  // used in the notice banner below. Only populated when relaxed=true.
  const relaxedParts: string[] = [];
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      relaxedParts.push(
        `$${filters.priceMin.toLocaleString()}–$${filters.priceMax.toLocaleString()} budget`
      );
    } else if (filters.priceMax !== undefined) {
      relaxedParts.push(`under $${filters.priceMax.toLocaleString()}`);
    } else if (filters.priceMin !== undefined) {
      relaxedParts.push(`$${filters.priceMin.toLocaleString()}+`);
    }
  }
  if (filters.cleanRecordOnly) relaxedParts.push("clean-record-only");
  if (filters.acceptsMedicaid) relaxedParts.push("accepts Medicaid");
  if (filters.acceptsMedicare) relaxedParts.push("accepts Medicare");

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
              {/* Relaxation notice — shown when the exact filters matched
                  nothing and we broadened the search to avoid a blank
                  page. Amber-toned so it stands out from the lavender
                  trust line; explicit about what got dropped so the user
                  knows we didn't silently ignore their preferences. */}
              {relaxed && (
                <div className="mb-4 rounded-card border-l-[3px] border-cs-amber-warn bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
                  <strong>
                    No Bergen County facilities matched your filters
                    {relaxedParts.length > 0 && (
                      <> ({relaxedParts.join(", ")})</>
                    )}
                    .
                  </strong>{" "}
                  Showing all {results.count.toLocaleString()} facilities
                  matching the rest of your search instead. Adjust filters
                  in the sidebar to narrow again.
                </div>
              )}

              {/* Trust line — appears above results to set expectations
                  about what we do and don't do with the visitor's data. */}
              {results.count > 0 && !relaxed && (
                <div className="mb-4 rounded-card border-l-[3px] border-cs-lavender bg-cs-lavender-mist px-4 py-3 text-sm text-cs-blue-dark">
                  Showing{" "}
                  <strong>{results.count.toLocaleString()}</strong> Bergen
                  County {results.count === 1 ? "facility" : "facilities"}{" "}
                  matching your criteria. We don&apos;t sell your info.
                  Call any facility directly — we never see it.
                </div>
              )}

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
