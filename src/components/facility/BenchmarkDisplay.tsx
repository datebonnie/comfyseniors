import type { CountyBenchmark } from "@/types";

interface BenchmarkDisplayProps {
  facilityPriceMin: number | null;
  benchmark: CountyBenchmark | null;
}

export default function BenchmarkDisplay({
  facilityPriceMin,
  benchmark,
}: BenchmarkDisplayProps) {
  if (!benchmark || !facilityPriceMin || !benchmark.avg_price_min) return null;

  const diff = facilityPriceMin - benchmark.avg_price_min;
  const percentDiff = Math.round((diff / benchmark.avg_price_min) * 100);
  const isAbove = percentDiff > 5;
  const isBelow = percentDiff < -5;

  return (
    <div className="rounded-btn border border-cs-border bg-cs-lavender-mist p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label mb-1 text-cs-lavender">
            {benchmark.county} County benchmark
          </p>
          <p className="text-sm text-cs-muted">
            Average {benchmark.care_type.toLowerCase()}:{" "}
            <span className="font-semibold text-cs-blue-dark">
              ${benchmark.avg_price_min?.toLocaleString()} &ndash; $
              {benchmark.avg_price_max?.toLocaleString()}
            </span>
            /month
          </p>
          <p className="mt-1 text-xs text-cs-muted">
            Based on {benchmark.facility_count} facilities in {benchmark.county}{" "}
            County
          </p>
        </div>
        <div className="text-right">
          {isAbove && (
            <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
              +{percentDiff}% above avg
            </span>
          )}
          {isBelow && (
            <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              {percentDiff}% below avg
            </span>
          )}
          {!isAbove && !isBelow && (
            <span className="inline-block rounded bg-cs-blue-light px-2 py-1 text-xs font-semibold text-cs-blue">
              At average
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
