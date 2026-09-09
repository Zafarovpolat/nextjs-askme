import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import { fetchProfileWidgetsCached } from "@/lib/server-profile-widgets";
import { fetchCategoriesCached } from "@/lib/server-categories";
import { fetchMainSidebarCategoriesCached } from "@/lib/server-main-sidebar-categories";
import { fetchSearchLeaderQuestionsCached } from "@/lib/server-search-leaders";
import { withPageUrl } from "@/lib/page-seo";
import type { Metadata } from "next";

export const metadata: Metadata = withPageUrl("/search", {
  title: "Поиск",
  robots: { index: false, follow: true },
});

export default async function SearchPage() {
  const [widgets, leaderQuestions, categories, sidebarCategories] =
    await Promise.all([
      fetchProfileWidgetsCached(),
      fetchSearchLeaderQuestionsCached(),
      fetchCategoriesCached(),
      fetchMainSidebarCategoriesCached(),
    ]);

  return (
    <Suspense
      fallback={
        <div
          className="container"
          style={{ padding: "50px 0", textAlign: "center" }}
        >
          Загрузка…
        </div>
      }
    >
      <SearchPageClient
        widgets={widgets}
        leaderQuestions={leaderQuestions}
        categories={categories}
        sidebarCategories={sidebarCategories}
      />
    </Suspense>
  );
}
