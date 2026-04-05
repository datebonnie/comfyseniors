"use client";

import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { QuizProgress, QuizStep, MatchResults } from "@/components/match";

/* ─── Quiz step definitions ─── */

const STEPS = [
  {
    question: "Who needs care?",
    options: [
      { value: "parent", label: "My parent" },
      { value: "spouse", label: "My spouse" },
      { value: "myself", label: "Myself" },
      { value: "other", label: "Someone else" },
    ],
  },
  {
    question: "What type of care are you looking for?",
    options: [
      { value: "not sure", label: "Not sure yet" },
      { value: "assisted living", label: "Assisted Living" },
      { value: "memory care", label: "Memory Care" },
      { value: "independent", label: "Independent Living" },
      { value: "nursing home", label: "Nursing Home" },
      { value: "home care", label: "Home Care" },
    ],
  },
  {
    question: "Where in New Jersey?",
    hasInput: true,
    inputPlaceholder: "City or zip code",
    options: [],
    secondaryLabel: "Search radius",
    secondaryOptions: [
      { value: "5", label: "5 miles" },
      { value: "10", label: "10 miles" },
      { value: "25", label: "25 miles" },
    ],
  },
  {
    question: "What is your monthly budget?",
    options: [
      { value: "under $3K", label: "Under $3,000/mo" },
      { value: "$3-5K", label: "$3,000 \u2013 $5,000/mo" },
      { value: "$5-8K", label: "$5,000 \u2013 $8,000/mo" },
      { value: "over $8K", label: "Over $8,000/mo" },
      { value: "not sure", label: "Not sure" },
    ],
  },
  {
    question: "How will care be paid for?",
    options: [
      { value: "private pay", label: "Private pay" },
      { value: "Medicare", label: "Medicare" },
      { value: "Medicaid", label: "Medicaid" },
      { value: "long-term care insurance", label: "Long-term care insurance" },
      { value: "not sure", label: "Not sure" },
    ],
  },
];

interface QuizAnswers {
  relationship: string;
  careType: string;
  location: string;
  radius: string;
  budget: string;
  insurance: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MatchResult = any;

export default function MatchPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    relationship: "",
    careType: "",
    location: "",
    radius: "10",
    budget: "",
    insurance: "",
  });
  const [status, setStatus] = useState<"quiz" | "loading" | "results">("quiz");
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const ANSWER_KEYS: (keyof QuizAnswers)[] = [
    "relationship",
    "careType",
    "location",
    "budget",
    "insurance",
  ];

  function handleSelect(value: string) {
    const key = ANSWER_KEYS[step];
    setAnswers((prev) => ({ ...prev, [key]: value }));

    // Auto-advance for non-input steps
    if (!STEPS[step].hasInput) {
      if (step < STEPS.length - 1) {
        setStep(step + 1);
      } else {
        submitQuiz({ ...answers, [key]: value });
      }
    }
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      submitQuiz(answers);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  async function submitQuiz(final: QuizAnswers) {
    setStatus("loading");

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final),
      });

      const data = await res.json();
      setMatches(data.matches ?? []);
      setStatus("results");
    } catch {
      setMatches([]);
      setStatus("results");
    }
  }

  function buildSearchUrl(): string {
    const params = new URLSearchParams();
    if (answers.careType && answers.careType !== "not sure") {
      const typeMap: Record<string, string> = {
        "assisted living": "Assisted Living",
        "memory care": "Memory Care",
        independent: "Independent Living",
        "nursing home": "Nursing Home",
        "home care": "Home Care",
      };
      const mapped = typeMap[answers.careType];
      if (mapped) params.set("type", mapped);
    }
    if (answers.location) params.set("city", answers.location);
    if (answers.insurance === "Medicaid") params.set("medicaid", "true");
    if (answers.insurance === "Medicare") params.set("medicare", "true");
    return `/search?${params.toString()}`;
  }

  function restart() {
    setStep(0);
    setAnswers({
      relationship: "",
      careType: "",
      location: "",
      radius: "10",
      budget: "",
      insurance: "",
    });
    setStatus("quiz");
    setMatches([]);
  }

  const currentStepDef = STEPS[step];
  const currentKey = ANSWER_KEYS[step];

  return (
    <PageWrapper>
      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* ─── Quiz ─── */}
        {status === "quiz" && (
          <>
            <div className="mb-2 text-center">
              <span className="label text-cs-lavender">Care Match Quiz</span>
              <p className="mt-1 text-sm text-cs-muted">
                No signup required. Find your best options in 60 seconds.
              </p>
            </div>

            <QuizProgress currentStep={step + 1} totalSteps={STEPS.length} />

            <QuizStep
              question={currentStepDef.question}
              options={currentStepDef.options}
              selected={answers[currentKey]}
              onSelect={handleSelect}
              hasInput={currentStepDef.hasInput}
              inputValue={currentKey === "location" ? answers.location : ""}
              onInputChange={(v) =>
                setAnswers((prev) => ({ ...prev, location: v }))
              }
              inputPlaceholder={currentStepDef.inputPlaceholder}
              secondaryLabel={currentStepDef.secondaryLabel}
              secondaryOptions={currentStepDef.secondaryOptions}
              secondarySelected={answers.radius}
              onSecondarySelect={(v) =>
                setAnswers((prev) => ({ ...prev, radius: v }))
              }
            />

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="text-sm text-cs-muted transition-colors hover:text-cs-blue-dark disabled:invisible"
              >
                &larr; Back
              </button>

              {/* Show Next/Get Results for input steps or final step */}
              {(currentStepDef.hasInput || step === STEPS.length - 1) && (
                <button
                  onClick={handleNext}
                  disabled={
                    currentStepDef.hasInput
                      ? !answers.location.trim()
                      : !answers[currentKey]
                  }
                  className="rounded-lg bg-cs-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-40"
                >
                  {step === STEPS.length - 1 ? "Get my matches" : "Next \u2192"}
                </button>
              )}
            </div>
          </>
        )}

        {/* ─── Loading ─── */}
        {status === "loading" && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cs-blue/20 border-t-cs-blue" />
            <p className="text-lg font-medium text-cs-blue-dark">
              Finding your best matches...
            </p>
            <p className="mt-2 text-sm text-cs-muted">
              Our AI is comparing your answers with New Jersey facilities.
            </p>
          </div>
        )}

        {/* ─── Results ─── */}
        {status === "results" && (
          <>
            <MatchResults matches={matches} searchUrl={buildSearchUrl()} />

            <div className="mt-6 text-center">
              <button
                onClick={restart}
                className="text-sm text-cs-muted transition-colors hover:text-cs-lavender"
              >
                Start over
              </button>
            </div>
          </>
        )}
      </section>
    </PageWrapper>
  );
}
