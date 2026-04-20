"use client";

import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { QuizProgress, QuizStep, MatchResults } from "@/components/match";

/* ─── 10-question quiz ─── */

const STEPS = [
  {
    question: "Who needs care?",
    options: [
      { value: "parent", label: "My parent" },
      { value: "spouse", label: "My spouse or partner" },
      { value: "myself", label: "Myself" },
      { value: "other", label: "Another family member or friend" },
    ],
  },
  {
    question: "How old is the person who needs care?",
    options: [
      { value: "under 65", label: "Under 65" },
      { value: "65-74", label: "65 – 74" },
      { value: "75-84", label: "75 – 84" },
      { value: "85+", label: "85 or older" },
    ],
  },
  {
    question: "What is their biggest daily challenge right now?",
    options: [
      { value: "mostly independent", label: "They're mostly independent — just want community and convenience" },
      { value: "daily activities", label: "They need help with bathing, dressing, or meals" },
      { value: "memory issues", label: "Memory loss, confusion, or wandering" },
      { value: "medical needs", label: "Complex medical needs — wounds, IVs, or 24/7 nursing" },
      { value: "mobility", label: "Mobility issues — falls, wheelchair, or bed-bound" },
      { value: "staying home", label: "They want to stay home but need help during the day" },
    ],
  },
  {
    question: "Do they need help with medications?",
    options: [
      { value: "no", label: "No — they manage medications on their own" },
      { value: "reminders", label: "Yes — they need reminders or someone to organize pills" },
      { value: "administered", label: "Yes — medications need to be given by trained staff" },
      { value: "complex", label: "Yes — injections, IVs, or complex medication schedules" },
    ],
  },
  {
    question: "Have they been diagnosed with Alzheimer's or dementia?",
    options: [
      { value: "no", label: "No" },
      { value: "early stage", label: "Yes — early stage (mild forgetfulness)" },
      { value: "moderate", label: "Yes — moderate (needs supervision, gets confused)" },
      { value: "advanced", label: "Yes — advanced (needs 24/7 specialized care)" },
    ],
  },
  {
    question: "How soon is care needed?",
    options: [
      { value: "immediately", label: "Right now — it's urgent" },
      { value: "1-3 months", label: "Within the next 1 – 3 months" },
      { value: "3-6 months", label: "Within 3 – 6 months" },
      { value: "planning ahead", label: "Just planning ahead — no rush" },
    ],
  },
  {
    question: "What is the zip code where you're looking for care?",
    hasInput: true,
    inputPlaceholder: "Enter your zip code",
    options: [],
  },
  {
    question: "What is the monthly budget for care?",
    options: [
      { value: "under $3K", label: "Under $3,000/month" },
      { value: "$3-5K", label: "$3,000 – $5,000/month" },
      { value: "$5-8K", label: "$5,000 – $8,000/month" },
      { value: "$8-12K", label: "$8,000 – $12,000/month" },
      { value: "over $12K", label: "Over $12,000/month" },
      { value: "not sure", label: "Not sure yet" },
    ],
  },
  {
    question: "How will care be paid for?",
    options: [
      { value: "private pay", label: "Private pay (savings, family funds)" },
      { value: "long-term care insurance", label: "Long-term care insurance" },
      { value: "Medicare", label: "Medicare" },
      { value: "Medicaid", label: "Medicaid" },
      { value: "VA benefits", label: "VA / military benefits" },
      { value: "not sure", label: "Not sure — need help figuring this out" },
    ],
  },
  {
    question: "What matters most to your family?",
    options: [
      { value: "clean record", label: "Clean inspection record — safety first" },
      { value: "close to family", label: "Close to family — location matters most" },
      { value: "affordability", label: "Affordability — best care within our budget" },
      { value: "quality of life", label: "Quality of life — activities, dining, community" },
      { value: "medical expertise", label: "Medical expertise — skilled nursing and rehab" },
      { value: "cultural fit", label: "Cultural or language-specific care" },
    ],
  },
];

interface QuizAnswers {
  relationship: string;
  age: string;
  dailyChallenge: string;
  medications: string;
  dementia: string;
  urgency: string;
  zipCode: string;
  budget: string;
  insurance: string;
  priority: string;
}

const ANSWER_KEYS: (keyof QuizAnswers)[] = [
  "relationship",
  "age",
  "dailyChallenge",
  "medications",
  "dementia",
  "urgency",
  "zipCode",
  "budget",
  "insurance",
  "priority",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MatchResult = any;

export default function MatchClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    relationship: "",
    age: "",
    dailyChallenge: "",
    medications: "",
    dementia: "",
    urgency: "",
    zipCode: "",
    budget: "",
    insurance: "",
    priority: "",
  });
  const [status, setStatus] = useState<"quiz" | "loading" | "results">("quiz");
  const [matches, setMatches] = useState<MatchResult[]>([]);

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

    // Infer care type from answers
    const careType = inferCareType(answers);
    if (careType) params.set("type", careType);

    if (answers.zipCode) params.set("q", answers.zipCode);
    if (answers.insurance === "Medicaid") params.set("medicaid", "true");
    if (answers.insurance === "Medicare") params.set("medicare", "true");
    if (answers.priority === "clean record") params.set("clean", "true");

    return `/search?${params.toString()}`;
  }

  function restart() {
    setStep(0);
    setAnswers({
      relationship: "",
      age: "",
      dailyChallenge: "",
      medications: "",
      dementia: "",
      urgency: "",
      zipCode: "",
      budget: "",
      insurance: "",
      priority: "",
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
                No signup required. 10 questions to find your best match.
              </p>
            </div>

            <QuizProgress currentStep={step + 1} totalSteps={STEPS.length} />

            <QuizStep
              question={currentStepDef.question}
              options={currentStepDef.options}
              selected={answers[currentKey]}
              onSelect={handleSelect}
              hasInput={currentStepDef.hasInput}
              inputValue={currentKey === "zipCode" ? answers.zipCode : ""}
              onInputChange={(v) =>
                setAnswers((prev) => ({ ...prev, zipCode: v }))
              }
              inputPlaceholder={currentStepDef.inputPlaceholder}
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

              {(currentStepDef.hasInput || step === STEPS.length - 1) && (
                <button
                  onClick={handleNext}
                  disabled={
                    currentStepDef.hasInput
                      ? !answers.zipCode.trim()
                      : !answers[currentKey]
                  }
                  className="rounded-btn bg-cs-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-40"
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
              Analyzing your answers against Bergen County facilities.
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

/** Infer the best care type from quiz answers */
function inferCareType(answers: QuizAnswers): string | null {
  // Memory care if dementia is moderate or advanced
  if (answers.dementia === "moderate" || answers.dementia === "advanced") {
    return "Memory Care";
  }

  // Nursing home if complex medical or bed-bound
  if (
    answers.dailyChallenge === "medical needs" ||
    answers.medications === "complex"
  ) {
    return "Nursing Home";
  }

  // Home care if they want to stay home
  if (answers.dailyChallenge === "staying home") {
    return "Home Care";
  }

  // Independent living if mostly independent
  if (answers.dailyChallenge === "mostly independent") {
    return "Independent Living";
  }

  // Assisted living for daily activity help, mobility, or early dementia
  if (
    answers.dailyChallenge === "daily activities" ||
    answers.dailyChallenge === "mobility" ||
    answers.dementia === "early stage"
  ) {
    return "Assisted Living";
  }

  return null;
}
