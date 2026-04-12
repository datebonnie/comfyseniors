import { createClient } from "./supabase";
import type {
  Facility,
  FacilityWithStats,
  FAQQuestion,
  Review,
  SearchFilters,
  InspectionDeficiency,
  CountyBenchmark,
} from "@/types";

// ────────────────────────────────────────────
// Homepage
// ────────────────────────────────────────────

export async function getFeaturedFacilities(
  limit = 3
): Promise<FacilityWithStats[]> {
  const supabase = createClient();

  const { data: facilities } = await supabase
    .from("facilities")
    .select("*")
    .eq("is_featured", true)
    .order("featured_since", { ascending: false })
    .limit(limit);

  if (!facilities || facilities.length === 0) return [];

  return attachReviewStats(facilities as Facility[]);
}

export async function getTopFAQs(limit = 3): Promise<FAQQuestion[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("faq_questions")
    .select("*")
    .order("order_index", { ascending: true })
    .limit(limit);

  return (data as FAQQuestion[]) ?? [];
}

export async function getFacilityCount(): Promise<number> {
  const supabase = createClient();

  const { count } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true });

  return count ?? 0;
}

// ────────────────────────────────────────────
// Search
// ────────────────────────────────────────────

/** Detect if a query looks like a NJ zip code (5 digits starting with 0) */
function isNjZipCode(q: string): boolean {
  return /^0[789]\d{3}$/.test(q.trim());
}

export async function searchFacilities(
  filters: SearchFilters,
  page = 1,
  perPage = 20
): Promise<{ data: FacilityWithStats[]; count: number }> {
  const result = await searchFacilitiesInternal(filters, page, perPage);

  // Fallback: if zero results and query is a NJ zip code, broaden to 3-digit prefix
  if (result.count === 0 && filters.q && isNjZipCode(filters.q)) {
    const prefix = filters.q.trim().slice(0, 3);
    const broadFilters: SearchFilters = { ...filters, q: prefix };
    return searchFacilitiesInternal(broadFilters, page, perPage);
  }

  return result;
}

async function searchFacilitiesInternal(
  filters: SearchFilters,
  page = 1,
  perPage = 20
): Promise<{ data: FacilityWithStats[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("facilities")
    .select("*", { count: "exact" });

  // Text search on name, city, zip, county, description
  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,city.ilike.%${filters.q}%,zip.ilike.%${filters.q}%,county.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    );
  }

  // Care type filter — array overlap
  if (filters.careTypes && filters.careTypes.length > 0) {
    query = query.overlaps("care_types", filters.careTypes);
  }

  if (filters.county) {
    query = query.eq("county", filters.county);
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters.priceMin !== undefined) {
    query = query.gte("price_min", filters.priceMin);
  }

  if (filters.priceMax !== undefined) {
    query = query.lte("price_max", filters.priceMax);
  }

  if (filters.acceptsMedicaid) {
    query = query.eq("accepts_medicaid", true);
  }

  if (filters.acceptsMedicare) {
    query = query.eq("accepts_medicare", true);
  }

  if (filters.cleanRecordOnly) {
    query = query.eq("citation_count", 0);
  }

  if (filters.languages && filters.languages.length > 0) {
    query = query.overlaps("languages", filters.languages);
  }

  // Sorting
  switch (filters.sort) {
    case "price_asc":
      query = query.order("price_min", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price_max", { ascending: false, nullsFirst: false });
      break;
    case "citations_asc":
      query = query.order("citation_count", { ascending: true });
      break;
    default:
      // Relevance: featured first, then by name
      query = query
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true });
  }

  query = query.range(from, to);

  const { data: facilities, count } = await query;

  if (!facilities || facilities.length === 0) {
    return { data: [], count: 0 };
  }

  const withStats = await attachReviewStats(facilities as Facility[]);
  return { data: withStats, count: count ?? 0 };
}

export async function getDistinctCounties(): Promise<string[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("facilities")
    .select("county")
    .not("county", "is", null)
    .order("county");

  if (!data) return [];

  const unique = Array.from(new Set(data.map((r) => r.county as string)));
  return unique;
}

export async function getDistinctLanguages(): Promise<string[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("facilities")
    .select("languages")
    .not("languages", "is", null);

  if (!data) return [];

  const all = data.flatMap((r) => (r.languages as string[]) ?? []);
  const unique = Array.from(new Set(all)).sort();
  return unique;
}

// ────────────────────────────────────────────
// Facility Page
// ────────────────────────────────────────────

export async function getFacilityBySlug(
  slug: string
): Promise<Facility | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("facilities")
    .select("*")
    .eq("slug", slug)
    .single();

  return (data as Facility) ?? null;
}

export async function getFacilityReviews(
  facilityId: string
): Promise<Review[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("facility_id", facilityId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (data as Review[]) ?? [];
}

export async function getReviewStats(
  facilityId: string
): Promise<{ avgRating: number; reviewCount: number }> {
  const supabase = createClient();

  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("facility_id", facilityId)
    .eq("is_published", true);

  if (!data || data.length === 0) {
    return { avgRating: 0, reviewCount: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    avgRating: Math.round((sum / data.length) * 10) / 10,
    reviewCount: data.length,
  };
}

export async function getSimilarFacilities(
  facility: Facility,
  limit = 3
): Promise<FacilityWithStats[]> {
  const supabase = createClient();

  let query = supabase
    .from("facilities")
    .select("*")
    .neq("id", facility.id)
    .limit(limit);

  // Prefer same care types
  if (facility.care_types && facility.care_types.length > 0) {
    query = query.overlaps("care_types", facility.care_types);
  }

  // Prefer same county
  if (facility.county) {
    query = query.eq("county", facility.county);
  }

  const { data } = await query;

  if (!data || data.length === 0) return [];

  return attachReviewStats(data as Facility[]);
}

// ────────────────────────────────────────────
// Enrichment Data (Phase B)
// ────────────────────────────────────────────

/** Get all inspection deficiencies for a facility, sorted by date */
export async function getFacilityDeficiencies(
  facilityId: string
): Promise<InspectionDeficiency[]> {
  const supabase = createClient();

  try {
    const { data } = await supabase
      .from("inspection_deficiencies")
      .select("*")
      .eq("facility_id", facilityId)
      .order("survey_date", { ascending: false });

    return (data as InspectionDeficiency[]) ?? [];
  } catch {
    return [];
  }
}

/** Get county cost benchmarks for a specific county and care type */
export async function getCountyBenchmark(
  county: string,
  careType: string
): Promise<CountyBenchmark | null> {
  const supabase = createClient();

  try {
    const { data } = await supabase
      .from("county_benchmarks")
      .select("*")
      .eq("county", county)
      .eq("care_type", careType)
      .maybeSingle();

    return (data as CountyBenchmark) ?? null;
  } catch {
    return null;
  }
}

/** Get facilities by slugs (for comparison tool) */
export async function getFacilitiesBySlugs(
  slugs: string[]
): Promise<Facility[]> {
  if (slugs.length === 0) return [];
  const supabase = createClient();

  const { data } = await supabase
    .from("facilities")
    .select("*")
    .in("slug", slugs);

  return (data as Facility[]) ?? [];
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

/** Attach avg_rating and review_count to an array of facilities */
async function attachReviewStats(
  facilities: Facility[]
): Promise<FacilityWithStats[]> {
  if (facilities.length === 0) return [];

  const supabase = createClient();
  const ids = facilities.map((f) => f.id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("facility_id, rating")
    .in("facility_id", ids)
    .eq("is_published", true);

  // Group ratings by facility
  const statsMap = new Map<string, number[]>();
  for (const r of reviews ?? []) {
    const arr = statsMap.get(r.facility_id) ?? [];
    arr.push(r.rating);
    statsMap.set(r.facility_id, arr);
  }

  return facilities.map((f) => {
    const ratings = statsMap.get(f.id) ?? [];
    const sum = ratings.reduce((a, b) => a + b, 0);
    return {
      ...f,
      avg_rating:
        ratings.length > 0
          ? Math.round((sum / ratings.length) * 10) / 10
          : 0,
      review_count: ratings.length,
    };
  });
}
