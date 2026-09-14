import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import { isStoredUrlSlug } from "@/lib/site-path-canonical";
import type { CustomHtmlPageApi } from "@/types/custom-html-page";

const REVALIDATE_SEC = 120;

async function fetchCustomHtmlPageUncached(
  slug: string,
  version?: number | null,
): Promise<CustomHtmlPageApi | null> {
  const exact = slug.trim();
  if (!isStoredUrlSlug(exact)) {
    return null;
  }
  const qs =
    version != null && Number.isFinite(version) && version > 0
      ? `?v=${Math.trunc(version)}`
      : "";
  const url = getApiFullUrl(
    `v1/custom-pages/${encodeURIComponent(exact)}${qs}`,
  );
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error(
      "[custom-page] NEXT_PUBLIC_API_URL не задан — серверный fetch невозможен.",
    );
    return null;
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEC },
    });
    if (res.status === 404 || !res.ok) {
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return null;
    }
    const data = (await res.json()) as CustomHtmlPageApi & {
      content_format?: string;
      message?: string;
    };
    if (data.content_format !== "html" || typeof data.content !== "string") {
      return null;
    }
    if (data.slug !== exact) {
      return null;
    }
    return data as CustomHtmlPageApi;
  } catch (e) {
    console.error("[custom-page] fetch failed:", e);
    return null;
  }
}

/** Один запрос на slug (+опционально версия) в рамках SSR-запроса. */
export const fetchCustomHtmlPage = cache(fetchCustomHtmlPageUncached);
