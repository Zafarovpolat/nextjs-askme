import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/HomeContent";
import { getApiFullUrl } from "@/config/api";
import { withListPageUrl } from "@/lib/page-seo";
import {
  fetchHomeQuestionsTabs,
  parseExplicitHomeFilter,
  parseHomeQuestionFilter,
  parseHomeQuestionPage,
} from "@/lib/home-questions-tabs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}): Promise<Metadata> {
  const query = await searchParams;
  return withListPageUrl(
    "/",
    parseExplicitHomeFilter(query.filter),
    parseHomeQuestionPage(query.page),
  );
}

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
  const explicitFilter = parseExplicitHomeFilter(query.filter);
  const initialFilter = parseHomeQuestionFilter(query.filter);
  const initialPage = parseHomeQuestionPage(query.page);

  const [mainData, initialByFilter] = await Promise.all([
    fetchMainData(),
    fetchHomeQuestionsTabs(explicitFilter, initialPage),
  ]);

  return (
    <>
      <HomeContent
        key={`${explicitFilter ?? "all"}-${initialPage}`}
        initialData={mainData}
        initialByFilter={initialByFilter}
        initialFilter={initialFilter}
        explicitFilter={explicitFilter}
        initialPage={initialPage}
      />
      <Footer />
    </>
  );
}
