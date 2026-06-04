import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCustomHtmlPage } from "@/lib/fetch-custom-html-page";

export async function metadataForLegalFooterSlug(
  slug: string,
): Promise<Metadata> {
  const page = await fetchCustomHtmlPage(slug);
  if (!page) {
    notFound();
  }
  const title = page.title?.trim() || slug;
  const description = page.description?.trim() || undefined;
  const keywordsRaw = page.keywords?.trim();
  const keywords = keywordsRaw
    ? keywordsRaw.split(/[,;]\s*/).filter(Boolean)
    : undefined;
  return {
    title,
    description,
    keywords,
    openGraph: { title, description },
  };
}
