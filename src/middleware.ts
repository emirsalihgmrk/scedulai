import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const AUTHENTICATED_REDIRECT = "/programs";

export function middleware(request: NextRequest) {
  const hasSession = getSessionCookie(request);

  if (hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = AUTHENTICATED_REDIRECT;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*"],
};