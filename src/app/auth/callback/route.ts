import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "hello@comfyseniors.com"
).toLowerCase();

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitRedirect = searchParams.get("redirect");

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
    // - Admin email → /admin
    // - Anyone else → /for-facilities/dashboard
    if (!explicitRedirect && data?.user?.email) {
      if (data.user.email.toLowerCase() === ADMIN_EMAIL) {
        redirectPath = "/admin";
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
