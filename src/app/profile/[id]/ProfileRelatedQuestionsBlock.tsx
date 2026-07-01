"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api-client";
import SimilarQuestionsSection from "@/components/SimilarQuestionsSection";
import { toSimilarQuestionListItem } from "@/lib/similar-question-list-item";
import type { SimilarQuestionsPage } from "@/types";
import type { QuestionListItem } from "@/components/QuestionListCard";

const PER_PAGE = 12;

export default function ProfileRelatedQuestionsBlock({
  profileUserId,
}: {
  profileUserId: number;
}) {
  const [items, setItems] = useState<QuestionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          per_page: String(PER_PAGE),
        });
        const data = await api.get<SimilarQuestionsPage>(
          `v1/users/${profileUserId}/related-questions?${params}`,
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
    [profileUserId],
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [profileUserId, fetchPage]);

  const handleLoadMore = () => {
    if (page >= lastPage || loadingMore || loading) return;
    fetchPage(page + 1, true);
  };

  return (
    <SimilarQuestionsSection
      title="Похожие вопросы"
      marginTop={32}
      loading={loading}
      emptyText="Пока нет вопросов в каталоге"
      items={items}
      page={page}
      lastPage={lastPage}
      loadingMore={loadingMore}
      onLoadMore={handleLoadMore}
    />
  );
}
