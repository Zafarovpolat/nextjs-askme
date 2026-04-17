import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import type { ApiCategoryTree } from "@/lib/server-categories";

const REVALIDATE_SEC = 60;

/**
 * Те же категории, что блок «Популярные» на главной: GET v1/main → categories
 * (5 родительских × до 4 подкатегорий, порядок как на бэкенде).
 */
async function fetchMainSidebarCategoriesOnServer(): Promise<ApiCategoryTree[]> {
  const url = getApiFullUrl("v1/main");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return [];
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEC },
    });
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return [];
    const data = (await res.json()) as { categories?: unknown };
    const raw = data.categories;
    return Array.isArray(raw) ? (raw as ApiCategoryTree[]) : [];
  } catch {
    return [];
  }
}

export const fetchMainSidebarCategoriesCached = cache(
  fetchMainSidebarCategoriesOnServer,
);
