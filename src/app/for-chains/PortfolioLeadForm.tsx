"use client";

import { useState } from "react";
import { submitPortfolioLead } from "@/app/actions/portfolio-lead";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function PortfolioLeadForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus("submitting");
    setErrorMsg(null);

    const result = await submitPortfolioLead(formData);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-card border border-cs-green-ok/30 bg-cs-green-ok/5 p-8 text-center">
        <div className="mb-3 flex justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="text-cs-green-ok"
          >
            <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.1" />
            <path
              d="M12 20l6 6 10-12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-display text-xl text-cs-blue-dark">
          Got it. We&apos;ll reach out within one business day.
        </h3>
        <p className="text-sm text-cs-body">
          Meanwhile, you can review our approach to data and security on the{" "}
          <a href="/trust" className="font-semibold text-cs-blue hover:underline">
            trust page
          </a>
          , or browse a sample Bergen County listing on{" "}
          <a href="/search" className="font-semibold text-cs-blue hover:underline">
            /search
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      action={onSubmit}
      className="space-y-4 rounded-card border border-cs-border bg-white p-6 sm:p-8"
    >
      <Field label="Chain or operator name" name="chain_name" required>
        <input
          type="text"
          name="chain_name"
          required
          placeholder="e.g. Sunrise Senior Living"
          className="w-full rounded-btn border border-cs-border bg-white px-4 py-2.5 text-sm outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Total facilities in your portfolio"
          name="total_facilities_count"
          required
          helper="25 minimum for portfolio deals"
        >
          <input
            type="number"
            name="total_facilities_count"
            required
            min={25}
            placeholder="e.g. 48"
            className="w-full rounded-btn border border-cs-border bg-white px-4 py-2.5 text-sm outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
          />
        </Field>

        <Field label="Primary state" name="primary_state" required>
          <select
            name="primary_state"
            required
            defaultValue=""
            className="w-full rounded-btn border border-cs-border bg-white px-4 py-2.5 text-sm outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
          >
            <option value="" disabled>
              Select state
            </option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Your name" name="contact_name" required>
        <input
          type="text"
          name="contact_name"
          required
          placeholder="Full name"
          className="w-full rounded-btn border border-cs-border bg-white px-4 py-2.5 text-sm outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Work email" name="contact_email" required>
          <input
            type="email"
            name="contact_email"
            required
            placeholder="you@company.com"
            className="w-full rounded-btn border border-cs-border bg-white px-4 py-2.5 text-sm outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
          />
        </Field>

        <Field label="Direct phone" name="contact_phone" required>
          <input
            type="tel"
            name="contact_phone"
            required
            placeholder="(555) 555-5555"
            className="w-full rounded-btn border border-cs-border bg-white px-4 py-2.5 text-sm outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50 sm:w-auto"
      >
        {status === "submitting"
          ? "Submitting…"
          : "Request a portfolio proposal"}
      </button>

      {status === "error" && errorMsg && (
        <p className="text-sm text-cs-red-alert">{errorMsg}</p>
      )}

      <p className="text-xs text-cs-muted">
        We&apos;ll reach out within one business day. Your information is used
        only to contact you about a portfolio deal — never added to marketing
        lists. See our{" "}
        <a href="/privacy" className="text-cs-blue hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  helper,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="label mb-1.5 block text-cs-blue-dark"
      >
        {label}
        {required && <span className="ml-1 text-cs-red-alert">*</span>}
      </label>
      {children}
      {helper && <p className="mt-1 text-xs text-cs-muted">{helper}</p>}
    </div>
  );
}
