import Link from "next/link";
import type { FacilityWithStats } from "@/types";
import CareTypeBadge from "./CareTypeBadge";
import CitationBadge from "./CitationBadge";
import PriceDisplay from "./PriceDisplay";
import StarRating from "./StarRating";
import Button from "./Button";
import VerifiedBadge from "./VerifiedBadge";
import NotVerifiedLabel from "./NotVerifiedLabel";

interface FacilityCardProps {
  facility: FacilityWithStats;
  className?: string;
}

export default function FacilityCard({
  facility,
  className = "",
}: FacilityCardProps) {
  const {
    name,
    slug,
    care_types,
    city,
    state,
    price_min,
    price_max,
    citation_count,
    is_featured,
    is_verified,
    zip,
    description,
    avg_rating,
    review_count,
    value_score,
  } = facility;

  // "Best for" label based on data
  const bestForLabel = getBestForLabel(facility);

  return (
    <div
      className={`rounded-card bg-white p-5 transition-shadow hover:shadow-md sm:p-6 ${
        is_featured
          ? "border-2 border-cs-blue"
          : "border border-cs-border"
      } ${className}`}
    >
      {/* Top row: badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {is_featured && (
          <span className="label inline-block rounded-full bg-cs-blue px-2.5 py-1 text-[11px] text-white">
            Featured
          </span>
        )}
        {is_verified ? <VerifiedBadge /> : <NotVerifiedLabel />}
        {bestForLabel && (
          <span className="label inline-block rounded-full bg-cs-lavender/10 px-2.5 py-1 text-[11px] text-cs-lavender">
            ★ {bestForLabel}
          </span>
        )}
        {care_types?.map((type) => (
          <CareTypeBadge key={type} type={type} />
        ))}
      </div>

      {/* Name */}
      <Link
        href={`/facility/${slug}`}
        className="block font-sans text-lg font-semibold text-cs-blue-dark transition-colors hover:text-cs-blue"
      >
        {name}
      </Link>

      {/* Location */}
      <p className="mt-1 text-sm text-cs-muted">
        {[city, state, zip].filter(Boolean).join(", ")}
      </p>

      {/* Value score + Rating row */}
      {(value_score !== null && value_score !== undefined) || review_count > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {value_score !== null && value_score !== undefined && (
            <div className="inline-flex items-center gap-1 text-xs">
              <span className="label text-cs-lavender">Value</span>
              <span className="font-bold text-cs-blue-dark">{value_score}</span>
              <span className="text-cs-muted">/100</span>
            </div>
          )}
          {review_count > 0 && (
            <StarRating rating={avg_rating} reviewCount={review_count} />
          )}
        </div>
      ) : null}

      {/* Price + citation row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <PriceDisplay priceMin={price_min} priceMax={price_max} />
        <CitationBadge count={citation_count} />
      </div>

      {/* Description */}
      {description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cs-muted">
          {description}
        </p>
      )}

      {/* CTAs */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button href={`/facility/${slug}`} variant="ghost" size="sm">
          View facility
        </Button>
      </div>
    </div>
  );
}

/** Derive a simple "best for" label from facility data */
function getBestForLabel(facility: FacilityWithStats): string | null {
  const { value_score, citation_count, overall_rating, price_min } = facility;

  if (citation_count === 0 && (overall_rating ?? 0) >= 4) {
    return "Clean record, top rated";
  }
  if ((value_score ?? 0) >= 85) {
    return "Best value";
  }
  if (citation_count === 0) {
    return "Clean inspection record";
  }
  if ((overall_rating ?? 0) >= 5) {
    return "Top rated";
  }
  if (price_min && price_min < 4000) {
    return "Budget-friendly";
  }
  return null;
}
