import type { Facility } from "@/types";
import CareTypeBadge from "@/components/ui/CareTypeBadge";
import StarRating from "@/components/ui/StarRating";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import NotVerifiedLabel from "@/components/ui/NotVerifiedLabel";

interface FacilityHeaderProps {
  facility: Facility;
  avgRating: number;
  reviewCount: number;
}

export default function FacilityHeader({
  facility,
  avgRating,
  reviewCount,
}: FacilityHeaderProps) {
  return (
    <div>
      {/* Badges row — guard against the (DB-impossible-but-defensive)
          state of featured + not-verified by suppressing the Featured
          badge unless verification is also in place. Mirrors the CHECK
          constraint chk_featured_implies_verified from migration 012. */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {facility.is_featured && facility.is_verified && (
          <span className="label inline-block rounded-full bg-cs-blue px-2.5 py-1 text-[11px] text-white">
            Featured
          </span>
        )}
        {facility.is_verified ? <VerifiedBadge size="md" /> : <NotVerifiedLabel size="md" />}
        {facility.care_types?.map((type) => (
          <CareTypeBadge key={type} type={type} />
        ))}
      </div>

      {/* Name */}
      <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
        {facility.name}
      </h1>

      {/* Location */}
      <p className="mt-2 text-cs-muted">
        {[facility.city, facility.state, facility.zip].filter(Boolean).join(", ")}
      </p>

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="mt-3">
          <StarRating
            rating={avgRating}
            reviewCount={reviewCount}
            size="md"
          />
        </div>
      )}
    </div>
  );
}
