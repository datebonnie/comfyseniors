"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Match {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  is_verified: boolean;
}

interface Props {
  /**
   * Destination on selection. Default: "preview" — opens the public
   * facility page in a new tab (the original /for-facilities
   * behavior). "claim" navigates the current tab to
   * /for-facilities/claim/[id] and fires a different engagement event.
   */
  mode?: "preview" | "claim";
}

/**
 * "See Your Facility Page" autocomplete widget on /for-facilities.
 *
 * Queries /api/facilities/autocomplete with a 180ms debounce, renders
 * up to 8 Bergen County matches, and on selection opens the public
 * facility page in a new tab. Fires a facility_self_lookup engagement
 * event before navigating.
 *
 * Accessibility:
 *   - Full keyboard navigation (↑/↓/Enter/Escape)
 *   - aria-controls + aria-activedescendant for screen readers
 *   - aria-live announces result counts on change
 */
export default function SelfLookupWidget({ mode = "preview" }: Props = {}) {
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [focused, setFocused] = useState(false);

  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/facilities/autocomplete?q=${encodeURIComponent(q.trim())}`
        );
        const data = await res.json();
        setMatches(data.data || []);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const selectMatch = useCallback(
    async (m: Match) => {
      // Fire-and-forget engagement event; don't block navigation on it
      fetch("/api/engagement/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "facility_self_lookup",
          facility_id: m.id,
          metadata: { query: q, name: m.name, mode },
        }),
        keepalive: true,
      }).catch(() => {});

      if (mode === "claim") {
        // Claim flow: navigate in-place to the tier picker. Admin is
        // buying, not browsing — don't fracture their attention with
        // a new tab.
        router.push(`/for-facilities/claim/${m.id}`);
      } else {
        // Preview flow: open the public listing in a new tab so the
        // admin doesn't lose their place on /for-facilities.
        window.open(`/facility/${m.slug}`, "_blank", "noopener,noreferrer");
      }
    },
    [q, mode, router]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!matches.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < matches.length) {
        selectMatch(matches[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setMatches([]);
      setQ("");
    }
  }

  const showDropdown = focused && q.trim().length >= 2;

  return (
    <div className="relative mx-auto max-w-xl">
      <label htmlFor="facility-lookup" className="label mb-2 block text-cs-muted">
        Search your facility name
      </label>
      <input
        id="facility-lookup"
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActiveIdx(-1);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay blur to allow mousedown on a result to fire first
          setTimeout(() => setFocused(false), 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Harmony House, Bergen Oaks…"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls="facility-lookup-list"
        aria-activedescendant={
          activeIdx >= 0 ? `facility-lookup-opt-${activeIdx}` : undefined
        }
        className="w-full rounded-btn border border-cs-border bg-white px-4 py-3 text-base outline-none focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
      />

      {/* Status region for screen readers */}
      <span className="sr-only" aria-live="polite">
        {loading
          ? "Searching…"
          : matches.length > 0
            ? `${matches.length} ${matches.length === 1 ? "match" : "matches"} found`
            : ""}
      </span>

      {showDropdown && (
        <ul
          id="facility-lookup-list"
          role="listbox"
          className="absolute left-0 right-0 top-[4.25rem] z-20 max-h-80 overflow-auto rounded-btn border border-cs-border bg-white shadow-lg"
        >
          {loading && matches.length === 0 && (
            <li className="px-4 py-3 text-sm text-cs-muted">Searching…</li>
          )}
          {!loading && matches.length === 0 && (
            <li className="px-4 py-3 text-sm text-cs-muted">
              No Bergen County match for &ldquo;{q}&rdquo;.{" "}
              <a
                href="mailto:facilities@comfyseniors.com?subject=Missing%20facility%20on%20ComfySeniors"
                className="font-medium text-cs-blue hover:underline"
              >
                Email us
              </a>{" "}
              if we&apos;re missing you.
            </li>
          )}
          {matches.map((m, i) => (
            <li
              id={`facility-lookup-opt-${i}`}
              key={m.id}
              role="option"
              aria-selected={activeIdx === i}
              onMouseDown={(e) => {
                // mousedown (not click) so it fires before input blur
                e.preventDefault();
                selectMatch(m);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`cursor-pointer border-b border-cs-border px-4 py-3 text-sm transition-colors last:border-0 ${
                activeIdx === i
                  ? "bg-cs-blue-light"
                  : "bg-white hover:bg-cs-blue-light/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-cs-blue-dark">{m.name}</div>
                  {m.city && (
                    <div className="text-xs text-cs-muted">{m.city}, NJ</div>
                  )}
                </div>
                {m.is_verified ? (
                  <span className="rounded-full bg-cs-blue/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cs-blue">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-cs-amber-warn/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#92400E]">
                    Not verified
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-cs-muted">
        Can&apos;t find your facility?{" "}
        <a
          href="mailto:facilities@comfyseniors.com?subject=Missing%20facility%20on%20ComfySeniors"
          className="font-medium text-cs-blue hover:underline"
        >
          Email us
        </a>{" "}
        — we might be missing you.
      </p>
    </div>
  );
}
