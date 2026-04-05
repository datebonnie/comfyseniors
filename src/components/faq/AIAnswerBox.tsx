"use client";

import { useState, useRef } from "react";

export default function AIAnswerBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnswer("");
    setStatus("loading");

    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        setAnswer(err.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("streaming");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setAnswer(accumulated);
                } else if (parsed.error) {
                  setAnswer(parsed.error);
                  setStatus("error");
                  return;
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      }

      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setAnswer("Failed to get an answer. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-pill border border-cs-border bg-white p-5 sm:p-6">
      <h3 className="mb-1 font-sans text-base font-semibold text-cs-blue-dark">
        Ask anything about senior care in NJ
      </h3>
      <p className="mb-4 text-sm text-cs-muted">
        Get an instant AI-powered answer. No signup required.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Does Medicare cover assisted living in NJ?"
          className="w-full rounded-btn border border-cs-border bg-cs-lavender-mist px-4 py-2.5 text-sm text-cs-body outline-none placeholder:text-cs-muted/60 focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "streaming" || !question.trim()}
          className="shrink-0 rounded-btn bg-cs-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50"
        >
          {status === "loading" || status === "streaming" ? "..." : "Ask"}
        </button>
      </form>

      {/* Answer area */}
      {(status === "loading" || status === "streaming" || status === "done" || status === "error") && (
        <div className="mt-4 rounded-btn border-l-[3px] border-cs-lavender bg-cs-blue-light p-4">
          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-cs-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cs-blue/20 border-t-cs-blue" />
              Thinking...
            </div>
          )}

          {(status === "streaming" || status === "done") && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-cs-body">
              {answer}
              {status === "streaming" && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-cs-blue" />
              )}
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-cs-red-alert">{answer}</p>
          )}

          {status === "done" && (
            <p className="mt-3 text-xs text-cs-muted">
              This is AI-generated guidance, not professional advice. Always
              consult with care professionals for your specific situation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
