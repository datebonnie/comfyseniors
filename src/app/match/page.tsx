import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MatchClient from "./MatchClient";

export const metadata: Metadata = {
  title: "Care Match Quiz — ComfySeniors",
  description: "Find the right care type in 60 seconds.",
  robots: { index: false, follow: false },
};

/**
 * The Care Match Quiz is feature-flagged off for the Bergen County
 * pivot. The full quiz code lives in MatchClient.tsx and is preserved
 * intact; this server-component shell either redirects to /search
 * (flag off) or renders the quiz (flag on).
 *
 * To re-enable: set NEXT_PUBLIC_ENABLE_QUIZ=true in Vercel + .env.local.
 */
export default function MatchPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_QUIZ !== "true") {
    redirect("/search");
  }

  return <MatchClient />;
}
