interface CareTypeBadgeProps {
  /**
   * String rather than the narrow CareType union — facilities in the
   * database may still have legacy values ("Independent Living",
   * "Nursing Home", "Home Care", "Hospice") that pre-date the
   * Bergen-County pivot. We keep their badge styles for backward-
   * compatible rendering on existing facility cards/profiles.
   */
  type: string;
  className?: string;
}

const styleMap: Record<string, string> = {
  // Active care types (post-pivot)
  "Assisted Living": "bg-[#EDE9F7] text-[#5B3D8A]",
  "Memory Care": "bg-[#E0E9FF] text-[#1E3A8A]",
  // Legacy values — still rendered when present on existing facility rows
  "Independent Living": "bg-[#E0F2FE] text-[#075985]",
  "Nursing Home": "bg-[#F0F4FF] text-[#3B5BA5]",
  "Home Care": "bg-[#F3F0FF] text-[#4C3899]",
  Hospice: "bg-[#FDF2F8] text-[#9D174D]",
};

const DEFAULT_STYLE = "bg-cs-blue-light text-cs-blue-dark";

export default function CareTypeBadge({
  type,
  className = "",
}: CareTypeBadgeProps) {
  const style = styleMap[type] || DEFAULT_STYLE;
  return (
    <span
      className={`label inline-block rounded-full px-2.5 py-1 text-[11px] ${style} ${className}`}
    >
      {type}
    </span>
  );
}
