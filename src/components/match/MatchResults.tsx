import Link from "next/link";
import CareTypeBadge from "@/components/ui/CareTypeBadge";
import PriceDisplay from "@/components/ui/PriceDisplay";
import CitationBadge from "@/components/ui/CitationBadge";
import Button from "@/components/ui/Button";
import type { CareType } from "@/types";

interface MatchedFacility {
  id: string;
  name: string;
  slug: string;
  care_types: CareType[];
  city: string | null;
  county: string | null;
  zip: string | null;
  price_min: number | null;
  price_max: number | null;
  citation_count: number;
  description: string | null;
}

interface Match {
  facility_id: string;
  match_reason: string;
  priority_rank: number;
  facility: MatchedFacility;
}

interface MatchResultsProps {
  matches: Match[];
  searchUrl: string;
}

export default function MatchResults({
  matches,
  searchUrl,
}: MatchResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center">
        <h2 className="mb-3 font-display text-2xl text-cs-blue-dark">
          No matches found
        </h2>
        <p className="mb-6 text-cs-muted">
          We couldn&apos;t find facilities matching your exact criteria. Try
          broadening your search.
        </p>
        <Button href="/search" size="lg">
          Browse all facilities
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="font-display text-2xl text-cs-blue-dark sm:text-3xl">
          Your top matches
        </h2>
        <p className="mt-2 text-cs-muted">
          Based on your answers, here are the best options for your family.
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match, i) => (
          <div
            key={match.facility_id}
            className="rounded-card border border-cs-border bg-white p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              {/* Rank badge */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cs-blue text-sm font-semibold text-white">
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {match.facility.care_types?.map((type) => (
                    <CareTypeBadge key={type} type={type} />
                  ))}
                </div>

                <Link
                  href={`/facility/${match.facility.slug}`}
                  className="text-lg font-semibold text-cs-blue-dark transition-colors hover:text-cs-blue"
                >
                  {match.facility.name}
                </Link>

                <p className="mt-1 text-sm text-cs-muted">
                  {[match.facility.city, "NJ", match.facility.zip]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {/* Match reason */}
                <p className="mt-3 rounded-btn border-l-[3px] border-cs-blue bg-cs-blue-light px-3 py-2 text-sm text-cs-blue-dark">
                  {match.match_reason}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <PriceDisplay
                    priceMin={match.facility.price_min}
                    priceMax={match.facility.price_max}
                  />
                  <CitationBadge count={match.facility.citation_count} />
                </div>

                <div className="mt-4">
                  <Button
                    href={`/facility/${match.facility.slug}`}
                    variant="ghost"
                    size="sm"
                  >
                    View full profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button href={searchUrl} variant="secondary" size="lg">
          See all matching results
        </Button>
      </div>
    </div>
  );
}
