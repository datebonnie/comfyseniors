"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import type { CareType } from "@/types";

const CARE_TYPES: CareType[] = [
  "Assisted Living",
  "Memory Care",
  "Independent Living",
  "Nursing Home",
  "Home Care",
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "citations_asc", label: "Fewest Citations" },
];

interface FilterSidebarProps {
  counties: string[];
  languages: string[];
}

export default function FilterSidebar({
  counties,
  languages,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read current filter state from URL
  const currentCareTypes = searchParams.getAll("type");
  const currentCounty = searchParams.get("county") ?? "";
  const currentCity = searchParams.get("city") ?? "";
  const currentPriceMin = searchParams.get("priceMin") ?? "";
  const currentPriceMax = searchParams.get("priceMax") ?? "";
  const currentMedicaid = searchParams.get("medicaid") === "true";
  const currentMedicare = searchParams.get("medicare") === "true";
  const currentLanguages = searchParams.getAll("lang");
  const currentClean = searchParams.get("clean") === "true";
  const currentSort = searchParams.get("sort") ?? "relevance";
  const currentQ = searchParams.get("q") ?? "";

  const updateFilters = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams();

      // Preserve q
      if (currentQ) params.set("q", currentQ);

      // Merge current with updates
      const merged = {
        type: currentCareTypes,
        county: currentCounty,
        city: currentCity,
        priceMin: currentPriceMin,
        priceMax: currentPriceMax,
        medicaid: currentMedicaid ? "true" : "",
        medicare: currentMedicare ? "true" : "",
        lang: currentLanguages,
        clean: currentClean ? "true" : "",
        sort: currentSort,
        ...updates,
      };

      // Build params
      const typeArr =
        typeof merged.type === "string" ? [merged.type] : (merged.type as string[]);
      typeArr.forEach((t) => {
        if (t) params.append("type", t);
      });

      if (merged.county) params.set("county", merged.county as string);
      if (merged.city) params.set("city", merged.city as string);
      if (merged.priceMin) params.set("priceMin", merged.priceMin as string);
      if (merged.priceMax) params.set("priceMax", merged.priceMax as string);
      if (merged.medicaid === "true") params.set("medicaid", "true");
      if (merged.medicare === "true") params.set("medicare", "true");

      const langArr =
        typeof merged.lang === "string" ? [merged.lang] : (merged.lang as string[]);
      langArr.forEach((l) => {
        if (l) params.append("lang", l);
      });

      if (merged.clean === "true") params.set("clean", "true");
      if (merged.sort && merged.sort !== "relevance")
        params.set("sort", merged.sort as string);

      // Reset to page 1
      router.push(`/search?${params.toString()}`);
    },
    [
      router,
      currentQ,
      currentCareTypes,
      currentCounty,
      currentCity,
      currentPriceMin,
      currentPriceMax,
      currentMedicaid,
      currentMedicare,
      currentLanguages,
      currentClean,
      currentSort,
    ]
  );

  function handleCareTypeToggle(type: string, checked: boolean) {
    const next = checked
      ? [...currentCareTypes, type]
      : currentCareTypes.filter((t) => t !== type);
    updateFilters({ type: next });
  }

  function handleLanguageToggle(lang: string, checked: boolean) {
    const next = checked
      ? [...currentLanguages, lang]
      : currentLanguages.filter((l) => l !== lang);
    updateFilters({ lang: next });
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label className="label mb-2 block text-cs-blue-dark font-semibold">Sort by</label>
        <select
          value={currentSort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="w-full rounded-lg border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cs-blue/20"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Care type */}
      <div>
        <span className="label mb-2 block text-cs-blue-dark font-semibold">Care type</span>
        <div className="space-y-2">
          {CARE_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-cs-body">
              <input
                type="checkbox"
                checked={currentCareTypes.includes(type)}
                onChange={(e) => handleCareTypeToggle(type, e.target.checked)}
                className="h-4 w-4 rounded border-cs-border text-cs-blue accent-cs-blue"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* County */}
      {counties.length > 0 && (
        <div>
          <label className="label mb-2 block text-cs-blue-dark font-semibold">County</label>
          <select
            value={currentCounty}
            onChange={(e) => updateFilters({ county: e.target.value })}
            className="w-full rounded-lg border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cs-blue/20"
          >
            <option value="">All counties</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City */}
      <div>
        <label className="label mb-2 block text-cs-blue-dark font-semibold">City</label>
        <input
          type="text"
          value={currentCity}
          onChange={(e) => updateFilters({ city: e.target.value })}
          placeholder="e.g. Newark"
          className="w-full rounded-lg border border-cs-border bg-white px-3 py-2 text-sm outline-none placeholder:text-cs-muted/60 focus:ring-2 focus:ring-cs-blue/20"
        />
      </div>

      {/* Price range */}
      <div>
        <span className="label mb-2 block text-cs-blue-dark font-semibold">
          Price range ($/mo)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentPriceMin}
            onChange={(e) => updateFilters({ priceMin: e.target.value })}
            placeholder="Min"
            min={0}
            className="w-full rounded-lg border border-cs-border bg-white px-3 py-2 text-sm outline-none placeholder:text-cs-muted/60 focus:ring-2 focus:ring-cs-blue/20"
          />
          <span className="text-cs-muted">&ndash;</span>
          <input
            type="number"
            value={currentPriceMax}
            onChange={(e) => updateFilters({ priceMax: e.target.value })}
            placeholder="Max"
            min={0}
            className="w-full rounded-lg border border-cs-border bg-white px-3 py-2 text-sm outline-none placeholder:text-cs-muted/60 focus:ring-2 focus:ring-cs-blue/20"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-cs-body">
          <input
            type="checkbox"
            checked={currentMedicaid}
            onChange={(e) =>
              updateFilters({ medicaid: e.target.checked ? "true" : "" })
            }
            className="h-4 w-4 rounded border-cs-border text-cs-blue accent-cs-blue"
          />
          Accepts Medicaid
        </label>
        <label className="flex items-center gap-2 text-sm text-cs-body">
          <input
            type="checkbox"
            checked={currentMedicare}
            onChange={(e) =>
              updateFilters({ medicare: e.target.checked ? "true" : "" })
            }
            className="h-4 w-4 rounded border-cs-border text-cs-blue accent-cs-blue"
          />
          Accepts Medicare
        </label>
        <label className="flex items-center gap-2 text-sm text-cs-body">
          <input
            type="checkbox"
            checked={currentClean}
            onChange={(e) =>
              updateFilters({ clean: e.target.checked ? "true" : "" })
            }
            className="h-4 w-4 rounded border-cs-border text-cs-blue accent-cs-blue"
          />
          Clean record only
        </label>
      </div>

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <span className="label mb-2 block text-cs-blue-dark font-semibold">Languages</span>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {languages.map((lang) => (
              <label
                key={lang}
                className="flex items-center gap-2 text-sm text-cs-body"
              >
                <input
                  type="checkbox"
                  checked={currentLanguages.includes(lang)}
                  onChange={(e) => handleLanguageToggle(lang, e.target.checked)}
                  className="h-4 w-4 rounded border-cs-border text-cs-blue accent-cs-blue"
                />
                {lang}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear all */}
      <button
        onClick={() => router.push("/search")}
        className="w-full rounded-lg border border-cs-border px-4 py-2 text-sm text-cs-muted transition-colors hover:text-cs-blue-dark"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-cs-border bg-white px-4 py-2.5 text-sm font-semibold text-cs-body md:hidden"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h10M4 18h6" />
        </svg>
        Filters
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-cs-blue-dark/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-cs-blue-dark">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-cs-muted"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block">{filterContent}</aside>
    </>
  );
}
