"use client";

import { useState } from "react";

interface ShareButtonProps {
  facilityName: string;
  facilitySlug: string;
  city: string | null;
  state: string;
}

export default function ShareButton({
  facilityName,
  facilitySlug,
  city,
  state,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const url = `https://comfyseniors.com/facility/${facilitySlug}`;
  const text = `Check out ${facilityName} in ${city}, ${state} on ComfySeniors — real prices and inspection records.`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const shareLinks = [
    {
      label: "Text message",
      href: `sms:?body=${encodeURIComponent(text + "\n" + url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(`Senior care option: ${facilityName}`)}&body=${encodeURIComponent(text + "\n\n" + url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 7L2 7" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex w-full items-center justify-center gap-2 rounded-btn border border-cs-border px-4 py-2.5 text-sm font-medium text-cs-body transition-colors hover:bg-cs-lavender-mist"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share with family
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-card border border-cs-border bg-white p-2 shadow-lg">
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.label === "Text message" || link.label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 rounded-btn px-3 py-2 text-sm text-cs-body transition-colors hover:bg-cs-blue-light"
            >
              <span className="text-cs-muted">{link.icon}</span>
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              handleCopy();
              setShowMenu(false);
            }}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2 text-sm text-cs-body transition-colors hover:bg-cs-blue-light"
          >
            <span className="text-cs-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </span>
            {copied ? "Link copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
