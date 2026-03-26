"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time-ago";
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion";
import { api } from "@/lib/api-client";
import SharePopup from "@/components/SharePopup";
import type { SimilarQuestionItem, SimilarQuestionsPage } from "@/types";

const PER_PAGE = 10;

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

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
          { signal }
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
    [questionId]
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
    []
  );

  return (
    <div className="similar_questions_block container">
      <div className="blocks_title">
        <h2>Похожие вопросы участников</h2>
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
      </div>

      {loading && items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
          Загрузка…
        </p>
      ) : items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
          Похожих вопросов не найдено
        </p>
      ) : (
        <>
          {items.map((q) => (
            <div className="question_list_item" key={q.id}>
              <div className="question_item_top_data">
                <div className="question_item_top_data_left">
                  <Link href={`/profile/${q.author.id}`}>
                    <img
                      src={q.author.avatar_url || "/images/icons/avatar.svg"}
                      alt=""
                    />
                  </Link>
                  <div>
                    <p className="main_text">
                      <Link href={`/profile/${q.author.id}`}>
                        {q.author.full_name}
                      </Link>
                    </p>
                    <span>
                      {numWord(q.author.balls ?? 0, ["балл", "балла", "баллов"])}
                    </span>
                  </div>
                </div>
                <div className="question_item_top_data_right">
                  <button
                    type="button"
                    title="Мне нравится"
                    className={`s_btn s_btn_icon btn-like ${isFavorited(q.id) ? "btn-like--active" : ""}`}
                    onClick={() => toggleFavorite(q.id)}
                    disabled={isPending(q.id)}
                  >
                    <svg width="13.71" height="12">
                      <use xlinkHref="#like"></use>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="s_btn s_btn_icon share-this"
                    title="Поделиться"
                    onClick={(e) => handleShareClick(e, q.title, q.id)}
                  >
                    <svg width="14" height="14">
                      <use xlinkHref="#share"></use>
                    </svg>
                  </button>
                </div>
              </div>
              <Link href={`/question/${q.id}`}>
                <div className="question_list_item_left">
                  <img
                    src={q.author.avatar_url || "/images/icons/avatar.svg"}
                    alt=""
                  />
                  <div>
                    <p className="main_text">{q.title}</p>
                    <span>{formatTimeAgo(q.created_at)}</span>
                  </div>
                </div>
              </Link>
              <div className="question_list_item_right">
                <div className="question_list_item_users">
                  {q.latest_likers.slice(0, 3).map((u) => (
                    <img
                      key={u.id}
                      src={u.avatar_url || "/images/icons/avatar.svg"}
                      alt=""
                    />
                  ))}
                  <p className="main_text">+{q.answers_count}</p>
                </div>
                <div className="question_list_item_right_actions">
                  <button
                    type="button"
                    title="Мне нравится"
                    className={`s_btn s_btn_icon btn-like ${isFavorited(q.id) ? "btn-like--active" : ""}`}
                    onClick={() => toggleFavorite(q.id)}
                    disabled={isPending(q.id)}
                  >
                    <svg width="13.71" height="12">
                      <use xlinkHref="#like"></use>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="s_btn s_btn_icon share-this"
                    title="Поделиться"
                    onClick={(e) => handleShareClick(e, q.title, q.id)}
                  >
                    <svg width="14" height="14">
                      <use xlinkHref="#share"></use>
                    </svg>
                  </button>
                  <Link className="s_btn" href={`/question/${q.id}`}>
                    Посмотреть
                  </Link>
                  <Link className="s_btn s_btn_active" href={`/question/${q.id}#answer`}>
                    Ответить
                  </Link>
                </div>
              </div>
            </div>
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
