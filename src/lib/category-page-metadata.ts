import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getApiFullUrl } from "@/config/api";
import {
  ROBOTS_INDEX_FOLLOW,
  ROBOTS_NOINDEX_FOLLOW,
  withListPageUrl,
  withPageUrl,
} from "@/lib/page-seo";

type ListQuery = { filter: string | null; page: number };

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
    robots: ROBOTS_INDEX_FOLLOW,
    openGraph: { title, description },
  });
}

export async function metadataForCategorySlug(
  slug: string,
  listQuery: ListQuery = { filter: null, page: 1 },
): Promise<Metadata> {
  const path = `/categories/${slug}`;
  const data = await fetchCategoryBySlug(slug);
  const name = data?.category?.name?.trim();
  if (!name || data?.category?.slug !== slug) {
    notFound();
  }

  const title = name;
  const description = `Вопросы и ответы по теме «${name}». Задайте вопрос или найдите решение в сообществе otvetai.`;
  const empty = data?.category?.has_questions === false;

  return withListPageUrl(path, listQuery.filter, listQuery.page, {
    title,
    description,
    robots: empty ? ROBOTS_NOINDEX_FOLLOW : ROBOTS_INDEX_FOLLOW,
    openGraph: { title, description },
  });
}

export async function metadataForSubcategorySlug(
  slug: string,
  sub: string,
  listQuery: ListQuery = { filter: null, page: 1 },
): Promise<Metadata> {
  const path = `/categories/${slug}/${sub}`;
  const data = await fetchSubcategoryBySlugs(slug, sub);
  const categoryName = data?.category?.name?.trim();
  const subName = data?.subcategory?.name?.trim();

  if (
    !subName ||
    data?.category?.slug !== slug ||
    data?.subcategory?.slug !== sub
  ) {
    notFound();
  }

  const title = categoryName ? `${subName} — ${categoryName}` : subName;
  const description = categoryName
    ? `Вопросы и ответы: ${subName} (${categoryName}). Задайте вопрос или найдите решение на otvetai.`
    : `Вопросы и ответы по теме «${subName}» на otvetai.`;
  const empty = data?.subcategory?.has_questions === false;

  return withListPageUrl(path, listQuery.filter, listQuery.page, {
    title,
    description,
    robots: empty ? ROBOTS_NOINDEX_FOLLOW : ROBOTS_INDEX_FOLLOW,
    openGraph: { title, description },
  });
}
