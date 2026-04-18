"use client";

import { useState } from "react";

interface Props {
  email?: string;
  token?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function UnsubscribeForm({ email, token }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasValidLink = Boolean(email && token);

  async function submit() {
    if (!email || !token) return;
    setStatus("submitting");
    setErrorMsg(null);

    try {
      const url = `/api/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();

      if (data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (!hasValidLink) {
    return (
      <div className="rounded-card border border-cs-border bg-white p-6 text-center">
        <h2 className="mb-2 font-sans text-lg font-semibold text-cs-blue-dark">
          Missing unsubscribe link
        </h2>
        <p className="text-sm text-cs-body">
          This page works when opened from the unsubscribe link in a ComfySeniors
          email. If you want to stop receiving emails, forward the latest email
          you received from us to{" "}
          <a
            href="mailto:facilities@comfyseniors.com"
            className="font-semibold text-cs-blue hover:underline"
          >
            facilities@comfyseniors.com
          </a>{" "}
          and we&rsquo;ll remove you within one business day.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-card border border-cs-border bg-white p-6 text-center">
        <div className="mb-3 flex justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="text-cs-blue"
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
        <h2 className="mb-2 font-sans text-lg font-semibold text-cs-blue-dark">
          You&rsquo;re unsubscribed.
        </h2>
        <p className="text-sm text-cs-body">
          <span className="font-mono text-cs-blue-dark">{email}</span> will no
          longer receive marketing emails from ComfySeniors. Transactional
          emails (inquiry notifications, account confirmations) still work
          normally.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-card border border-[#FEE2E2] bg-[#FEF2F2] p-6 text-center">
        <h2 className="mb-2 font-sans text-lg font-semibold text-[#991B1B]">
          Unsubscribe failed
        </h2>
        <p className="text-sm text-[#7F1D1D]">
          {errorMsg || "Please try again or email facilities@comfyseniors.com."}
        </p>
        <button
          onClick={submit}
          className="mt-4 rounded-btn bg-cs-blue px-4 py-2 text-sm font-medium text-white hover:bg-cs-blue-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-cs-border bg-white p-6">
      <h2 className="mb-1 font-sans text-lg font-semibold text-cs-blue-dark">
        Confirm your unsubscribe
      </h2>
      <p className="mb-4 text-sm text-cs-body">
        You&rsquo;re about to stop receiving marketing emails at{" "}
        <span className="font-semibold text-cs-blue-dark">{email}</span>.
      </p>

      <button
        onClick={submit}
        disabled={status === "submitting"}
        className="rounded-btn bg-cs-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </div>
  );
}
