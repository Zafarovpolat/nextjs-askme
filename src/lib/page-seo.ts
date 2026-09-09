import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://otvetai.ru"
).replace(/\/+$/, "");

export const SITE_NAME = "otvetai";

/** Абсолютный URL страницы без query (для canonical / og:url). */
export function absolutePageUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") {
    return SITE_URL;
  }
  return `${SITE_URL}${path.replace(/\/+$/, "")}`;
}

/** canonical + og:url на конкретный путь. Мержит с уже заданной metadata. */
export function withPageUrl(pathname: string, metadata: Metadata = {}): Metadata {
  const url = absolutePageUrl(pathname);
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: url,
    },
    openGraph: {
      ...metadata.openGraph,
      url,
    },
  };
}
