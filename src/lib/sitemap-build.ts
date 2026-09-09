import {
  fetchSitemapCategories,
  fetchSitemapMeta,
  fetchSitemapProfiles,
  fetchSitemapQuestions,
  fetchSitemapSystemUrls,
  type SitemapUrlRow,
} from "@/lib/sitemap-data";
import { sitemapIndexXml, urlsetXml } from "@/lib/sitemap-xml";

const STATIC_SYSTEM: SitemapUrlRow[] = [
  { path: "/" },
  { path: "/categories" },
  { path: "/ask" },
  { path: "/leaders" },
];

export function partFiles(prefix: string, pages: number): string[] {
  if (pages < 1) return [];
  return Array.from({ length: pages }, (_, i) => `${prefix}-${i + 1}.xml`);
}

export async function buildRootIndexXml(): Promise<string> {
  const meta = await fetchSitemapMeta();
  const files: string[] = ["system.xml"];

  if (meta.categories_pages === 1) {
    files.push("categories.xml");
  } else if (meta.categories_pages > 1) {
    files.push("categories.xml", ...partFiles("categories", meta.categories_pages));
  }

  if (meta.questions_pages === 1) {
    files.push("questions.xml");
  } else if (meta.questions_pages > 1) {
    files.push("questions.xml", ...partFiles("questions", meta.questions_pages));
  }

  if (meta.profiles_pages === 1) {
    files.push("profiles.xml");
  } else if (meta.profiles_pages > 1) {
    files.push("profiles.xml", ...partFiles("profiles", meta.profiles_pages));
  }

  return sitemapIndexXml(files);
}

export async function buildSystemUrlset(): Promise<string> {
  const custom = await fetchSitemapSystemUrls();
  const seen = new Set(STATIC_SYSTEM.map((row) => row.path));
  const urls: SitemapUrlRow[] = [...STATIC_SYSTEM];
  for (const row of custom) {
    if (!row.path || seen.has(row.path)) continue;
    seen.add(row.path);
    urls.push(row);
  }
  return urlsetXml(urls, { changefreq: "weekly", priority: "0.6" });
}

export async function buildTypeIndexOrUrlset(
  kind: "categories" | "questions" | "profiles",
): Promise<string> {
  const meta = await fetchSitemapMeta();
  const pages =
    kind === "categories"
      ? meta.categories_pages
      : kind === "questions"
        ? meta.questions_pages
        : meta.profiles_pages;

  if (pages > 1) {
    return sitemapIndexXml(partFiles(kind, pages));
  }

  return buildTypePage(kind, 1);
}

export async function buildTypePage(
  kind: "categories" | "questions" | "profiles",
  page: number,
): Promise<string> {
  const data =
    kind === "categories"
      ? await fetchSitemapCategories(page)
      : kind === "questions"
        ? await fetchSitemapQuestions(page)
        : await fetchSitemapProfiles(page);

  return urlsetXml(data.urls);
}
