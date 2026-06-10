import type { Metadata } from "next";
import { cache } from "react";
import { getApiFullUrl } from "@/config/api";

const REVALIDATE_SEC = 60;

type CategoryMetaInfo = {
  id: number;
  name: string;
  slug: string;
  icon_key?: string | null;
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
    "Все категории на Ответы АЙ: школьные предметы, наука, технологии и другие темы. Найдите раздел и задайте вопрос.";

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export async function metadataForCategorySlug(slug: string): Promise<Metadata> {
  const data = await fetchCategoryBySlug(slug);
  const name = data?.category?.name?.trim();
  if (!name) {
    return { title: "Категория" };
  }

  const title = name;
  const description = `Вопросы и ответы по теме «${name}». Задайте вопрос или найдите решение в сообществе Ответы АЙ.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export async function metadataForSubcategorySlug(
  slug: string,
  sub: string,
): Promise<Metadata> {
  const data = await fetchSubcategoryBySlugs(slug, sub);
  const categoryName = data?.category?.name?.trim();
  const subName = data?.subcategory?.name?.trim();

  if (!subName) {
    return metadataForCategorySlug(slug);
  }

  const title = categoryName ? `${subName} — ${categoryName}` : subName;
  const description = categoryName
    ? `Вопросы и ответы: ${subName} (${categoryName}). Задайте вопрос или найдите решение на Ответы АЙ.`
    : `Вопросы и ответы по теме «${subName}» на Ответы АЙ.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}
