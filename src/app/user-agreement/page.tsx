import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalFooterLayout from "@/components/legal/LegalFooterLayout";
import { fetchCustomHtmlPage } from "@/lib/fetch-custom-html-page";
import { LEGAL_FOOTER_SLUGS } from "@/lib/legal-footer-slugs";
import { metadataForLegalFooterSlug } from "@/lib/legal-footer-page-metadata";

export const revalidate = 120;

const SLUG = LEGAL_FOOTER_SLUGS.userAgreement;

type PageProps = { searchParams?: { v?: string } };

function parseVersion(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return metadataForLegalFooterSlug(SLUG, parseVersion(searchParams?.v));
}

export default async function UserAgreementPage({ searchParams }: PageProps) {
  const page = await fetchCustomHtmlPage(SLUG, parseVersion(searchParams?.v));
  if (!page) {
    notFound();
  }
  return <LegalFooterLayout page={page} />;
}
