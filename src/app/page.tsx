import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/HomeContent";
import { getApiFullUrl } from "@/config/api";
import { withPageUrl } from "@/lib/page-seo";
import {
  fetchHomeQuestionsTabs,
  parseHomeQuestionFilter,
  parseHomeQuestionPage,
} from "@/lib/home-questions-tabs";
import type { Metadata } from "next";

export const metadata: Metadata = withPageUrl("/");

async function fetchMainData() {
  const res = await fetch(getApiFullUrl("v1/main"), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return {
      categories: [],
      project_leaders: [],
      most_discussed: [],
      popular_topics: [],
    };
  }
  return res.json();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const query = await searchParams;
  const initialFilter = parseHomeQuestionFilter(query.filter);
  const initialPage = parseHomeQuestionPage(query.page);

  const [mainData, initialByFilter] = await Promise.all([
    fetchMainData(),
    fetchHomeQuestionsTabs(initialFilter, initialPage),
  ]);

  return (
    <>
      <HomeContent
        key={`${initialFilter}-${initialPage}`}
        initialData={mainData}
        initialByFilter={initialByFilter}
        initialFilter={initialFilter}
      />
      <Footer />
    </>
  );
}
