import { getApiFullUrl } from "@/config/api";
import type { AboutPageApi } from "@/types/about-page";

const REVALIDATE_SEC = 60;

export async function fetchAboutPage(): Promise<AboutPageApi | null> {
  const url = getApiFullUrl("v1/custom-pages/about");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error(
      "[about] NEXT_PUBLIC_API_URL не задан или не абсолютный URL — серверный fetch к API невозможен.",
    );
    return null;
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEC },
    });
    if (!res.ok) {
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return null;
    }
    const data = (await res.json()) as AboutPageApi;
    if (data.content_format !== "json_blocks" || !Array.isArray(data.blocks)) {
      return null;
    }
    return data;
  } catch (e) {
    console.error("[about] fetch / parse failed:", e);
    return null;
  }
}
