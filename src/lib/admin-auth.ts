import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * The single email allowed to access the admin CRM.
 * Override via ADMIN_EMAIL env var if you ever change it (and update
 * the RLS policy in migration 010 to match).
 */
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "hello@comfyseniors.com";

/**
 * Build a server-side Supabase client that has access to the user's
 * cookie-based session. Use this from server components and route
 * handlers.
 */
export function createAdminSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server components can't write cookies — ignore.
            }
          });
        },
      },
    }
  );
}

/**
 * Returns the authenticated admin user, or null if not logged in
 * or not the admin email.
 */
export async function getAdminUser() {
  const supabase = createAdminSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }
  return user;
}

/**
 * Server component / route handler guard. Redirects to /staff/login
 * if the user is not the admin.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/staff/login");
  }
  return user;
}
