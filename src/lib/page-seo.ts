import type { Metadata } from "next";
import { questionsListHref } from "@/lib/questions-list-href";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://otvetai.ru"
).replace(/\/+$/, "");

export const SITE_NAME = "otvetai";

/** Индексировать страницу и ходить по ссылкам (корень layout и публичные страницы). */
export const ROBOTS_INDEX_FOLLOW: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

/** Не индексировать, ссылки обходить. */
export const ROBOTS_NOINDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

/** Абсолютный URL: путь, опционально с query (`/?filter=best&page=2`). */
export function absolutePageUrl(pathname: string): string {
  const raw = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const qIndex = raw.indexOf("?");
  const pathOnly = qIndex === -1 ? raw : raw.slice(0, qIndex);
  const query = qIndex === -1 ? "" : raw.slice(qIndex);
  const normalized = pathOnly === "/" ? "/" : pathOnly.replace(/\/+$/, "");
  if (normalized === "/") {
    return `${SITE_URL}${query}`;
  }
  return `${SITE_URL}${normalized}${query}`;
}

/** canonical список вопросов: те же filter и page, что в адресе. */
export function withListPageUrl(
  pathname: string,
  filter: string | null,
  page: number,
  metadata: Metadata = {},
  defaultFilter = "open",
): Metadata {
  return withPageUrl(questionsListHref(pathname, filter, page, defaultFilter), metadata);
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
