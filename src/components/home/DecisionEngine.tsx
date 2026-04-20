import Link from "next/link";

/**
 * DecisionEngine — a 3-step "find the right facility" flow on the
 * homepage. Pure server component. State lives in URL search params
 * (?ds=N&for=X&care=Y), so the entire flow works with JavaScript
 * disabled — every option is a plain anchor link, every progression
 * is a real navigation, and the final CTA is a link to /search with
 * accumulated filters.
 *
 * URL contract:
 *   ?ds=1 (or absent) — Step 1: who needs care?
 *   ?ds=2&for=parent  — Step 2: care needed?
 *   ?ds=3&for=parent&care=al — Step 3: budget?
 *
 * "for" values:    parent | spouse | self | loved-one
 * "care" values:   al (Assisted Living) | mc (Memory Care) | both
 * "budget" values: under5 | 5-7 | 7-10 | 10plus | unsure
 *
 * The final CTA links to /search?type=...&budget_min=...&budget_max=...
 */

type Relationship = "parent" | "spouse" | "self" | "loved-one";
type CareChoice = "al" | "mc" | "both";

interface Props {
  ds?: string;
  forWho?: string;
  care?: string;
}

const RELATIONSHIP_OPTIONS: { value: Relationship; label: string }[] = [
  { value: "parent", label: "My parent" },
  { value: "spouse", label: "My spouse" },
  { value: "self", label: "Myself" },
  { value: "loved-one", label: "A loved one" },
];

const CARE_OPTIONS: {
  value: CareChoice;
  label: string;
  helper: string;
}[] = [
  {
    value: "al",
    label: "Daily tasks like bathing, meals, medications",
    helper: "Assisted Living",
  },
  {
    value: "mc",
    label: "Memory loss, dementia, or Alzheimer's",
    helper: "Memory Care",
  },
  {
    value: "both",
    label: "Not sure",
    helper: "Show both",
  },
];

const BUDGET_OPTIONS: {
  value: string;
  label: string;
  budgetParams: { min?: number; max?: number };
}[] = [
  { value: "under5", label: "Under $5K", budgetParams: { max: 5000 } },
  { value: "5-7", label: "$5K – $7K", budgetParams: { min: 5000, max: 7000 } },
  { value: "7-10", label: "$7K – $10K", budgetParams: { min: 7000, max: 10000 } },
  { value: "10plus", label: "$10K+", budgetParams: { min: 10000 } },
  { value: "unsure", label: "Not sure yet", budgetParams: {} },
];

function relationshipLabel(value: string | undefined): string {
  return (
    RELATIONSHIP_OPTIONS.find((o) => o.value === value)?.label.toLowerCase() ||
    "your loved one"
  );
}

function careTypesForChoice(care: string | undefined): string[] {
  if (care === "al") return ["Assisted Living"];
  if (care === "mc") return ["Memory Care"];
  if (care === "both") return ["Assisted Living", "Memory Care"];
  return [];
}

/** Build the final /search URL once all inputs are gathered. */
function buildSearchUrl(care: string | undefined, budget: string): string {
  const params = new URLSearchParams();
  for (const t of careTypesForChoice(care)) {
    params.append("type", t);
  }
  const opt = BUDGET_OPTIONS.find((b) => b.value === budget);
  if (opt?.budgetParams.min !== undefined) {
    params.set("budget_min", String(opt.budgetParams.min));
  }
  if (opt?.budgetParams.max !== undefined) {
    params.set("budget_max", String(opt.budgetParams.max));
  }
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default function DecisionEngine({ ds, forWho, care }: Props) {
  // Determine current step. Clamp to 1-3.
  let step: 1 | 2 | 3 = 1;
  if (ds === "2") step = 2;
  else if (ds === "3") step = 3;

  // Gracefully reset if the URL skipped a required prior step
  if (step === 2 && !forWho) step = 1;
  if (step === 3 && (!forWho || !care)) step = forWho ? 2 : 1;

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressDots step={step} />

      <div
        // animation runs on every render of the step card (server-rendered
        // page swap or React re-mount), so each transition feels intentional
        key={step}
        className="ds-step-in mt-6 rounded-card border border-cs-border bg-white p-6 sm:p-8"
      >
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 forWho={forWho!} />}
        {step === 3 && <Step3 forWho={forWho!} care={care!} />}
      </div>
    </div>
  );
}

/* ─── Steps ────────────────────────────────────────────────── */

// Scroll preservation across step transitions:
//   - `scroll={false}` on <Link> tells Next.js to NOT scroll to top
//     after a client-side navigation (handles the JS-on case).
//   - The `#engine` fragment in every href tells the browser to scroll
//     to the section anchor on full page navigation, which is right at
//     the section header — covers the JS-off case (where Next.js's
//     scroll prop is irrelevant because the browser does the navigation).
const FRAG = "#engine";

function Step1() {
  return (
    <>
      <h3 className="font-display text-2xl font-normal text-cs-blue-dark">
        Who needs care?
      </h3>
      <p className="mt-1 text-sm text-cs-muted">
        We&apos;ll personalize the rest based on this.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {RELATIONSHIP_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/?ds=2&for=${opt.value}${FRAG}`}
            scroll={false}
            className="rounded-btn border border-cs-border bg-white px-4 py-3 text-left text-sm font-medium text-cs-body transition-colors hover:border-cs-blue hover:bg-cs-blue-light hover:text-cs-blue-dark"
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-cs-muted">
        Step 1 of 3 · No signup required
      </p>
    </>
  );
}

function Step2({ forWho }: { forWho: string }) {
  const who = relationshipLabel(forWho);

  return (
    <>
      <h3 className="font-display text-2xl font-normal text-cs-blue-dark">
        What kind of help does {who} need?
      </h3>
      <p className="mt-1 text-sm text-cs-muted">
        This filters the facilities we show you next.
      </p>

      <div className="mt-6 space-y-2">
        {CARE_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/?ds=3&for=${forWho}&care=${opt.value}${FRAG}`}
            scroll={false}
            className="block rounded-btn border border-cs-border bg-white px-4 py-3 text-left transition-colors hover:border-cs-blue hover:bg-cs-blue-light"
          >
            <div className="text-sm font-medium text-cs-body">{opt.label}</div>
            <div className="mt-0.5 text-xs text-cs-lavender">{opt.helper}</div>
          </Link>
        ))}
      </div>

      <BackLink href={`/?ds=1${FRAG}`} />
    </>
  );
}

function Step3({ forWho, care }: { forWho: string; care: string }) {
  return (
    <>
      <h3 className="font-display text-2xl font-normal text-cs-blue-dark">
        What&apos;s the monthly budget?
      </h3>
      <p className="mt-1 text-sm text-cs-muted">
        Skip if you&apos;re not sure — we&apos;ll show all price ranges.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {BUDGET_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildSearchUrl(care, opt.value)}
            className="rounded-btn border border-cs-border bg-white px-4 py-3 text-left text-sm font-medium text-cs-body transition-colors hover:border-cs-blue hover:bg-cs-blue-light hover:text-cs-blue-dark"
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href={buildSearchUrl(care, "unsure")}
          className="inline-flex items-center justify-center rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
        >
          Show me facilities &rarr;
        </Link>
      </div>

      <BackLink href={`/?ds=2&for=${forWho}${FRAG}`} />
    </>
  );
}

/* ─── Shared bits ──────────────────────────────────────────── */

function ProgressDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-label={`Step ${step} of 3`}
      className="flex items-center justify-center gap-2"
    >
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-2.5 w-2.5 rounded-full transition-colors ${
            n <= step ? "bg-cs-blue" : "bg-cs-border"
          }`}
        />
      ))}
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <div className="mt-6 text-center">
      <Link
        href={href}
        className="text-xs text-cs-muted transition-colors hover:text-cs-blue-dark"
      >
        ← Back
      </Link>
    </div>
  );
}
