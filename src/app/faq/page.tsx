import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import FaqPageClient from "./FaqPageClient";
import { fetchFaqPage } from "@/lib/fetch-faq-page";
import { buildFaqPageJsonLd } from "@/lib/faq-page-jsonld";
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

  return withPageUrl("/faq", {
    title,
    description,
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
      <JsonLd data={buildFaqPageJsonLd(data.categories)} />
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
