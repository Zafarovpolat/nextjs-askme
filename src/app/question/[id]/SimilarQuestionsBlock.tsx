"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import SimilarQuestionsSection from "@/components/SimilarQuestionsSection";
import { toSimilarQuestionListItem } from "@/lib/similar-question-list-item";
import type {
  SimilarQuestionsBlockFilter,
  SimilarQuestionsBlockPayload,
  SimilarQuestionsPage,
  SimilarQuestionsTabPage,
} from "@/types";
import type { QuestionListItem } from "@/components/QuestionListCard";

const PER_PAGE = 10;

type TabFilter = "opened" | "voting" | "best";

function filterToApi(f: TabFilter): SimilarQuestionsBlockFilter {
  if (f === "opened") return "open";
  if (f === "best") return "solved";
  return "voting";
}

function apiToTab(f: SimilarQuestionsBlockFilter): TabFilter {
  if (f === "open") return "opened";
  if (f === "solved") return "best";
  return "voting";
}

function emptyTabPage(): SimilarQuestionsTabPage {
  return {
    questions: [],
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
  };
}

function mapItems(page: SimilarQuestionsTabPage | undefined): QuestionListItem[] {
  return (page?.questions ?? [])
    .filter((q) => q?.author)
    .map((q) => toSimilarQuestionListItem(q));
}

type Props = {
  questionId: number;
  /** Данные с SSR; null — блок скрыт */
  initialBlock: SimilarQuestionsBlockPayload | null | undefined;
};

export default function SimilarQuestionsBlock({
  questionId,
  initialBlock,
}: Props) {
  if (initialBlock == null || !initialBlock.tabs) {
    return null;
  }

  return (
    <SimilarQuestionsBlockInner
      questionId={questionId}
      initialBlock={initialBlock}
    />
  );
}

function SimilarQuestionsBlockInner({
  questionId,
  initialBlock,
}: {
  questionId: number;
  initialBlock: SimilarQuestionsBlockPayload;
}) {
  /** Локальные копии вкладок: page1 с SSR, page2+ догружаются в «хвост» questions */
  const [tabsData, setTabsData] = useState<
    Partial<Record<SimilarQuestionsBlockFilter, SimilarQuestionsTabPage>>
  >(() => ({
    open: initialBlock.tabs.open ?? emptyTabPage(),
    voting: initialBlock.tabs.voting ?? emptyTabPage(),
    solved: initialBlock.tabs.solved ?? emptyTabPage(),
  }));

  const [tab, setTab] = useState<TabFilter>(() => apiToTab(initialBlock.filter));
  const [loadingMore, setLoadingMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const apiFilter = filterToApi(tab);
  const activePage = tabsData[apiFilter] ?? emptyTabPage();
  const items = useMemo(() => mapItems(activePage), [activePage]);
  const page = activePage.current_page;
  const lastPage = activePage.last_page;

  const handleTab = (next: TabFilter) => {
    if (next === tab) return;
    setTab(next);
    // первая страница уже в tabsData с SSR — запрос не нужен
  };

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;

    const filter = filterToApi(tab);
    const current = tabsData[filter] ?? emptyTabPage();
    if (current.current_page >= current.last_page) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    const nextPage = current.current_page + 1;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        per_page: String(PER_PAGE),
        filter,
      });
      const data = await api.get<SimilarQuestionsPage>(
        `v1/questions/${questionId}/similar?${params}`,
        { signal },
      );
      setTabsData((prev) => {
        const prevTab = prev[filter] ?? emptyTabPage();
        // защита от двойного append при гонке
        if (prevTab.current_page >= data.current_page) {
          return prev;
        }
        return {
          ...prev,
          [filter]: {
            questions: [...(prevTab.questions ?? []), ...(data.questions ?? [])],
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
          },
        };
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    } finally {
      setLoadingMore(false);
      abortRef.current = null;
    }
  }, [questionId, tab, tabsData, loadingMore]);

  return (
    <SimilarQuestionsSection
      title="Похожие вопросы участников"
      loading={false}
      emptyText="Похожих вопросов не найдено"
      items={items}
      page={page}
      lastPage={lastPage}
      loadingMore={loadingMore}
      onLoadMore={() => void handleLoadMore()}
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
