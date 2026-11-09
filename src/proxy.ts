import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for the editorial desk: requests without a session cookie
 * are sent to sign in. Real authorization happens on the server in every
 * admin page and Server Action (src/server/auth/dal.ts).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("folio_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/sign-in";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
