import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client with cookie-based auth for server components.
 * Used in dashboard pages to get the authenticated user.
 */
export function createAuthClient() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}

/**
 * Get the currently logged-in user, or null.
 */
export async function getUser() {
  const supabase = createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the facility linked to the logged-in user.
 */
export async function getUserFacility() {
  const user = await getUser();
  if (!user) return null;

  const supabase = createAuthClient();
  const { data } = await supabase
    .from("facility_users")
    .select("facility_id")
    .eq("user_id", user.id)
    .single();

  if (!data) return null;

  const { data: facility } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", data.facility_id)
    .single();

  return facility;
}
