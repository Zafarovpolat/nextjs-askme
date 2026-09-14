import type { Metadata } from "next";
import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import type { QuestionPageData } from "@/types";
import { htmlToPlainText } from "@/lib/html-plain-text";
import { withPageUrl } from "@/lib/page-seo";

const META_DESCRIPTION_MAX = 160;

function stripLinks(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, "$1")
    .replace(/https?:\/\/[^\s<>]+/gi, " ")
    .replace(/\bwww\.[^\s<>]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Текст для meta description: без HTML, ссылок и markdown-ссылок, до 160 символов. */
export function snippetForMetaDescription(raw: string | null | undefined): string | undefined {
  const text = stripLinks(htmlToPlainText(raw));
  if (!text) return undefined;

  if (text.length <= META_DESCRIPTION_MAX) {
    return text;
  }

  return `${text.slice(0, META_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export function questionTextForMetaDescription(raw: string | null | undefined): string | undefined {
  return snippetForMetaDescription(raw);
}

export function questionPageMetaDescription(data: QuestionPageData): string | undefined {
  const fromBest = snippetForMetaDescription(data.best_answer?.text);
  if (fromBest) return fromBest;
  return snippetForMetaDescription(data.description);
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
  const path = `/question/${id}`;
  if (!/^\d+$/.test(id)) {
    return withPageUrl(path, { title: "Вопрос" });
  }

  const data = await fetchQuestionForMetadata(id);
  const title = data?.title?.trim();
  if (!title) {
    return withPageUrl(path, { title: "Вопрос" });
  }

  const description = questionPageMetaDescription(data);

  return withPageUrl(path, {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  });
}
