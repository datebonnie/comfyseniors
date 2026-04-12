interface NotVerifiedLabelProps {
  size?: "sm" | "md";
  className?: string;
}

export default function NotVerifiedLabel({
  size = "sm",
  className = "",
}: NotVerifiedLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-cs-amber-warn/30 bg-[#FEF3C7] px-2 py-0.5 text-[#92400E] ${className}`}
      title="This facility has not verified their information"
    >
      <svg
        width={size === "sm" ? 12 : 14}
        height={size === "sm" ? 12 : 14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span className={`font-semibold ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
        Not verified
      </span>
    </span>
  );
}
