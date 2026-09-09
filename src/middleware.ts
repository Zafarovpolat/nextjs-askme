import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canonicalQuestionIdSegment } from "@/lib/question-canonical";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/question\/([^/]+)\/?$/);
  if (!match) {
    return NextResponse.next();
  }

  let raw = match[1];
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* оставляем как есть */
  }

  const canonical = canonicalQuestionIdSegment(raw);
  if (!canonical || raw === canonical) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/question/${canonical}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/question/:id"],
};
