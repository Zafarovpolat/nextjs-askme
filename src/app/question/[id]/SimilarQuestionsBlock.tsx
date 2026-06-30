"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api-client";
import SimilarQuestionsSection from "@/components/SimilarQuestionsSection";
import { toSimilarQuestionListItem } from "@/lib/similar-question-list-item";
import type { SimilarQuestionsPage } from "@/types";
import type { QuestionListItem } from "@/components/QuestionListCard";

const PER_PAGE = 10;

type TabFilter = "opened" | "voting" | "best";

function filterToApi(f: TabFilter): "open" | "voting" | "solved" {
  if (f === "opened") return "open";
  if (f === "best") return "solved";
  return "voting";
}

export default function SimilarQuestionsBlock({
  questionId,
}: {
  questionId: number;
}) {
  const [tab, setTab] = useState<TabFilter>("opened");
  const [items, setItems] = useState<QuestionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSimilar = useCallback(
    async (filter: TabFilter, nextPage: number, append: boolean) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          per_page: String(PER_PAGE),
          filter: filterToApi(filter),
        });
        const data = await api.get<SimilarQuestionsPage>(
          `v1/questions/${questionId}/similar?${params}`,
          { signal },
        );
        const mapped = data.questions.map((q) => toSimilarQuestionListItem(q));
        if (append) {
          setItems((prev) => [...prev, ...mapped]);
        } else {
          setItems(mapped);
        }
        setPage(data.current_page);
        setLastPage(data.last_page);
      } catch (e) {
        if ((e as Error).name !== "AbortError" && !append) {
          setItems([]);
          setPage(1);
          setLastPage(1);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        abortRef.current = null;
      }
    },
    [questionId],
  );

  useEffect(() => {
    setTab("opened");
    fetchSimilar("opened", 1, false);
  }, [questionId, fetchSimilar]);

  const handleTab = (next: TabFilter) => {
    setTab(next);
    fetchSimilar(next, 1, false);
  };

  const handleLoadMore = () => {
    if (page >= lastPage || loadingMore || loading) return;
    fetchSimilar(tab, page + 1, true);
  };

  return (
    <SimilarQuestionsSection
      title="Похожие вопросы участников"
      loading={loading}
      emptyText="Похожих вопросов не найдено"
      items={items}
      page={page}
      lastPage={lastPage}
      loadingMore={loadingMore}
      onLoadMore={handleLoadMore}
      filter={
        <div className="questions_filter">
          <button
            type="button"
            className={`s_btn ${tab === "opened" ? "s_btn_active" : ""}`}
            onClick={() => handleTab("opened")}
          >
            Открытые
          </button>
          <button
            type="button"
            className={`s_btn ${tab === "voting" ? "s_btn_active" : ""}`}
            onClick={() => handleTab("voting")}
          >
            На голосовании
          </button>
          <button
            type="button"
            className={`s_btn ${tab === "best" ? "s_btn_active" : ""}`}
            onClick={() => handleTab("best")}
          >
            Лучшие
          </button>
        </div>
      }
    />
  );
}
