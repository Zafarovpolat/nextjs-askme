import { getApiFullUrl } from "@/config/api";
import { SITE_URL } from "@/lib/page-seo";

export const SITEMAP_REVALIDATE_SEC = 3600;
export const SITEMAP_CHUNK = 10000;

export type SitemapUrlRow = {
  path: string;
  lastmod?: string | null;
};

export type SitemapMeta = {
  chunk: number;
  questions_total: number;
  questions_pages: number;
  profiles_total: number;
  profiles_pages: number;
  categories_total: number;
  categories_pages: number;
};

export type SitemapUrlPage = {
  page: number;
  last_page: number;
  total: number;
  urls: SitemapUrlRow[];
};

const emptyMeta: SitemapMeta = {
  chunk: SITEMAP_CHUNK,
  questions_total: 0,
  questions_pages: 0,
  profiles_total: 0,
  profiles_pages: 0,
  categories_total: 0,
  categories_pages: 0,
};

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const url = getApiFullUrl(path);
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return fallback;
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: SITEMAP_REVALIDATE_SEC },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchSitemapMeta(): Promise<SitemapMeta> {
  const data = await fetchJson<Partial<SitemapMeta>>("v1/sitemap/meta", emptyMeta);
  return { ...emptyMeta, ...data };
}

export async function fetchSitemapSystemUrls(): Promise<SitemapUrlRow[]> {
  const data = await fetchJson<{ urls?: SitemapUrlRow[] }>("v1/sitemap/system", {
    urls: [],
  });
  return data.urls ?? [];
}

export async function fetchSitemapCategories(
  page: number,
): Promise<SitemapUrlPage> {
  return fetchJson<SitemapUrlPage>(`v1/sitemap/categories?page=${page}`, {
    page,
    last_page: 0,
    total: 0,
    urls: [],
  });
}

export async function fetchSitemapQuestions(
  page: number,
): Promise<SitemapUrlPage> {
  return fetchJson<SitemapUrlPage>(`v1/sitemap/questions?page=${page}`, {
    page,
    last_page: 0,
    total: 0,
    urls: [],
  });
}

export async function fetchSitemapProfiles(
  page: number,
): Promise<SitemapUrlPage> {
  return fetchJson<SitemapUrlPage>(`v1/sitemap/profiles?page=${page}`, {
    page,
    last_page: 0,
    total: 0,
    urls: [],
  });
}

export function sitemapFileUrl(file: string): string {
  return `${SITE_URL}/sitemaps/${file}`;
}

export function absUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Страницы, закрытые в robots.txt — в карту не попадают. */
export const ROBOTS_DISALLOWED_PREFIXES = [
  "/modals",
  "/login",
  "/signup",
  "/notifications",
  "/settings",
  "/auth",
  "/email-verified",
];

export function isDisallowedPath(path: string): boolean {
  const normalized = path.split("?")[0] || path;
  if (normalized === "/profile") return true;
  return ROBOTS_DISALLOWED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
