"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  facilityId: string;
  leadId: string | null;
  currentStatus: string;
  currentSource: string | null;
  currentPriority: number;
  currentValueEstimate: number | null;
  currentNextFollowup: string | null;
  currentLastContacted: string | null;
  isMM: boolean;
}

const STATUSES = [
  "new",
  "contacted",
  "replied",
  "demo",
  "paying",
  "lost",
  "unresponsive",
];

const SOURCES = ["cold_email", "cold_call", "inbound", "referral", "other"];

export default function LeadActions(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.currentStatus);
  const [source, setSource] = useState(props.currentSource || "");
  const [priority, setPriority] = useState(props.currentPriority);
  const [valueEstimate, setValueEstimate] = useState(
    props.currentValueEstimate ?? (props.isMM ? 397 : 297)
  );
  const [nextFollowup, setNextFollowup] = useState(
    props.currentNextFollowup ? props.currentNextFollowup.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(opts?: { markContactedNow?: boolean }) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/staff/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: props.facilityId,
          status,
          source: source || null,
          priority,
          value_estimate: valueEstimate || null,
          next_followup_at: nextFollowup
            ? new Date(nextFollowup).toISOString()
            : null,
          mark_contacted_now: !!opts?.markContactedNow,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed");
      setSavedAt(new Date());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-card border border-cs-border bg-white p-5">
        <h2 className="mb-4 font-sans text-base font-semibold text-cs-blue-dark">
          Lead actions
        </h2>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="label mb-1 block text-cs-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-btn border border-cs-border bg-white px-3 py-2 text-sm capitalize outline-none focus:border-cs-blue"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="label mb-1 block text-cs-muted">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
            >
              <option value="">— none —</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="label mb-1 block text-cs-muted">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              className="w-full rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
            >
              <option value={0}>Normal</option>
              <option value={1}>High</option>
              <option value={2}>Urgent</option>
            </select>
          </div>

          {/* Value estimate */}
          <div>
            <label className="label mb-1 block text-cs-muted">
              Estimated MRR (if they convert)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cs-muted">
                $
              </span>
              <input
                type="number"
                value={valueEstimate || ""}
                onChange={(e) =>
                  setValueEstimate(parseInt(e.target.value, 10) || 0)
                }
                className="w-full rounded-btn border border-cs-border bg-white py-2 pl-6 pr-3 text-sm outline-none focus:border-cs-blue"
              />
            </div>
          </div>

          {/* Follow-up date */}
          <div>
            <label className="label mb-1 block text-cs-muted">
              Next follow-up
            </label>
            <input
              type="date"
              value={nextFollowup}
              onChange={(e) => setNextFollowup(e.target.value)}
              className="w-full rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => save()}
            disabled={saving}
            className="rounded-btn bg-cs-blue px-4 py-2 text-sm font-medium text-white hover:bg-cs-blue-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={() => save({ markContactedNow: true })}
            disabled={saving}
            className="rounded-btn border border-cs-border bg-white px-4 py-2 text-sm font-medium text-cs-body hover:border-cs-blue disabled:opacity-50"
          >
            Mark contacted now
          </button>
        </div>

        {savedAt && (
          <p className="mt-2 text-xs text-cs-green-ok">
            Saved at {savedAt.toLocaleTimeString()}
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-cs-red-alert">{error}</p>
        )}

        {props.currentLastContacted && (
          <p className="mt-3 border-t border-cs-border pt-3 text-xs text-cs-muted">
            Last contacted:{" "}
            {new Date(props.currentLastContacted).toLocaleString()}
          </p>
        )}
      </div>
    </>
  );
}
