"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/staff/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-btn border border-cs-border bg-white px-3 py-1.5 text-xs font-medium text-cs-body transition-colors hover:border-cs-blue hover:text-cs-blue-dark"
    >
      Log out
    </button>
  );
}
