interface CitationBadgeProps {
  count: number;
  className?: string;
}

export default function CitationBadge({
  count,
  className = "",
}: CitationBadgeProps) {
  if (count === 0) {
    return (
      <span
        className={`label inline-flex items-center gap-1.5 rounded-full bg-[#EAF3DE] px-2.5 py-1 text-[11px] text-[#2D6A4F] ${className}`}
      >
        <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#2D7D3A]" />
        Clean record
      </span>
    );
  }

  const isHigh = count >= 3;

  return (
    <span
      className={`label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${
        isHigh
          ? "bg-[#FEE2E2] text-[#991B1B]"
          : "bg-[#FEF3C7] text-[#92400E]"
      } ${className}`}
    >
      <span
        className={`inline-block h-[7px] w-[7px] rounded-full ${
          isHigh ? "bg-[#B91C1C]" : "bg-[#D97706]"
        }`}
      />
      {count} citation{count !== 1 && "s"}
      {isHigh && " \u2014 review carefully"}
    </span>
  );
}
