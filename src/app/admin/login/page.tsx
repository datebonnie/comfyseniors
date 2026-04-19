"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import PageWrapper from "@/components/layout/PageWrapper";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/admin`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <PageWrapper>
      <section className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="text-center">
          <span className="label text-cs-lavender">Internal access only</span>
          <h1 className="mt-2 font-display text-3xl text-cs-blue-dark">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-cs-muted">
            Sign in to access the CRM and lead pipeline. Only the
            ComfySeniors admin email is authorized.
          </p>
        </div>

        {status === "sent" ? (
          <div className="mt-8 rounded-card border border-cs-green-ok/30 bg-cs-green-ok/5 p-6 text-center">
            <p className="text-lg font-semibold text-cs-green-ok">
              Check your email
            </p>
            <p className="mt-2 text-sm text-cs-muted">
              A login link has been sent to{" "}
              <strong className="text-cs-blue-dark">{email}</strong>. Click
              it from this device to access the admin CRM.
            </p>
            <p className="mt-3 text-xs text-cs-muted">
              If the email doesn&apos;t arrive within a minute, check your
              spam folder. The link expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label mb-2 block text-cs-blue-dark">
                Admin email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@comfyseniors.com"
                required
                className="w-full rounded-btn border border-cs-border bg-white px-4 py-3 text-sm text-cs-body outline-none placeholder:text-cs-muted/60 focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-btn bg-cs-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50"
            >
              {status === "sending" ? "Sending login link..." : "Send login link"}
            </button>

            {status === "error" && (
              <p className="text-center text-sm text-cs-red-alert">
                {errorMsg || "Something went wrong. Please try again."}
              </p>
            )}

            <p className="text-center text-xs text-cs-muted">
              No password needed. Magic-link only.
            </p>
          </form>
        )}
      </section>
    </PageWrapper>
  );
}
