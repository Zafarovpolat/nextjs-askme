import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canonicalQuestionIdSegment } from "@/lib/question-canonical";
import { pathnameHasWrongCase } from "@/lib/site-path-canonical";

function passPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-otvetai-path", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function rewriteNotFound(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-otvetai-path", request.nextUrl.pathname + request.nextUrl.search);
  const url = request.nextUrl.clone();
  url.pathname = "/__not-found";
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathnameHasWrongCase(pathname)) {
    return rewriteNotFound(request);
  }

  const match = pathname.match(/^\/question\/([^/]+)\/?$/);
  if (match) {
    let raw = match[1];
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* оставляем как есть */
    }

    const canonical = canonicalQuestionIdSegment(raw);
    if (canonical && raw !== canonical) {
      const url = request.nextUrl.clone();
      url.pathname = `/question/${canonical}`;
      return NextResponse.redirect(url, 301);
    }
  }

  return passPath(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|site.webmanifest|manifest.json|images/|sprites.svg).*)"],
};
