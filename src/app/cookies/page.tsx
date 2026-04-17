import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalFooterLayout from "@/components/legal/LegalFooterLayout";
import { fetchCustomHtmlPage } from "@/lib/fetch-custom-html-page";
import { LEGAL_FOOTER_SLUGS } from "@/lib/legal-footer-slugs";
import { metadataForLegalFooterSlug } from "@/lib/legal-footer-page-metadata";

export const revalidate = 120;

const SLUG = LEGAL_FOOTER_SLUGS.cookies;

export async function generateMetadata(): Promise<Metadata> {
  return metadataForLegalFooterSlug(SLUG);
}

export default async function CookiesPage() {
  const page = await fetchCustomHtmlPage(SLUG);
  if (!page) {
    notFound();
  }
  return <LegalFooterLayout page={page} />;
}
