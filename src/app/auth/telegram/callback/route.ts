import { NextResponse } from "next/server";

function getBackendBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = base.replace(/\/$/, "");
  return url.replace(/\/api\/?$/, "");
}

export function GET(req: Request) {
  const u = new URL(req.url);
  const backend = getBackendBaseUrl().replace(/\/$/, "");
  const target = `${backend}/auth/telegram/callback${u.search}`;
  return NextResponse.redirect(target, 302);
}

