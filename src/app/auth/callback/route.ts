import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "hello@comfyseniors.com"
).toLowerCase();

/**
 * Sanity-check any explicit `?redirect=` param so a malicious magic-link
 * URL can't bounce the authenticated user to an attacker-controlled
 * origin. We only accept paths starting with a single `/` (relative to
 * this site), and reject anything with a protocol or double-slash.
 */
function sanitizeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null; // protocol-relative
  // No embedded newlines, no js:/data: smuggling — defensive even
  // though the String type alone doesn't allow them.
  if (/[\s\r\n]/.test(raw)) return null;
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitRedirect = sanitizeRedirect(searchParams.get("redirect"));

  let redirectPath = explicitRedirect || "/for-facilities/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // If no explicit redirect was requested, route by user role:
    // - Admin email → /staff
    // - Anyone else → /for-facilities/dashboard
    //
    // When a redirect IS set (e.g. the post-checkout welcome flow
    // sends `/for-facilities/welcome?fid=<id>`), we honor it — that
    // query string survives because searchParams.get() URL-decodes it
    // into a single path+query value, and NextResponse.redirect
    // serializes it back into a valid URL.
    if (!explicitRedirect && data?.user?.email) {
      if (data.user.email.toLowerCase() === ADMIN_EMAIL) {
        redirectPath = "/staff";
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
