import type { InspectionDeficiency } from "@/types";

interface InspectionTimelineProps {
  deficiencies: InspectionDeficiency[];
}

export default function InspectionTimeline({
  deficiencies,
}: InspectionTimelineProps) {
  if (deficiencies.length === 0) return null;

  // Group by survey date
  const byDate = new Map<string, InspectionDeficiency[]>();
  for (const d of deficiencies) {
    if (!d.survey_date) continue;
    const arr = byDate.get(d.survey_date) ?? [];
    arr.push(d);
    byDate.set(d.survey_date, arr);
  }

  const dates = Array.from(byDate.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  if (dates.length === 0) return null;

  return (
    <div className="rounded-btn border border-cs-border bg-white p-5">
      <h4 className="mb-4 font-semibold text-cs-blue-dark">
        Inspection timeline
      </h4>

      <div className="space-y-4">
        {dates.map(([date, items], index) => {
          const jeopardy = items.filter((i) =>
            ["J", "K", "L"].includes(i.severity || "")
          ).length;
          const harm = items.filter((i) =>
            ["G", "H", "I"].includes(i.severity || "")
          ).length;
          const total = items.length;

          return (
            <div key={date} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full border-2 ${
                    jeopardy > 0
                      ? "border-red-500 bg-red-100"
                      : harm > 0
                        ? "border-orange-500 bg-orange-100"
                        : total === 0
                          ? "border-cs-green-ok bg-cs-green-ok/20"
                          : "border-cs-lavender bg-cs-lavender/20"
                  }`}
                />
                {index < dates.length - 1 && (
                  <div className="mt-1 h-full w-0.5 bg-cs-border" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-semibold text-cs-blue-dark">
                  {new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-0.5 text-sm text-cs-body">
                  {total} deficienc{total === 1 ? "y" : "ies"} found
                </p>
                {(jeopardy > 0 || harm > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {jeopardy > 0 && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        {jeopardy} immediate jeopardy
                      </span>
                    )}
                    {harm > 0 && (
                      <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                        {harm} actual harm
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
