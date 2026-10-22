import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const HOME = "/";
const SIGNED_IN_HOME = "/progress";
const GUEST_HOME = "/programs";

const PUBLIC_ROUTES = [
  "/onboarding",
  "/progress/**",
  "/programs/**",
  "/practice/**",
  "/account/**",
  "/vocabulary/**",
];

const GUEST_ONLY_ROUTES = ["/auth/**"];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => {
    if (route.endsWith("/**")) {
      const base = route.slice(0, -3);
      return pathname === base || pathname.startsWith(`${base}/`);
    }
    return pathname === route;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The cookie is only a hint here: a stale one lands on /progress, which
  // shows a sign-in prompt to guests.
  if (pathname === HOME) {
    const url = request.nextUrl.clone();
    url.pathname = getSessionCookie(request) ? SIGNED_IN_HOME : GUEST_HOME;
    return NextResponse.redirect(url);
  }

  if (matchesRoute(pathname, GUEST_ONLY_ROUTES)) {
    if (getSessionCookie(request)) {
      const url = request.nextUrl.clone();
      url.pathname = SIGNED_IN_HOME;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
