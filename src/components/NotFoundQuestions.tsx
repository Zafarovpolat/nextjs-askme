"use client";

import { useCallback, useRef, useState } from "react";
import SharePopup from "@/components/SharePopup";
import QuestionListCard from "@/components/QuestionListCard";
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion";
import { api } from "@/lib/api-client";
import type {
  HomeQuestionFilter,
  HomeQuestionsByFilter,
  HomeQuestionsPage,
} from "@/lib/home-questions-tabs";

const tabs = [
  { id: "open", label: "Открытые" },
  { id: "voting", label: "На голосовании" },
  { id: "best", label: "Лучшие" },
  { id: "premium", label: "Премиум" },
] as const satisfies ReadonlyArray<{ id: HomeQuestionFilter; label: string }>;

export default function NotFoundQuestions({
  initialByFilter,
}: {
  initialByFilter: HomeQuestionsByFilter;
}) {
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion();
  const [activeTab, setActiveTab] = useState<HomeQuestionFilter>("open");
  const [byFilter, setByFilter] = useState(initialByFilter);
  const [loadingMore, setLoadingMore] = useState<Partial<Record<HomeQuestionFilter, boolean>>>({});
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);

  const loadMore = useCallback(
    async (tab: HomeQuestionFilter) => {
      const page = byFilter[tab];
      if (page.current_page >= page.last_page || loadingMore[tab]) return;
      setLoadingMore((prev) => ({ ...prev, [tab]: true }));
      try {
        const nextPage = page.current_page + 1;
        const params = new URLSearchParams({
          filter: tab,
          page: String(nextPage),
          per_page: String(page.per_page || 10),
        });
        const data = await api.get<HomeQuestionsPage>(`v1/main/questions?${params}`);
        setByFilter((prev) => ({
          ...prev,
          [tab]: {
            ...data,
            questions: [...prev[tab].questions, ...(data.questions ?? [])],
          },
        }));
      } catch {
        /* тихо */
      } finally {
        setLoadingMore((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [byFilter, loadingMore],
  );

  const handleShareClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, title: string, id: number) => {
      shareButtonRef.current = e.currentTarget;
      setShareData({
        title,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/question/${id}`,
      });
      setIsShareOpen(true);
    },
    [],
  );

  return (
    <div className="section populars_block not_found_questions">
      <div className="blocks_title">
        <h2>Вопросы участников</h2>
        <div className="questions_filter">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`s_btn ${activeTab === tab.id ? "s_btn_active" : ""} ${tab.id === "premium" ? "premium-filter-btn" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.id === "premium" ? (
                <>
                  <svg className="premium-crown-icon" width="20" height="17" fill="currentColor" aria-hidden>
                    <use xlinkHref="/sprites.svg#rules" />
                  </svg>
                  {tab.label}
                </>
              ) : (
                tab.label
              )}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((tab) => {
        const page = byFilter[tab.id];
        const questions = page.questions ?? [];
        const hasMore = (page.current_page ?? 1) < (page.last_page ?? 1);
        return (
          <div key={tab.id} hidden={activeTab !== tab.id} data-questions-tab={tab.id}>
            <div className="questions_list">
              {questions.map((question) => (
                <QuestionListCard
                  key={question.id}
                  question={question}
                  isFavorited={isFavorited}
                  isPending={isPending}
                  onToggleFavorite={toggleFavorite}
                  onShare={handleShareClick}
                />
              ))}
            </div>
            {questions.length === 0 ? (
              <p className="secondary_text" style={{ textAlign: "center" }}>
                Пока нет вопросов
              </p>
            ) : null}
            {hasMore ? (
              <div className="show_more_btn_wrapper">
                <button
                  className="show_more_btn"
                  type="button"
                  onClick={() => void loadMore(tab.id)}
                  disabled={Boolean(loadingMore[tab.id])}
                >
                  <svg width="22" height="22">
                    <use xlinkHref="/sprites.svg#sync"></use>
                  </svg>
                  {loadingMore[tab.id] ? "Загрузка..." : "Показать еще"}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}

      <SharePopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        anchorRef={shareButtonRef}
        title={shareData.title}
        url={shareData.url}
      />
    </div>
  );
}
