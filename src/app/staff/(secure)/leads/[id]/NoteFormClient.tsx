"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  facilityId: string;
  leadId: string | null;
}

export default function NoteFormClient({ facilityId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/staff/lead-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          body: body.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to save");
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What happened? Who you spoke to, what they said, next step..."
        rows={3}
        className="w-full rounded-btn border border-cs-border bg-white px-3 py-2 text-sm outline-none focus:border-cs-blue"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-cs-muted">
          Notes are timestamped and visible only to admins.
        </p>
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="rounded-btn bg-cs-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-cs-blue-dark disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add note"}
        </button>
      </div>
      {error && <p className="text-xs text-cs-red-alert">{error}</p>}
    </form>
  );
}
