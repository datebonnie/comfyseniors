"use client";

import { useEffect, useState } from "react";

/**
 * First-visit onboarding tour for the facility dashboard. A lightweight
 * 4-step callout tour, purely client-side, gated by localStorage so
 * it shows exactly once per browser.
 *
 * Not a modal — a simple dismissable floating card that sits in the
 * bottom-right with 4 sequential steps. Each step points at a concept
 * rather than an exact pixel, so layout changes don't break the tour.
 *
 * Why localStorage and not a DB column: the tour is a one-time
 * educational moment, not a business-logic state. If the admin clears
 * localStorage or switches browsers and re-sees the tour, no harm done.
 * Keeps the tour friction-free to iterate on — no migrations.
 */

const STORAGE_KEY = "comfyseniors.dashboard.tour.seen.v1";

const STEPS = [
  {
    title: "Welcome to your dashboard.",
    body: "This is where you'll manage your ComfySeniors listing going forward. Three things worth knowing first.",
  },
  {
    title: "The checklist above is your priority list.",
    body: "Upload photos, write your description, list amenities. Facilities that finish this convert at roughly 3x unfinished ones.",
  },
  {
    title: "Inquiries route straight to your inbox.",
    body: "When a family clicks \u201cContact\u201d on your public page, you get an email. We never sit in the middle.",
  },
  {
    title: "Questions? Email me personally.",
    body: "bmontero@comfyseniors.com goes straight to the founder. 24-hour response, every time.",
  },
];

export default function DashboardTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      // localStorage disabled (Safari private, etc.) — skip the tour
      // rather than break the dashboard.
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Ignore storage failures
    }
    setVisible(false);
  }

  function advance() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-label="Dashboard tour"
      className="fixed bottom-6 right-6 z-40 max-w-sm animate-in rounded-card border border-cs-border bg-white p-5 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-4 bg-cs-blue"
                  : i < step
                    ? "w-2 bg-cs-blue/40"
                    : "w-2 bg-cs-border"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <button
          onClick={dismiss}
          aria-label="Close tour"
          className="text-cs-muted transition-colors hover:text-cs-blue-dark"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>
      </div>
      <h3 className="font-sans text-sm font-semibold text-cs-blue-dark">
        {current.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-cs-body">
        {current.body}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={dismiss}
          className="text-xs text-cs-muted transition-colors hover:text-cs-blue-dark"
        >
          Skip tour
        </button>
        <button
          onClick={advance}
          className="rounded-btn bg-cs-blue px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cs-blue-dark"
        >
          {isLast ? "Got it" : `Next (${step + 1}/${STEPS.length})`}
        </button>
      </div>
    </div>
  );
}
