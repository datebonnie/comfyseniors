"use client";

import { useState } from "react";
import { markInquiryConverted } from "@/app/actions/contact";

interface MarkConversionButtonProps {
  code: string;
}

export default function MarkConversionButton({
  code,
}: MarkConversionButtonProps) {
  const [status, setStatus] = useState<"idle" | "confirm" | "saving" | "done">(
    "idle"
  );
  const [notes, setNotes] = useState("");

  async function handleConfirm() {
    setStatus("saving");
    const result = await markInquiryConverted(code, notes || undefined);
    if (result.success) {
      setStatus("done");
    } else {
      alert(result.error || "Failed to mark conversion.");
      setStatus("confirm");
    }
  }

  if (status === "done") {
    return (
      <span className="rounded-btn bg-cs-green-ok/10 px-3 py-1.5 text-xs font-semibold text-cs-green-ok">
        Marked as converted
      </span>
    );
  }

  if (status === "confirm" || status === "saving") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-btn border border-cs-border px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-cs-blue/10"
        />
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={status === "saving"}
            className="rounded-btn bg-cs-green-ok px-3 py-1.5 text-xs font-semibold text-white hover:bg-cs-green-ok/90 disabled:opacity-50"
          >
            {status === "saving" ? "Saving..." : "Confirm move-in"}
          </button>
          <button
            onClick={() => setStatus("idle")}
            className="rounded-btn border border-cs-border px-3 py-1.5 text-xs text-cs-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStatus("confirm")}
      className="shrink-0 rounded-btn border border-cs-blue px-3 py-1.5 text-xs font-semibold text-cs-blue transition-colors hover:bg-cs-blue-light"
    >
      Mark as converted
    </button>
  );
}
