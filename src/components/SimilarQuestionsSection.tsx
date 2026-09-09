"use client";

import { useState, useRef, useCallback, type MouseEvent, type ReactNode } from "react";
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion";
import SharePopup from "@/components/SharePopup";
import QuestionListCard, { type QuestionListItem } from "@/components/QuestionListCard";

export type SimilarQuestionsSectionProps = {
  title: string;
  filter?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  items: QuestionListItem[];
  page?: number;
  lastPage?: number;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  marginTop?: number | string;
};

export default function SimilarQuestionsSection({
  title,
  filter,
  loading = false,
  loadingText = "Загрузка…",
  emptyText = "Список пуст",
  items,
  page = 1,
  lastPage = 1,
  loadingMore = false,
  onLoadMore,
  marginTop,
}: SimilarQuestionsSectionProps) {
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion();

  const handleShareClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>, shareTitle: string, id: number) => {
      shareButtonRef.current = e.currentTarget;
      setShareData({
        title: shareTitle,
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}/question/${id}`
            : "",
      });
      setShareOpen(true);
    },
    [],
  );

  return (
    <div
      className="similar_questions_block similar_questions_block--section container"
      style={marginTop != null ? { marginTop } : undefined}
    >
      <div className="blocks_title">
        <h2>{title}</h2>
        {filter}
      </div>

      {loading && items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
          {loadingText}
        </p>
      ) : items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
          {emptyText}
        </p>
      ) : (
        <>
          <div className="questions_list questions_list_profile">
            {items.map((q) => (
              <QuestionListCard
                key={q.id}
                question={q}
                isFavorited={isFavorited}
                isPending={isPending}
                onToggleFavorite={toggleFavorite}
                onShare={handleShareClick}
              />
            ))}
          </div>

          {onLoadMore && page < lastPage ? (
            <div
              className="show_more_btn_wrapper"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <button
                className="show_more_btn"
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
              >
                <svg width="22" height="22">
                  <use xlinkHref="/sprites.svg#sync"></use>
                </svg>
                <span>{loadingMore ? "Загрузка…" : "Загрузить еще"}</span>
              </button>
            </div>
          ) : null}
        </>
      )}

      <SharePopup
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        anchorRef={shareButtonRef}
        title={shareData.title}
        url={shareData.url}
      />
    </div>
  );
}
