interface StaffTurnoverProps {
  rnTurnover: number | null;
  totalTurnover: number | null;
}

// NJ state averages from CMS
const NJ_AVG_RN_TURNOVER = 38.5;
const NJ_AVG_TOTAL_TURNOVER = 51.2;

export default function StaffTurnover({
  rnTurnover,
  totalTurnover,
}: StaffTurnoverProps) {
  if (!rnTurnover && !totalTurnover) return null;

  function comparisonLabel(value: number, avg: number): { text: string; color: string } {
    const diff = value - avg;
    if (diff > 10) {
      return {
        text: `${Math.round(diff)}% above NJ avg`,
        color: "text-orange-800 bg-orange-100",
      };
    }
    if (diff < -10) {
      return {
        text: `${Math.round(Math.abs(diff))}% below NJ avg`,
        color: "text-green-800 bg-green-100",
      };
    }
    return {
      text: "Near NJ avg",
      color: "text-cs-blue bg-cs-blue-light",
    };
  }

  return (
    <div className="rounded-btn border border-cs-border bg-white p-4">
      <h4 className="mb-3 font-semibold text-cs-blue-dark">
        Staff turnover (last 12 months)
      </h4>
      <p className="mb-3 text-xs text-cs-muted">
        High turnover can indicate staffing problems. Lower is better.
      </p>

      <div className="space-y-3">
        {rnTurnover !== null && rnTurnover !== undefined && (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cs-body">Registered Nurses</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cs-blue-dark">
                  {rnTurnover.toFixed(1)}%
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    comparisonLabel(rnTurnover, NJ_AVG_RN_TURNOVER).color
                  }`}
                >
                  {comparisonLabel(rnTurnover, NJ_AVG_RN_TURNOVER).text}
                </span>
              </div>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-cs-border">
              <div
                className="h-full rounded-full bg-cs-blue"
                style={{ width: `${Math.min(rnTurnover, 100)}%` }}
              />
            </div>
          </div>
        )}

        {totalTurnover !== null && totalTurnover !== undefined && (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cs-body">All nursing staff</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cs-blue-dark">
                  {totalTurnover.toFixed(1)}%
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    comparisonLabel(totalTurnover, NJ_AVG_TOTAL_TURNOVER).color
                  }`}
                >
                  {comparisonLabel(totalTurnover, NJ_AVG_TOTAL_TURNOVER).text}
                </span>
              </div>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-cs-border">
              <div
                className="h-full rounded-full bg-cs-lavender"
                style={{ width: `${Math.min(totalTurnover, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-cs-muted">
        NJ averages: RN {NJ_AVG_RN_TURNOVER}% / total {NJ_AVG_TOTAL_TURNOVER}%.
        Source: CMS.
      </p>
    </div>
  );
}
