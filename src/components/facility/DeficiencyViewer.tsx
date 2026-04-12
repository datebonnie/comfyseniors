"use client";

import { useState } from "react";
import type { InspectionDeficiency } from "@/types";

interface DeficiencyViewerProps {
  deficiencies: InspectionDeficiency[];
}

const SEVERITY_LABELS: Record<string, { label: string; color: string; description: string }> = {
  A: { label: "A", color: "bg-green-100 text-green-800", description: "Minimal harm potential" },
  B: { label: "B", color: "bg-green-100 text-green-800", description: "Minimal harm potential" },
  C: { label: "C", color: "bg-green-100 text-green-800", description: "Minimal harm potential" },
  D: { label: "D", color: "bg-yellow-100 text-yellow-800", description: "More than minimal harm potential" },
  E: { label: "E", color: "bg-yellow-100 text-yellow-800", description: "More than minimal harm potential" },
  F: { label: "F", color: "bg-yellow-100 text-yellow-800", description: "More than minimal harm potential" },
  G: { label: "G", color: "bg-orange-100 text-orange-800", description: "Actual harm" },
  H: { label: "H", color: "bg-orange-100 text-orange-800", description: "Actual harm" },
  I: { label: "I", color: "bg-orange-100 text-orange-800", description: "Actual harm" },
  J: { label: "J", color: "bg-red-100 text-red-800", description: "Immediate jeopardy" },
  K: { label: "K", color: "bg-red-100 text-red-800", description: "Immediate jeopardy" },
  L: { label: "L", color: "bg-red-100 text-red-800", description: "Immediate jeopardy" },
};

export default function DeficiencyViewer({ deficiencies }: DeficiencyViewerProps) {
  const [expanded, setExpanded] = useState(false);

  if (deficiencies.length === 0) {
    return (
      <div className="rounded-btn border border-cs-green-ok/30 bg-cs-green-ok/5 p-4">
        <p className="text-sm font-medium text-cs-green-ok">
          Clean inspection record
        </p>
        <p className="mt-1 text-xs text-cs-muted">
          No deficiencies found during the most recent health inspection.
        </p>
      </div>
    );
  }

  // Group by category
  const byCategory = new Map<string, InspectionDeficiency[]>();
  for (const d of deficiencies) {
    const cat = d.category || "Other";
    const arr = byCategory.get(cat) ?? [];
    arr.push(d);
    byCategory.set(cat, arr);
  }

  const categories = Array.from(byCategory.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  const visibleCount = expanded ? deficiencies.length : Math.min(5, deficiencies.length);
  const displayed = expanded
    ? deficiencies
    : deficiencies.slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 font-semibold text-cs-blue-dark">
          Deficiencies by category
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(([cat, items]) => (
            <span
              key={cat}
              className="rounded-full border border-cs-border bg-cs-lavender-mist px-3 py-1 text-xs text-cs-body"
            >
              {cat}: <strong>{items.length}</strong>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-cs-blue-dark">
          Individual citations ({visibleCount} of {deficiencies.length})
        </h4>

        <div className="space-y-3">
          {displayed.map((d) => {
            const severity = d.severity ? SEVERITY_LABELS[d.severity] : null;
            return (
              <div
                key={d.id}
                className="rounded-btn border border-cs-border bg-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {d.tag_number && (
                    <span className="label rounded bg-cs-blue-light px-2 py-0.5 text-[10px] text-cs-blue">
                      F-{d.tag_number}
                    </span>
                  )}
                  {severity && (
                    <span
                      className={`label rounded px-2 py-0.5 text-[10px] ${severity.color}`}
                      title={severity.description}
                    >
                      Severity {severity.label}
                    </span>
                  )}
                  {d.is_complaint && (
                    <span className="label rounded bg-orange-100 px-2 py-0.5 text-[10px] text-orange-800">
                      Complaint
                    </span>
                  )}
                  {d.is_corrected && (
                    <span className="label rounded bg-green-100 px-2 py-0.5 text-[10px] text-green-800">
                      Corrected
                    </span>
                  )}
                </div>

                {d.category && (
                  <p className="mb-1 text-xs font-medium text-cs-muted">
                    {d.category}
                  </p>
                )}

                {d.description && (
                  <p className="text-sm text-cs-body">{d.description}</p>
                )}

                <div className="mt-2 flex gap-4 text-xs text-cs-muted">
                  {d.survey_date && <span>Inspected: {d.survey_date}</span>}
                  {d.correction_date && (
                    <span>Corrected: {d.correction_date}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {deficiencies.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full rounded-btn border border-cs-blue px-4 py-2 text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue-light"
          >
            {expanded
              ? "Show fewer"
              : `Show all ${deficiencies.length} citations`}
          </button>
        )}
      </div>

      <div className="rounded-btn border border-cs-border bg-cs-lavender-mist p-3">
        <p className="text-xs leading-relaxed text-cs-muted">
          <strong className="text-cs-blue-dark">About severity codes:</strong>{" "}
          A-C = minimal harm, D-F = more than minimal harm, G-I = actual harm,
          J-L = immediate jeopardy. Source: CMS (Centers for Medicare &amp;
          Medicaid Services).
        </p>
      </div>
    </div>
  );
}
