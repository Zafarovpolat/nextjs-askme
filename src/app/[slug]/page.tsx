import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalFooterLayout from "@/components/legal/LegalFooterLayout";
import { fetchCustomHtmlPage } from "@/lib/fetch-custom-html-page";
import { metadataForLegalFooterSlug } from "@/lib/legal-footer-page-metadata";

export const revalidate = 120;

type PageProps = {
  params: { slug: string };
  searchParams?: { v?: string };
};

function isValidCustomPageSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim().toLowerCase());
}

function parseVersion(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const slug = params.slug?.trim().toLowerCase() ?? "";
  if (!isValidCustomPageSlug(slug)) {
    notFound();
  }
  return metadataForLegalFooterSlug(slug, parseVersion(searchParams?.v));
}

/**
 * Любая HTML-страница из custom_pages: /{slug} или /{slug}?v=N (архив редакции).
 * Существующие маршруты (login, profile, about, faq, user-agreement, …)
 * имеют приоритет над этим динамическим сегментом.
 */
export default async function CustomPageBySlug({ params, searchParams }: PageProps) {
  const slug = params.slug?.trim().toLowerCase() ?? "";
  if (!isValidCustomPageSlug(slug)) {
    notFound();
  }

  const page = await fetchCustomHtmlPage(slug, parseVersion(searchParams?.v));
  if (!page) {
    notFound();
  }

  return <LegalFooterLayout page={page} />;
}
