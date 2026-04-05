import type { Facility } from "@/types";
import CitationBadge from "@/components/ui/CitationBadge";

type InspectionProps = Pick<
  Facility,
  "citation_count" | "last_inspection" | "inspection_url" | "inspection_summary"
>;

export default function InspectionBlock({
  citation_count,
  last_inspection,
  inspection_url,
  inspection_summary,
}: InspectionProps) {
  const inspectionDate = last_inspection
    ? new Date(last_inspection).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="rounded-lg border border-cs-border bg-white p-5 sm:p-6">
      <h3 className="mb-4 font-sans text-base font-medium text-cs-blue-dark">
        State inspection record
      </h3>

      <div className="space-y-3">
        {inspectionDate && (
          <p className="text-sm text-cs-muted">
            <span className="font-medium text-cs-body">Last inspected:</span>{" "}
            {inspectionDate}
          </p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-cs-body">
            Citations in last 12 months:
          </span>
          <CitationBadge count={citation_count} />
        </div>

        {inspection_summary && (
          <p className="text-sm leading-relaxed text-cs-muted">
            {inspection_summary}
          </p>
        )}

        {inspection_url && (
          <a
            href={inspection_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cs-blue transition-colors hover:text-cs-blue-dark"
          >
            View full NJ Dept of Health report
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
