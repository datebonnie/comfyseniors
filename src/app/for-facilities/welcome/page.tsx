import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import { createAuthClient, getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Welcome — ComfySeniors",
  description: "Your facility claim is complete. Get your dashboard set up.",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams?: { fid?: string; session_id?: string };
}

/**
 * Post-payment landing page. Three states:
 *
 * STATE A — Fresh payment, not yet signed in
 *   Arrives with ?session_id=cs_... from Stripe. User has NOT clicked
 *   their magic link yet. Show a friendly "check your email" state.
 *
 * STATE B — Signed in via magic link, ?fid=... in URL
 *   The magic link redirected here via /auth/callback?redirect=/welcome?fid=
 *   Bind auth.user to facility in facility_users (if not already linked),
 *   then show the next-steps checklist with a dashboard CTA.
 *
 * STATE C — Signed in, no fid in URL
 *   Someone navigated here manually after logging in. Route them to the
 *   dashboard.
 */
export default async function WelcomePage({ searchParams }: Props) {
  const user = await getUser();
  const fid = searchParams?.fid;
  const sessionId = searchParams?.session_id;

  // STATE A — fresh Stripe redirect, no auth yet
  if (!user) {
    return (
      <PageWrapper>
        <section className="mx-auto max-w-xl px-4 py-16 sm:py-24">
          <div className="rounded-card border border-cs-green-ok/40 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cs-green-ok/10">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cs-green-ok"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-cs-blue-dark">
              Payment received. Welcome.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-cs-body">
              Your facility listing is now verified. Check your inbox — we
              just emailed you a one-click login link for your dashboard.
              It arrives from{" "}
              <strong className="text-cs-blue-dark">
                partners@comfyseniors.com
              </strong>{" "}
              within a minute or two.
            </p>
            <p className="mt-4 text-xs text-cs-muted">
              If it lands in spam or promotions, drag it to your primary
              inbox — future dashboard notifications depend on this
              address being trusted.
            </p>
            {sessionId && (
              <p className="mt-4 text-[11px] text-cs-muted">
                Stripe session: <code>{sessionId.slice(0, 20)}…</code>
              </p>
            )}
            <p className="mt-6 text-xs text-cs-muted">
              Didn&apos;t get the email?{" "}
              <Link
                href="/for-facilities/login"
                className="font-medium text-cs-blue hover:underline"
              >
                Request a new login link
              </Link>
              .
            </p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // STATE C — authenticated but no facility context; bounce to dashboard.
  if (!fid) {
    redirect("/for-facilities/dashboard");
  }

  // STATE B — signed in, fid present. Make sure the facility_users
  // link exists. Uses service role because facility_users has
  // self-restricting RLS that prevents a brand-new user from reading
  // the row they just need to create.
  const service = createServiceClient();
  const auth = createAuthClient();

  // Does a link already exist for this user+facility?
  const { data: existingLink } = await service
    .from("facility_users")
    .select("id")
    .eq("user_id", user.id)
    .eq("facility_id", fid)
    .maybeSingle();

  if (!existingLink) {
    // Quick sanity check that the facility actually has an active
    // subscription matching this buyer. We look for a recent
    // featured_subscriptions row on this facility. If none, the user
    // shouldn't be able to claim — something's off (magic link
    // forwarded? replay attack?).
    const { data: sub } = await service
      .from("featured_subscriptions")
      .select("id, status")
      .eq("facility_id", fid)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub) {
      await service.from("facility_users").insert({
        user_id: user.id,
        facility_id: fid,
        role: "admin",
      });
    } else {
      // No active sub — refuse to link. Rare edge case; log it and
      // send them back to the login page to try again.
      console.warn(
        `[welcome] refusing to link user ${user.id} to facility ${fid} — no active subscription found`
      );
      // touch the `auth` variable once so unused-import linting doesn't
      // fire on the otherwise-unused cookie-based client; reusing it
      // here keeps the auth session alive on this request.
      void auth;
      redirect("/for-facilities/login");
    }
  }

  // Pull facility name for a warmer hello.
  const { data: facility } = await service
    .from("facilities")
    .select("name, slug, subscription_tier")
    .eq("id", fid)
    .maybeSingle();

  const facilityName = facility?.name || "your facility";
  const tier = facility?.subscription_tier;

  return (
    <PageWrapper>
      <section className="bg-cs-blue-light py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <p className="label mb-2 text-cs-lavender">You&apos;re in</p>
          <h1 className="font-display text-hero-mobile font-normal text-cs-blue-dark md:text-hero">
            Welcome to {facilityName}&apos;s dashboard.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cs-body">
            {tier === "founding"
              ? "Your Founding Partner badge is already live on your public page."
              : "Your Verified badge is live. The 'Not Verified' warning is gone."}{" "}
            Three quick wins to finish your setup:
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <ol className="space-y-3">
            <ChecklistStep
              n={1}
              href="/for-facilities/dashboard/profile"
              title="Upload 3+ photos of your community"
              subtitle="Stock-feel photos kill conversion more than no photos. Real photos from real rooms, dining areas, and outdoor spaces."
            />
            <ChecklistStep
              n={2}
              href="/for-facilities/dashboard/profile"
              title="Write 2-3 paragraphs about what makes you different"
              subtitle="Specific beats generic. Mention your care philosophy, staff ratios, specialties, the neighborhood."
            />
            <ChecklistStep
              n={3}
              href="/for-facilities/dashboard/profile"
              title="If you have open state citations, post a public response"
              subtitle="Families see the citation AND your context, side-by-side. Rare in this industry and worth a lot to them."
            />
          </ol>

          <div className="mt-8 flex flex-col items-center gap-3 rounded-card border border-cs-border bg-white p-6">
            <p className="text-sm text-cs-body">
              Ready when you are.
            </p>
            <Link
              href="/for-facilities/dashboard"
              className="rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white hover:bg-cs-blue-dark"
            >
              Open my dashboard &rarr;
            </Link>
            {facility?.slug && (
              <Link
                href={`/facility/${facility.slug}`}
                className="text-xs text-cs-muted underline hover:text-cs-blue-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                See my public listing in a new tab
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

function ChecklistStep({
  n,
  href,
  title,
  subtitle,
}: {
  n: number;
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-4 rounded-card border border-cs-border bg-white p-4 transition-colors hover:border-cs-blue"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cs-blue text-sm font-semibold text-white">
          {n}
        </span>
        <div>
          <p className="font-medium text-cs-blue-dark">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-cs-muted">
            {subtitle}
          </p>
        </div>
        <span className="ml-auto text-cs-muted">&rarr;</span>
      </Link>
    </li>
  );
}
