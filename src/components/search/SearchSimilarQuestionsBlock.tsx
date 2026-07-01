"use client";

import { useCallback, useEffect, useState } from "react";
import PremiumFilterCrownIcon from "@/components/PremiumFilterCrownIcon";
import SimilarQuestionsSection from "@/components/SimilarQuestionsSection";
import type { QuestionListItem } from "@/components/QuestionListCard";
import { api } from "@/lib/api-client";

const SIMILAR_FILTERS = [
  { label: "Все", value: "all" as const },
  { label: "Открытые", value: "open" as const },
  { label: "На голосовании", value: "voting" as const },
  { label: "Решения", value: "solved" as const },
  { label: "Премиум", value: "premium" as const },
];

export default function SearchSimilarQuestionsBlock({ query }: { query: string }) {
  const qTrimmed = query.trim();
  const [similarFilter, setSimilarFilter] = useState<
    (typeof SIMILAR_FILTERS)[number]["value"]
  >("all");
  const [items, setItems] = useState<QuestionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!qTrimmed) {
      setItems([]);
      setPage(1);
      setLastPage(1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      q: qTrimmed,
      page: "1",
      per_page: "15",
      filter: similarFilter,
    });
    void api
      .get<{
        questions: QuestionListItem[];
        current_page: number;
        last_page: number;
      }>(`v1/questions/similar?${params.toString()}`)
      .then((data) => {
        if (!cancelled) {
          setItems(data.questions ?? []);
          setPage(data.current_page ?? 1);
          setLastPage(data.last_page ?? 1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setPage(1);
          setLastPage(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [qTrimmed, similarFilter]);

  const handleLoadMore = useCallback(() => {
    if (!qTrimmed || page >= lastPage || loadingMore) return;
    setLoadingMore(true);
    const params = new URLSearchParams({
      q: qTrimmed,
      page: String(page + 1),
      per_page: "15",
      filter: similarFilter,
    });
    void api
      .get<{
        questions: QuestionListItem[];
        current_page: number;
        last_page: number;
      }>(`v1/questions/similar?${params.toString()}`)
      .then((data) => {
        setItems((prev) => [...prev, ...(data.questions ?? [])]);
        setPage(data.current_page ?? page + 1);
        setLastPage(data.last_page ?? lastPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [qTrimmed, similarFilter, page, lastPage, loadingMore]);

  if (!qTrimmed) return null;

  return (
    <SimilarQuestionsSection
      title="Похожие вопросы участников"
      loading={loading}
      loadingText="Загрузка похожих…"
      emptyText="Нет похожих вопросов по этому запросу"
      items={items}
      page={page}
      lastPage={lastPage}
      loadingMore={loadingMore}
      onLoadMore={handleLoadMore}
      filter={
        <div className="questions_filter">
          {SIMILAR_FILTERS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`s_btn ${similarFilter === tab.value ? "s_btn_active" : ""} ${tab.value === "premium" ? "premium-filter-btn" : ""}`}
              onClick={() => setSimilarFilter(tab.value)}
            >
              {tab.value === "premium" ? (
                <>
                  <PremiumFilterCrownIcon />
                  {tab.label}
                </>
              ) : (
                tab.label
              )}
            </button>
          ))}
        </div>
      }
    />
  );
}
