import Link from "next/link";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Nav from "@/components/layout/Nav";

const dashboardLinks = [
  { href: "/for-facilities/dashboard", label: "Overview", icon: "grid" },
  { href: "/for-facilities/dashboard/inquiries", label: "Inquiries", icon: "inbox" },
  { href: "/for-facilities/dashboard/referrals", label: "Referrals", icon: "gift" },
  { href: "/for-facilities/dashboard/profile", label: "Profile", icon: "edit" },
  { href: "/for-facilities/dashboard/billing", label: "Billing", icon: "card" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/for-facilities/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-60 border-r border-cs-border bg-white p-4 md:block">
          <div className="mb-6">
            <p className="label text-cs-lavender">Facility Dashboard</p>
            <p className="mt-1 truncate text-xs text-cs-muted">{user.email}</p>
          </div>

          <nav className="space-y-1">
            {dashboardLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-btn px-3 py-2 text-sm text-cs-body transition-colors hover:bg-cs-blue-light hover:text-cs-blue-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-cs-border pt-4">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full rounded-btn px-3 py-2 text-left text-sm text-cs-muted transition-colors hover:text-cs-red-alert"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="border-b border-cs-border bg-white p-3 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {dashboardLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-btn border border-cs-border px-3 py-1.5 text-xs font-medium text-cs-body hover:bg-cs-blue-light"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 bg-cs-lavender-mist p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
