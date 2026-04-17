import { cache } from "react";
import { getApiFullUrl } from "@/config/api";

export type ApiCategorySub = {
  id: number;
  name: string;
  slug: string;
  icon_key: string | null;
};

export type ApiCategoryTree = {
  id: number;
  name: string;
  slug: string;
  icon_key: string | null;
  subcategories: ApiCategorySub[];
};

const REVALIDATE_SEC = 300;

async function fetchCategoriesOnServer(): Promise<ApiCategoryTree[]> {
  const url = getApiFullUrl("v1/categories");
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
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as ApiCategoryTree[]) : [];
  } catch {
    return [];
  }
}

export const fetchCategoriesCached = cache(fetchCategoriesOnServer);
