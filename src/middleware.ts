import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — two concerns:
 *
 * 1. /for-facilities/dashboard/* — Supabase auth gate. Unauthenticated
 *    visitors get redirected to the facility login page.
 *
 * 2. /staff/* + /api/staff/* — HTTP Basic Auth gate (first lock) BEFORE
 *    the existing magic-link auth (second lock). A scraper that finds
 *    /staff hits a 401 prompt before they can try to enumerate any
 *    login. Set ADMIN_BASIC_AUTH_USER + ADMIN_BASIC_AUTH_PASS in
 *    Vercel + .env.local to enable. If either is unset, the gate is
 *    bypassed (so first deploy doesn't hard-lock).
 */

function basicAuthChallenge(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="ComfySeniors Staff", charset="UTF-8"',
    },
  });
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function checkStaffBasicAuth(req: NextRequest): NextResponse | null {
  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const pass = process.env.ADMIN_BASIC_AUTH_PASS;
  if (!user || !pass) {
    // Gate not configured — bypass so first deploy still works.
    return null;
  }

  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      if (sep > -1) {
        const u = decoded.slice(0, sep);
        const p = decoded.slice(sep + 1);
        if (timingSafeEqualString(u, user) && timingSafeEqualString(p, pass)) {
          return null; // pass
        }
      }
    } catch {
      // fall through
    }
  }

  return basicAuthChallenge();
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── Staff routes: HTTP Basic Auth as first gate ────────
  if (path.startsWith("/staff") || path.startsWith("/api/staff")) {
    const challenge = checkStaffBasicAuth(request);
    if (challenge) return challenge;
    // Continue to Supabase session bootstrap below so admin-auth.ts
    // can read the cookie session.
  }

  // ── Supabase session bootstrap ─────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Facility dashboard auth ────────────────────────────
  if (path.startsWith("/for-facilities/dashboard") && !user) {
    const loginUrl = new URL("/for-facilities/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/for-facilities/dashboard/:path*",
    "/staff/:path*",
    "/api/staff/:path*",
  ],
};
