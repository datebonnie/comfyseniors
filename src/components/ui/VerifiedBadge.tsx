interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export default function VerifiedBadge({
  size = "sm",
  className = "",
}: VerifiedBadgeProps) {
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-cs-blue px-2 py-0.5 text-white ${className}`}
      title="Verified — all info confirmed accurate and up-to-date"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span className={`font-semibold ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
        Verified
      </span>
    </span>
  );
}
