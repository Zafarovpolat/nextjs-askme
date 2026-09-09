import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FaqPageClient from "./FaqPageClient";
import { fetchFaqPage } from "@/lib/fetch-faq-page";
import { withPageUrl } from "@/lib/page-seo";
import "@/styles/faq.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchFaqPage();
  if (!data) {
    notFound();
  }
  const title = data.title?.trim() || "Часто задаваемые вопросы — otvetai";
  const description = data.description?.trim() || undefined;
  const keywordsRaw = data.keywords?.trim();
  const keywords = keywordsRaw
    ? keywordsRaw.split(/[,;]\s*/).filter(Boolean)
    : undefined;

  return withPageUrl("/faq", {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
    },
  });
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
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: pageTitle, href: "/faq" },
          ]}
        />
      </div>

      <FaqPageClient categories={data.categories} />

      <Footer />
    </>
  );
}
