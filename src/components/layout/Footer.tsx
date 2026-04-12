import Link from "next/link";

const footerLinks = {
  Directory: [
    { href: "/search", label: "Find Care" },
    { href: "/match", label: "Care Match Quiz" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
  "Care Types": [
    { href: "/care-types/assisted-living", label: "Assisted Living" },
    { href: "/care-types/memory-care", label: "Memory Care" },
    { href: "/care-types/independent-living", label: "Independent Living" },
    { href: "/care-types/nursing-home", label: "Nursing Home" },
    { href: "/care-types/home-care", label: "Home Care" },
  ],
  "For Facilities": [
    { href: "/for-facilities", label: "Get Listed" },
    { href: "/for-facilities/dashboard", label: "Facility Dashboard" },
  ],
};

const socialLinks = [
  {
    href: "https://www.instagram.com/comfyseniors",
    label: "Instagram",
    handle: "@comfyseniors",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@comfyseniors",
    label: "TikTok",
    handle: "@comfyseniors",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-cs-blue-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top section: links grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-[20px] font-semibold text-white">
              ComfySeniors
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#8B9EC7]">
              America&apos;s most honest senior care directory.
            </p>
            <p className="mt-4 text-sm font-medium text-cs-lavender">
              We never sell your number &mdash; ever.
            </p>

            {/* Social links */}
            <div className="mt-5">
              <h4 className="label mb-2 text-white">Follow us</h4>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} ${social.handle}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2D3E6A] text-[#8B9EC7] transition-colors hover:border-cs-lavender hover:text-cs-lavender"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="mt-2 text-xs text-cs-muted">@comfyseniors</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="label mb-3 text-white">{heading}</h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#8B9EC7] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-[#2D3E6A] pt-6 text-xs text-cs-muted sm:flex-row">
          <span>&copy; {new Date().getFullYear()} ComfySeniors.com. All rights reserved.</span>
          <span>Made in New Jersey for American families.</span>
        </div>
      </div>
    </footer>
  );
}
