interface ValueScoreProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  /**
   * If true, renders a small explainer underneath telling families what
   * the score actually measures. Use on facility profile pages, omit on
   * search-result cards (keeps cards compact).
   */
  withExplainer?: boolean;
}

export default function ValueScore({
  score,
  size = "md",
  withExplainer = false,
}: ValueScoreProps) {
  if (score === null || score === undefined) return null;

  const label =
    score >= 80
      ? "Excellent value"
      : score >= 65
        ? "Strong value"
        : score >= 50
          ? "Fair value"
          : score >= 35
            ? "Below average"
            : "Premium price for quality";

  const color =
    score >= 80
      ? "bg-green-100 text-green-800 border-green-300"
      : score >= 65
        ? "bg-cs-blue-light text-cs-blue border-cs-border-blue"
        : score >= 50
          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
          : score >= 35
            ? "bg-orange-100 text-orange-800 border-orange-300"
            : "bg-red-100 text-red-800 border-red-300";

  const sizeClasses =
    size === "lg"
      ? "text-2xl font-display px-4 py-2"
      : size === "md"
        ? "text-base font-semibold px-3 py-1.5"
        : "text-sm font-semibold px-2.5 py-1";

  // Native HTML tooltip — works in every browser, no JS, no dependencies
  const tooltipText =
    "Value Score blends QUALITY (CMS rating + recent inspection citations) " +
    "with PRICE (this facility's cost vs. the county median for the same care type). " +
    "Higher scores mean better quality for the price.";

  return (
    <div className="inline-block">
      <div
        className={`inline-flex items-center gap-2 rounded-btn border ${color} ${sizeClasses}`}
        title={tooltipText}
      >
        <span className="font-bold">{score}</span>
        <span className="text-xs opacity-75">/ 100</span>
        {size !== "sm" && <span className="ml-1 text-xs font-medium">{label}</span>}
      </div>
      {withExplainer && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-cs-muted">
          Quality (60%) + price vs. county median (40%). A higher score
          means better care for the dollar — not just a lower price, and
          not just a better facility. Both, together.
        </p>
      )}
    </div>
  );
}
