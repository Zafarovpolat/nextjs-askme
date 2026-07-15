import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import FaqPageClient from "./FaqPageClient";
import { fetchFaqPage } from "@/lib/fetch-faq-page";
import "@/styles/faq.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchFaqPage();
  if (!data) {
    notFound();
  }
  const title = data.title?.trim() || "Часто задаваемые вопросы — Otvetai";
  const description = data.description?.trim() || undefined;
  const keywordsRaw = data.keywords?.trim();
  const keywords = keywordsRaw
    ? keywordsRaw.split(/[,;]\s*/).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function FaqPage() {
  const data = await fetchFaqPage();
  if (!data) {
    notFound();
  }

  const pageTitle = data.title?.trim() || "Частые вопросы";

  return (
    <>
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{pageTitle}</span>
        </div>
      </div>

      <FaqPageClient categories={data.categories} />

      <Footer />
    </>
  );
}
