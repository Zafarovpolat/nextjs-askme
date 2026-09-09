import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCustomHtmlPage } from "@/lib/fetch-custom-html-page";
import { withPageUrl } from "@/lib/page-seo";

export async function metadataForLegalFooterSlug(
  slug: string,
  version?: number | null,
): Promise<Metadata> {
  const page = await fetchCustomHtmlPage(slug, version);
  if (!page) {
    notFound();
  }
  const baseTitle = page.title?.trim() || slug;
  const title =
    page.version?.version != null
      ? `${baseTitle} (редакция v${page.version.version})`
      : baseTitle;
  const description = page.description?.trim() || undefined;
  const keywordsRaw = page.keywords?.trim();
  const keywords = keywordsRaw
    ? keywordsRaw.split(/[,;]\s*/).filter(Boolean)
    : undefined;
  return withPageUrl(`/${slug}`, {
    title,
    description,
    keywords,
    openGraph: { title, description },
  });
}
