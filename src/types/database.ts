// ============================================================
// ComfySeniors.com — Shared TypeScript types
// Mirrors the Supabase PostgreSQL schema exactly
// ============================================================

export type CareType =
  | "Assisted Living"
  | "Memory Care"
  | "Independent Living"
  | "Nursing Home"
  | "Home Care";

export interface Facility {
  id: string;
  name: string;
  slug: string;
  care_types: CareType[];
  address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  county: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  price_min: number | null;
  price_max: number | null;
  beds: number | null;
  license_number: string | null;
  license_status: string | null;
  citation_count: number;
  last_inspection: string | null;
  inspection_summary: string | null;
  inspection_url: string | null;
  accepts_medicaid: boolean;
  accepts_medicare: boolean;
  accepts_private: boolean;
  languages: string[] | null;
  description: string | null;
  amenities: string[] | null;
  is_featured: boolean;
  featured_since: string | null;
  featured_expires: string | null;
  is_verified: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  facility_id: string;
  reviewer_name: string | null;
  relationship: string | null;
  rating: number;
  body: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  facility_id: string;
  inquiry_type: string | null;
  message: string | null;
  created_at: string;
}

export interface FeaturedSubscription {
  id: string;
  facility_id: string;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  plan: string | null;
  status: string | null;
  started_at: string | null;
  expires_at: string | null;
}

export interface FAQQuestion {
  id: string;
  question: string;
  answer: string | null;
  category: string | null;
  order_index: number | null;
  created_at: string;
}

/** Facility with aggregated review stats — used in cards and search results */
export interface FacilityWithStats extends Facility {
  avg_rating: number;
  review_count: number;
}

/** Search filter parameters — maps 1:1 with URL search params */
export interface SearchFilters {
  q?: string;
  careTypes?: CareType[];
  county?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  acceptsMedicaid?: boolean;
  acceptsMedicare?: boolean;
  languages?: string[];
  cleanRecordOnly?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "citations_asc";
}
