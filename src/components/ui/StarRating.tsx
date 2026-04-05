interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

function Star({
  filled,
  half,
  size,
}: {
  filled: boolean;
  half: boolean;
  size: number;
}) {
  const id = `half-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0"
    >
      {half && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#E8E4F0" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
        fill={half ? `url(#${id})` : filled ? "#D97706" : "#E8E4F0"}
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  reviewCount,
  size = "sm",
  className = "",
}: StarRatingProps) {
  const starSize = size === "sm" ? 14 : 18;
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            filled={rounded >= i}
            half={rounded === i - 0.5}
            size={starSize}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm font-medium text-cs-blue-dark">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-cs-muted">
          ({reviewCount} review{reviewCount !== 1 && "s"})
        </span>
      )}
    </div>
  );
}
