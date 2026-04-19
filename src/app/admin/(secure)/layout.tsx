import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin, ADMIN_EMAIL } from "@/lib/admin-auth";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "Admin — ComfySeniors CRM",
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-cs-blue-light">
      {/* Admin top bar — separate from public nav */}
      <header className="border-b border-cs-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-lg font-semibold text-cs-blue-dark"
            >
              CS Admin
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
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
                href="/"
                className="text-sm text-cs-muted transition-colors hover:text-cs-blue-dark"
              >
                ↗ Public site
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-cs-muted sm:inline">
              {user.email}
              {user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                <span className="ml-1 rounded-full bg-cs-lavender/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cs-lavender">
                  admin
                </span>
              )}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
