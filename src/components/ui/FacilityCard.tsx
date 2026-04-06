import Link from "next/link";
import type { FacilityWithStats } from "@/types";
import CareTypeBadge from "./CareTypeBadge";
import CitationBadge from "./CitationBadge";
import PriceDisplay from "./PriceDisplay";
import StarRating from "./StarRating";
import Button from "./Button";

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
    price_min,
    price_max,
    citation_count,
    is_featured,
    zip,
    description,
    avg_rating,
    review_count,
  } = facility;

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
        {[city, "NJ", zip].filter(Boolean).join(", ")}
      </p>

      {/* Rating + Price row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <PriceDisplay priceMin={price_min} priceMax={price_max} />
        <CitationBadge count={citation_count} />
      </div>

      {review_count > 0 && (
        <div className="mt-2">
          <StarRating rating={avg_rating} reviewCount={review_count} />
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cs-muted">
          {description}
        </p>
      )}

      {/* CTA */}
      <div className="mt-4">
        <Button href={`/facility/${slug}`} variant="ghost" size="sm">
          View facility
        </Button>
      </div>
    </div>
  );
}
