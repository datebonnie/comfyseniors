interface PriceDisplayProps {
  priceMin: number | null;
  priceMax: number | null;
  variant?: "compact" | "full";
  className?: string;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PriceDisplay({
  priceMin,
  priceMax,
  variant = "compact",
  className = "",
}: PriceDisplayProps) {
  const hasPrice = priceMin !== null || priceMax !== null;

  if (!hasPrice) {
    return (
      <div className={className}>
        {variant === "full" && (
          <span className="label mb-1 block text-cs-muted">Monthly cost</span>
        )}
        <span className="text-sm italic text-cs-muted">
          Pricing not listed &mdash; contact facility directly
        </span>
      </div>
    );
  }

  const priceText =
    priceMin && priceMax && priceMin !== priceMax
      ? `${formatPrice(priceMin)} \u2013 ${formatPrice(priceMax)}`
      : `From ${formatPrice(priceMin ?? priceMax!)}`;

  if (variant === "compact") {
    return (
      <span className={`text-sm font-semibold text-cs-blue ${className}`}>
        {priceText}
        <span className="text-xs font-normal text-cs-muted"> / mo</span>
      </span>
    );
  }

  return (
    <div className={className}>
      <span className="label mb-1 block text-cs-muted">Monthly cost</span>
      <span className="text-lg font-semibold text-cs-blue">
        {priceText}
        <span className="text-sm font-normal text-cs-muted"> / month</span>
      </span>
    </div>
  );
}
