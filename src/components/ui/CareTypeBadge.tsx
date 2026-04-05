import type { CareType } from "@/types";

interface CareTypeBadgeProps {
  type: CareType;
  className?: string;
}

const styleMap: Record<CareType, string> = {
  "Assisted Living": "bg-[#EDE9F7] text-[#5B3D8A]",
  "Memory Care": "bg-[#E0E9FF] text-[#1E3A8A]",
  "Independent Living": "bg-[#E0F2FE] text-[#075985]",
  "Nursing Home": "bg-[#F0F4FF] text-[#3B5BA5]",
  "Home Care": "bg-[#F3F0FF] text-[#4C3899]",
};

export default function CareTypeBadge({
  type,
  className = "",
}: CareTypeBadgeProps) {
  return (
    <span
      className={`label inline-block rounded-full px-2.5 py-1 text-[11px] ${styleMap[type]} ${className}`}
    >
      {type}
    </span>
  );
}
