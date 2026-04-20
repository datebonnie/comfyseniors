import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-role Supabase client. Use for:
 *   - Public reads (RLS "select to anon" policies)
 *   - Client-facing API routes that insert without needing the row back
 *
 * Do NOT use for privileged server-side work like server actions that
 * insert-then-return or read admin-scoped tables — those fail RLS as anon.
 * Use createServiceClient() instead.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createSupabaseClient(url, key);
}

/**
 * Service-role Supabase client — bypasses RLS. Use ONLY from server
 * actions, API route handlers, webhook handlers, and cron jobs that
 * need privileged writes/reads. NEVER from a client component or any
 * path that hydrates to the browser — the key must stay server-side.
 *
 * Why this exists:
 *   PostgREST's default Prefer: return=representation does INSERT ... RETURNING,
 *   which triggers both an INSERT policy check AND a SELECT policy
 *   check. Anon-insert policies typically don't include a SELECT
 *   match, so the returning clause fails the transaction with
 *   42501 "row-level security policy violation" — even though the
 *   INSERT itself was allowed.
 *
 *   Rather than weaken RLS by adding an anon SELECT policy, server-
 *   only code uses the service role and RLS-exempts itself.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — createServiceClient cannot run."
    );
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
