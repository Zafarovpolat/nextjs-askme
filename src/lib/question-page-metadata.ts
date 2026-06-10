import type { Metadata } from "next";
import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import type { QuestionPageData } from "@/types";

const META_DESCRIPTION_MAX = 320;

/** Текст вопроса для meta description: без HTML, схлопнутые пробелы. */
export function questionTextForMetaDescription(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;

  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return undefined;

  if (text.length <= META_DESCRIPTION_MAX) {
    return text;
  }

  return `${text.slice(0, META_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

const fetchQuestionForMetadata = cache(async (id: string): Promise<QuestionPageData | null> => {
  const url = getApiFullUrl(`v1/questions/${id}?sort_by=rating&sort_dir=desc`);
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null;
    return (await res.json()) as QuestionPageData;
  } catch {
    return null;
  }
});

export async function metadataForQuestionPage(id: string): Promise<Metadata> {
  if (!/^\d+$/.test(id)) {
    return { title: "Вопрос" };
  }

  const data = await fetchQuestionForMetadata(id);
  const title = data?.title?.trim();
  if (!title) {
    return { title: "Вопрос" };
  }

  const description = questionTextForMetaDescription(data?.description);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}
