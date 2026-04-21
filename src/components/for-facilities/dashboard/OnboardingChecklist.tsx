import Link from "next/link";
import type { OnboardingStep } from "@/lib/onboarding";

interface Props {
  steps: OnboardingStep[];
  completionPercent: number;
  isComplete: boolean;
}

/**
 * Dashboard-facing version of the diagnostic widget pattern. Mirrors
 * ViewCounter (public-side, facing families) but rotated: here the
 * same kind of data audit becomes an action list for the operator.
 *
 * Rendering states:
 *   0-24%   → amber, "Your profile needs setup"
 *   25-74%  → blue,  "X% complete — keep going"
 *   75-99%  → blue,  "Almost there"
 *   100%    → green, small "Profile complete" confirmation
 */
export default function OnboardingChecklist({
  steps,
  completionPercent,
  isComplete,
}: Props) {
  // Fully complete — just a quiet confirmation, not a nag.
  if (isComplete) {
    return (
      <div className="rounded-card border border-cs-green-ok/40 bg-cs-green-ok/5 p-4 text-sm">
        <div className="flex items-center gap-2 text-cs-green-ok">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <p className="font-medium">Your profile is complete.</p>
        </div>
        <p className="mt-1 text-xs text-cs-muted">
          Nothing left to do. Families see your best work.
        </p>
      </div>
    );
  }

  const tone = completionPercent < 25 ? "amber" : "blue";

  const containerClass =
    tone === "amber"
      ? "rounded-card border border-cs-amber-warn/40 bg-[#FEF3C7] p-5"
      : "rounded-card border border-cs-border bg-white p-5";

  const headingClass =
    tone === "amber" ? "text-[#92400E]" : "text-cs-blue-dark";

  const barTrackClass =
    tone === "amber" ? "bg-[#FDE68A]" : "bg-cs-border";

  const barFillClass = tone === "amber" ? "bg-[#92400E]" : "bg-cs-blue";

  const headline =
    completionPercent < 25
      ? "Your profile needs setup."
      : completionPercent < 75
        ? `Your profile is ${completionPercent}% complete.`
        : "Almost there.";

  const pendingSteps = steps.filter((s) => !s.done);
  const doneCount = steps.length - pendingSteps.length;

  return (
    <div className={containerClass}>
      <div className="flex items-start gap-3">
        {tone === "amber" && (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="#92400E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M10 9v4M10 17h.01" />
            <path d="M8.57 3.22L1.5 15a2 2 0 001.72 3h13.56a2 2 0 001.72-3L11.43 3.22a2 2 0 00-2.86 0z" />
          </svg>
        )}
        <div className="flex-1">
          <h2 className={`font-sans text-base font-semibold ${headingClass}`}>
            {headline}
          </h2>
          <p
            className={`mt-1 text-xs ${
              tone === "amber" ? "text-[#92400E]" : "text-cs-muted"
            }`}
          >
            {doneCount} of {steps.length} steps done. Finishing these
            typically takes 10–15 minutes and lifts profile conversion
            roughly 3x vs an unfinished listing.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className={`mt-3 h-2 w-full overflow-hidden rounded-full ${barTrackClass}`}
        role="progressbar"
        aria-valuenow={completionPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile ${completionPercent}% complete`}
      >
        <div
          className={`h-full rounded-full transition-all ${barFillClass}`}
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Remaining steps */}
      <ul className="mt-4 space-y-2">
        {pendingSteps.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className={`flex items-start gap-3 rounded-btn border p-3 transition-colors ${
                tone === "amber"
                  ? "border-[#FCD34D] bg-white hover:border-[#92400E]"
                  : "border-cs-border bg-white hover:border-cs-blue"
              }`}
            >
              <span
                className={`mt-0.5 inline-block h-4 w-4 shrink-0 rounded-sm border-2 ${
                  tone === "amber"
                    ? "border-[#92400E]"
                    : "border-cs-border"
                }`}
                aria-hidden="true"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-cs-blue-dark">
                  {step.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-cs-muted">
                  {step.subtitle}
                </span>
              </span>
              <span
                className={`self-center text-xs font-medium ${
                  tone === "amber" ? "text-[#92400E]" : "text-cs-blue"
                }`}
              >
                Fix &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
