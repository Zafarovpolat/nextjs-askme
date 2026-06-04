import { getApiFullUrl } from "@/config/api";
import type { FaqPageApi } from "@/types/faq-page";

const REVALIDATE_SEC = 60;

export async function fetchFaqPage(): Promise<FaqPageApi | null> {
  const url = getApiFullUrl("v1/custom-pages/faq");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEC },
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return null;
    }
    const data = (await res.json()) as FaqPageApi;
    if (
      data.content_format !== "json_faq" ||
      !Array.isArray(data.categories) ||
      data.categories.length === 0
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
