"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/search", label: "Find Care" },
  { href: "/match", label: "Care Match Quiz" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-cs-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="text-[19px] font-semibold">
            <span className="text-cs-blue">Comfy</span>
            <span className="text-cs-lavender">Seniors</span>
          </span>
        </Link>

        {/* Desktop links + CTA */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-cs-muted transition-colors hover:text-cs-blue-dark"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/for-facilities"
            className="rounded-btn bg-cs-blue px-4 py-[7px] text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
          >
            For Facilities
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-cs-body md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-cs-border bg-white px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-cs-muted transition-colors hover:bg-cs-blue-light hover:text-cs-blue-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/for-facilities"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-btn bg-cs-blue px-3 py-2 text-center text-sm font-medium text-white"
              >
                For Facilities
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
