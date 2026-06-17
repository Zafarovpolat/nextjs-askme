"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type MouseEvent,
} from "react";
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion";
import { api } from "@/lib/api-client";
import SharePopup from "@/components/SharePopup";
import QuestionListCard, {
  type QuestionListItem,
} from "@/components/QuestionListCard";
import type { SimilarQuestionItem, SimilarQuestionsPage } from "@/types";

const PER_PAGE = 12;

function toQuestionListItem(q: SimilarQuestionItem): QuestionListItem {
  return {
    id: q.id,
    title: q.title,
    created_at: q.created_at,
    answers_count: q.answers_count,
    likes_count: q.likes_count,
    is_premium: q.is_premium,
    author: {
      id: q.author.id,
      full_name: q.author.full_name,
      avatar_url: q.author.avatar_url,
      avatar_url_2x: q.author.avatar_url_2x,
      balls: q.author.balls,
      is_premium: q.author.is_premium,
      premium_is_active: q.author.premium_is_active,
      premium_is_permanent: q.author.premium_is_permanent,
      premium_package_name: q.author.premium_package_name,
    },
    latest_likers: q.latest_likers.map((u) => ({
      id: u.id,
      avatar_url: u.avatar_url,
      avatar_url_2x: u.avatar_url_2x,
    })),
  };
}

export default function ProfileRelatedQuestionsBlock({
  profileUserId,
}: {
  profileUserId: number;
}) {
  const [items, setItems] = useState<SimilarQuestionItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });

  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion();

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
        if (append) {
          setItems((prev) => [...prev, ...data.questions]);
        } else {
          setItems(data.questions);
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

  const handleShareClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>, title: string, id: number) => {
      shareButtonRef.current = e.currentTarget;
      setShareData({
        title,
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
    <div className="similar_questions_block container" style={{ marginTop: "32px" }}>
      <div className="blocks_title">
        <h2>Похожие вопросы</h2>
      </div>

      {loading && items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
          Загрузка…
        </p>
      ) : items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
          Пока нет вопросов в каталоге
        </p>
      ) : (
        <>
          {items.map((q) => (
            <QuestionListCard
              key={q.id}
              question={toQuestionListItem(q)}
              isFavorited={isFavorited}
              isPending={isPending}
              onToggleFavorite={toggleFavorite}
              onShare={handleShareClick}
            />
          ))}

          {page < lastPage ? (
            <div
              className="show_more_btn_wrapper"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <button
                className="show_more_btn"
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                <svg width="22" height="22">
                  <use xlinkHref="#sync"></use>
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
