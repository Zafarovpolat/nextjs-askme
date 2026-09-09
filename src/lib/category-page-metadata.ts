import type { Metadata } from "next";
import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import { withPageUrl } from "@/lib/page-seo";

const REVALIDATE_SEC = 60;

type CategoryMetaInfo = {
  id: number;
  name: string;
  slug: string;
  icon_key?: string | null;
  has_questions?: boolean;
};

type CategoryPagePayload = {
  category?: CategoryMetaInfo;
  subcategory?: CategoryMetaInfo | null;
};

async function fetchCategoryPageJson(url: string): Promise<CategoryPagePayload | null> {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEC },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null;
    return (await res.json()) as CategoryPagePayload;
  } catch {
    return null;
  }
}

const fetchCategoryBySlug = cache(async (slug: string) =>
  fetchCategoryPageJson(getApiFullUrl(`v1/category-pages/${slug}`)),
);

const fetchSubcategoryBySlugs = cache(async (slug: string, sub: string) =>
  fetchCategoryPageJson(getApiFullUrl(`v1/category-pages/${slug}/${sub}`)),
);

export function metadataForCategoriesIndex(): Metadata {
  const title = "Категории вопросов";
  const description =
    "Все категории на otvetai: школьные предметы, наука, технологии и другие темы. Найдите раздел и задайте вопрос.";

  return withPageUrl("/categories", {
    title,
    description,
    openGraph: { title, description },
  });
}

export async function metadataForCategorySlug(slug: string): Promise<Metadata> {
  const path = `/categories/${slug}`;
  const data = await fetchCategoryBySlug(slug);
  const name = data?.category?.name?.trim();
  if (!name) {
    return withPageUrl(path, { title: "Категория" });
  }

  const title = name;
  const description = `Вопросы и ответы по теме «${name}». Задайте вопрос или найдите решение в сообществе otvetai.`;
  const empty = data?.category?.has_questions === false;

  return withPageUrl(path, {
    title,
    description,
    robots: empty ? { index: false, follow: true } : undefined,
    openGraph: { title, description },
  });
}

export async function metadataForSubcategorySlug(
  slug: string,
  sub: string,
): Promise<Metadata> {
  const path = `/categories/${slug}/${sub}`;
  const data = await fetchSubcategoryBySlugs(slug, sub);
  const categoryName = data?.category?.name?.trim();
  const subName = data?.subcategory?.name?.trim();

  if (!subName) {
    const fallback = await metadataForCategorySlug(slug);
    return withPageUrl(path, {
      title: fallback.title,
      description: fallback.description,
      openGraph: fallback.openGraph,
    });
  }

  const title = categoryName ? `${subName} — ${categoryName}` : subName;
  const description = categoryName
    ? `Вопросы и ответы: ${subName} (${categoryName}). Задайте вопрос или найдите решение на otvetai.`
    : `Вопросы и ответы по теме «${subName}» на otvetai.`;
  const empty = data?.subcategory?.has_questions === false;

  return withPageUrl(path, {
    title,
    description,
    robots: empty ? { index: false, follow: true } : undefined,
    openGraph: { title, description },
  });
}
