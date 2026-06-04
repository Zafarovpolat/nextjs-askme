import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import type { CustomHtmlPageApi } from "@/types/custom-html-page";

const REVALIDATE_SEC = 120;

async function fetchCustomHtmlPageUncached(
  slug: string,
): Promise<CustomHtmlPageApi | null> {
  const normalized = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!normalized) {
    return null;
  }
  const url = getApiFullUrl(`v1/custom-pages/${encodeURIComponent(normalized)}`);
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
    return data as CustomHtmlPageApi;
  } catch (e) {
    console.error("[custom-page] fetch failed:", e);
    return null;
  }
}

/** Один запрос на slug в рамках SSR-запроса (generateMetadata + page). */
export const fetchCustomHtmlPage = cache(fetchCustomHtmlPageUncached);
