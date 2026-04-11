"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time-ago";
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion";
import { useVoteQuestion } from "@/hooks/useVoteQuestion";
import ComplaintModal from "@/components/ComplaintModal";
import AnswerBlock, { AnswerWithReplies } from "./AnswerBlock";
import SimilarQuestionsBlock from "./SimilarQuestionsBlock";
import QuestionLeadersSidebar from "./QuestionLeadersSidebar";
import { mockUsers } from "@/data/mock-users";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import type { QuestionPageData } from "@/types";

// Категории для сайдбара
const sidebarCategories = [
  {
    name: "Авто, Мото",
    slug: "auto-moto",
    svgIcon: "steering-wheel",
    subcategories: [
      "Автоспорт",
      "Автострахование",
      "Выбор автомобиля, мотоцикла",
      "ГИБДД, Обучение, Права",
      "ПДД, Вождение",
      "Оформление авто-мото сделок",
      "Сервис, Обслуживание, Тюнинг",
      "Прочие Авто-темы",
    ],
  },
  {
    name: "Развлечения",
    slug: "entertainment",
    svgIcon: "gaming",
    subcategories: [
      "Игры без компьютера",
      "Клубы, Дискотеки",
      "Концерты, Выставки, Спектакли",
      "Охота и Рыбалка",
    ],
  },
  {
    name: "Растения",
    slug: "plants",
    svgIcon: "gear",
    subcategories: [
      "Дикая природа",
      "Домашние",
      "Комнатные растения",
      "Сад-Огород",
    ],
  },
  {
    name: "Красота и Здоровье",
    slug: "beauty-health",
    svgIcon: "heart",
    subcategories: [
      "Коронавирус",
      "Баня, Массаж, Фитнес",
      "Болезни, Лекарства",
      "Детское здоровье",
    ],
  },
  {
    name: "Семья, Дом",
    slug: "family-home",
    svgIcon: "family",
    subcategories: [
      "Беременность, Роды",
      "Воспитание детей",
      "Домашняя бухгалтерия",
      "Домоводство",
    ],
  },
  {
    name: "Бизнес, Финансы",
    slug: "business-finance",
    svgIcon: "business",
    subcategories: ["Банки и Кредиты", "Недвижимость, Ипотека"],
  },
  {
    name: "Еда, Кулинария",
    slug: "food-cooking",
    svgIcon: "food",
    subcategories: ["Вторые блюда", "Десерты, Сладости, Выпечка"],
  },
];

/** Как префикс «имя,» в цепочке ответов (AnswerBlock) */
const REPLY_NAME_COLOR = "#6069ff";

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

export default function QuestionPageContent({
  initialQuestion,
}: {
  initialQuestion: QuestionPageData;
}) {
  const timeAgoText = initialQuestion.best_answer?.best_answer_set_at
    ? "Решено " + formatTimeAgo(initialQuestion.best_answer.best_answer_set_at)
    : formatTimeAgo(initialQuestion.created_at);

  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const categorySlug = initialQuestion.category?.slug ?? "voprosy";
  const categoryName = initialQuestion.category?.name ?? "Вопросы";
  const allowAnswerComments = initialQuestion.allow_answer_comments ?? true;
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion();
  const {
    likes_count,
    dislikes_count,
    user_vote,
    vote,
    pending: votePending,
  } = useVoteQuestion(initialQuestion.id, {
    likes_count: initialQuestion.likes_count ?? 0,
    dislikes_count: initialQuestion.dislikes_count ?? 0,
    votes_score: initialQuestion.votes_score ?? 0,
    user_vote: initialQuestion.auth_extra?.user_vote ?? null,
  });

  const apiAnswers = initialQuestion.answers ?? [];
  const bestAnswer = initialQuestion.best_answer ?? null;
  const bestAnswerIdFromApi = bestAnswer?.id ?? null;
  const perPage = 10;
  const totalAnswers = Math.max(
    0,
    initialQuestion.answers_count ?? apiAnswers.length
  );
  const [sortBy, setSortBy] = useState<"rating" | "date">("rating");
  const [openCategories, setOpenCategories] = useState<string[]>([categorySlug]);
  const [complaintModal, setComplaintModal] = useState<{
    questionId?: number;
    answerId?: number;
  } | null>(null);
  const [pendingBestAnswer, setPendingBestAnswer] = useState(false);
  const [bestAnswerId, setBestAnswerId] = useState<number | null>(
    bestAnswerIdFromApi
  );
  const [replyTarget, setReplyTarget] = useState<{
    parentAnswerId: number;
    replyToName: string;
  } | null>(null);
  const [answerSubmitError, setAnswerSubmitError] = useState<string | null>(
    null
  );
  const [answerSubmitPending, setAnswerSubmitPending] = useState(false);
  const [answersPage, setAnswersPage] = useState(1);
  const [answersLastPage, setAnswersLastPage] = useState(
    Math.max(1, Math.ceil(totalAnswers / perPage))
  );
  const [answersLoadingMore, setAnswersLoadingMore] = useState(false);
  const [answersData, setAnswersData] = useState(apiAnswers);
  /** Только вводимый текст (без «Имя,»); на сервер уходит только он */
  const [answerText, setAnswerText] = useState("");

  const hasBestAnswer =
    bestAnswerId != null || initialQuestion.best_answer != null;
  const isQuestionAuthor = initialQuestion.auth_extra?.is_author ?? false;
  const canSelectBestAnswer = !hasBestAnswer && isQuestionAuthor;

  const answerRef = useRef<HTMLTextAreaElement>(null);

  const onSetBestAnswer = useCallback(
    async (answerId: number) => {
      setPendingBestAnswer(true);
      try {
        await api.post(`v1/questions/${initialQuestion.id}/best-answer`, {
          answer_id: answerId,
        });
        setBestAnswerId(answerId);
      } finally {
        setPendingBestAnswer(false);
      }
    },
    [initialQuestion.id]
  );

  const scrollToAnswer = useCallback(() => {
    answerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => answerRef.current?.focus(), 400);
  }, []);

  const clearReplyTarget = useCallback(() => {
    setReplyTarget(null);
    setAnswerSubmitError(null);
  }, []);

  const beginReplyToQuestion = useCallback(() => {
    clearReplyTarget();
    scrollToAnswer();
  }, [clearReplyTarget, scrollToAnswer]);

  const beginReplyToAnswer = useCallback(
    (answerId: number, userFullName: string) => {
      setReplyTarget({ parentAnswerId: answerId, replyToName: userFullName });
      setAnswerText("");
      setAnswerSubmitError(null);
      scrollToAnswer();
    },
    [scrollToAnswer]
  );

  /** Префикс в значении textarea (не уходит на сервер) */
  const replyPrefix = replyTarget ? `${replyTarget.replyToName}, ` : "";
  const answerFieldValue = replyPrefix + answerText;

  useEffect(() => {
    if (!replyTarget) return;
    const p = `${replyTarget.replyToName}, `;
    const id = window.setTimeout(() => {
      const el = answerRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(p.length, p.length);
    }, 450);
    return () => window.clearTimeout(id);
  }, [replyTarget]);

  const handleAnswerChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      if (!replyTarget) {
        setAnswerText(v);
        return;
      }
      if (!v.startsWith(replyPrefix)) {
        clearReplyTarget();
        setAnswerText(v);
        return;
      }
      setAnswerText(v.slice(replyPrefix.length));
    },
    [replyTarget, replyPrefix, clearReplyTarget]
  );

  const clampSelectionPastPrefix = useCallback(
    (e: SyntheticEvent<HTMLTextAreaElement>) => {
      if (!replyTarget) return;
      const el = e.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      if (start >= replyPrefix.length && end >= replyPrefix.length) return;
      const nextStart = Math.max(replyPrefix.length, start);
      const nextEnd = Math.max(replyPrefix.length, end);
      requestAnimationFrame(() => {
        el.setSelectionRange(nextStart, nextEnd);
      });
    },
    [replyTarget, replyPrefix]
  );

  const handleAnswerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!replyTarget) return;
      const el = e.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      if (
        e.key === "Backspace" &&
        start === replyPrefix.length &&
        end === replyPrefix.length &&
        answerText === ""
      ) {
        e.preventDefault();
        clearReplyTarget();
      }
    },
    [replyTarget, replyPrefix, answerText, clearReplyTarget]
  );

  const submitAnswer = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setAnswerSubmitError(null);
      if (!isAuthorized) {
        router.push("/login");
        return;
      }
      const raw = answerText.trim();
      if (!raw) return;
      setAnswerSubmitPending(true);
      try {
        await api.post(`v1/questions/${initialQuestion.id}/answers`, {
          text: raw,
          ...(replyTarget
            ? { parent_id: replyTarget.parentAnswerId }
            : {}),
        });
        setReplyTarget(null);
        setAnswerText("");
        router.refresh();
      } catch (err) {
        const e = err as Error & {
          message?: string;
          errors?: Record<string, string[]>;
        };
        const first =
          e.errors &&
          Object.values(e.errors).find((a) => a?.length)?.[0];
        setAnswerSubmitError(
          first || e.message || "Не удалось отправить ответ"
        );
      } finally {
        setAnswerSubmitPending(false);
      }
    },
    [initialQuestion.id, isAuthorized, replyTarget, router, answerText]
  );

  const regularAnswers = answersData;

  const sortedAnswers = [...regularAnswers].sort((a, b) =>
    sortBy === "rating"
      ? (b.votes_score ?? 0) - (a.votes_score ?? 0)
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const answerVotes = initialQuestion.auth_extra?.answer_votes ?? {};
  const loadMoreAnswers = useCallback(async () => {
    if (answersLoadingMore || answersPage >= answersLastPage) return;
    setAnswersLoadingMore(true);
    try {
      const nextPage = answersPage + 1;
      const data = await api.get<{
        answers: NonNullable<QuestionPageData["answers"]>;
        current_page: number;
        last_page: number;
      }>(
        `v1/questions/${initialQuestion.id}/answers?page=${nextPage}&per_page=${perPage}`
      );
      setAnswersData((prev) => [...prev, ...(data.answers ?? [])]);
      setAnswersPage(data.current_page ?? nextPage);
      setAnswersLastPage(data.last_page ?? answersLastPage);
    } finally {
      setAnswersLoadingMore(false);
    }
  }, [
    answersLoadingMore,
    answersLastPage,
    answersPage,
    initialQuestion.id,
    perPage,
  ]);
  const toggleCategory = (slug: string) => {
    setOpenCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href="/categories" className="breadcrumbs__link">
            Категории вопросов
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <Link
            href={`/categories/${categorySlug}`}
            className="breadcrumbs__link"
          >
            {categoryName}
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{initialQuestion.title}</span>
        </div>
      </div>

      <div className="question_wrapper container">
        {/* Левый сайдбар */}
        <div className="question_left_list">
          <div className="quest_catogories_list">
            <div className="blocks_title">
              <h2>Категории</h2>
            </div>
            {sidebarCategories.map((cat) => (
              <div
                className={`quest_catogory ${openCategories.includes(cat.slug) ? "active_quest_catogory" : ""}`}
                key={cat.slug}
              >
                <div
                  className="quest_catogory_title"
                  onClick={() => toggleCategory(cat.slug)}
                >
                  <div>
                    <svg width="18" height="18">
                      <use xlinkHref={`#${cat.svgIcon}`}></use>
                    </svg>
                    <p>{cat.name}</p>
                  </div>
                  <svg
                    className="quest_catogory_arrow"
                    width="9"
                    height="6"
                    style={{ fill: "rgb(91, 103, 255)" }}
                  >
                    <use xlinkHref="#arrow-down"></use>
                  </svg>
                </div>
                <div className="quest_catogory_content">
                  <div className="subject_item_list">
                    {cat.subcategories.map((subcat, idx) => (
                      <Link
                        href={`/categories/${cat.slug}/${encodeURIComponent(subcat.toLowerCase())}`}
                        key={idx}
                      >
                        <div className="subject_item_list_item">
                          <img
                            src="/images/icons/category-list-item.svg"
                            alt=""
                          />
                          <p>{subcat}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Лидеры проекта */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Лидеры проекта</h2>
            </div>
            {mockUsers.slice(0, 5).map((user) => (
              <Link href={`/profile/${user.id}`} key={user.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <img
                      src={user.avatar || "/images/icons/avatar.svg"}
                      alt=""
                    />
                    <div>
                      <p className="main_text">{user.displayName}</p>
                      <span>
                        {numWord(user.rating, ["балл", "балла", "баллов"])}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Самые активные авторы */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Самые активные авторы</h2>
            </div>
            {mockUsers.slice(3, 8).map((user) => (
              <Link href={`/profile/${user.id}`} key={user.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <img
                      src={user.avatar || "/images/icons/avatar.svg"}
                      alt=""
                    />
                    <div>
                      <p className="main_text">{user.displayName}</p>
                      <span>
                        {numWord(user.rating, ["балл", "балла", "баллов"])}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Основной контент */}
        <div className="questions_page_list">
          <div className="blocks_title questions_page_list_title">
            <h2>Ваш вопрос</h2>
          </div>

          {/* Блок вопроса (данные из API) */}
          <div
            className={`main_question_block main_question_block_item ${(initialQuestion.dislikes_count ?? 0) > (initialQuestion.likes_count ?? 0) ? "answer_negative_rating" : ""}`}
          >
            <div className="main_question_bg_wrapper">
              <div className="main_question_block_top_bg">
                <img
                  src="/images/top-leader-bg.svg"
                  className="top_bg_light"
                  alt=""
                />
                <img
                  src="/images/top-leader-bg-d-2.svg"
                  className="top_bg_dark"
                  alt=""
                />
                <img
                  src="/images/blues-rect.svg"
                  className="top_bg_rect top_bg_rect_light"
                  alt=""
                />
                <img
                  src="/images/blues-rect-dark.svg"
                  className="top_bg_rect top_bg_rect_dark"
                  alt=""
                />
              </div>
            </div>
            <div className="question_list_item-info">
              <div className="question_list_item_left">
                <Link href={`/profile/${initialQuestion.author.id}`}>
                  <img
                    src={
                      initialQuestion.author.avatar_url ||
                      "/images/icons/avatar.svg"
                    }
                    alt=""
                  />
                </Link>
                <div>
                  <Link
                    href={`/profile/${initialQuestion.author.id}`}
                    className="main_text"
                  >
                    {initialQuestion.author.full_name}
                  </Link>
                  <div className="quest_user_title">
                    <span>
                      {initialQuestion.author.level_name ?? "Участник"}
                    </span>
                  </div>
                  <span>{timeAgoText}</span>
                </div>
              </div>
              <div className="question_list_item_right">
                <button
                  type="button"
                  className="s_btn s_btn_icon btn_star_answer btn_star_tooltip"
                  disabled
                  tabIndex={-1}
                  aria-hidden
                >
                  <svg width="15" height="15">
                    <use xlinkHref="#star-best"></use>
                  </svg>
                  <span className="star_tooltip_text">
                    Выбрать как лучший ответ
                  </span>
                </button>
              </div>
            </div>
            <div className="main_question_block_title">
              <h1>{initialQuestion.title}</h1>
            </div>
            <div className="leader_quest question_leader_badge">
              <svg width="12" height="12">
                <use xlinkHref="#trophy"></use>
              </svg>
              <p>Вопрос лидер</p>
            </div>
            <div className="main_question_block_text">
              <p>{initialQuestion.description}</p>
            </div>

            <div className="main_question_block_actions">
              <div className="main_question_block_actions_left">
                <button
                  type="button"
                  className="s_btn s_btn_active answer_to_main_btn"
                  onClick={beginReplyToQuestion}
                >
                  Дать ответ
                </button>
                <div className="question_vote_container">
                  <button
                    className={`vote_btn like_btn ${user_vote === 1 ? "vote_btn--active" : ""}`}
                    title="Мне нравится"
                    onClick={() => vote(1)}
                    disabled={votePending}
                  >
                    <svg width="18" height="18">
                      <use xlinkHref="#thumb-up"></use>
                    </svg>
                    <span className="vote_count">{likes_count}</span>
                  </button>
                  <button
                    className={`vote_btn dislike_btn ${user_vote === -1 ? "vote_btn--active" : ""}`}
                    title="Мне не нравится"
                    onClick={() => vote(-1)}
                    disabled={votePending}
                  >
                    <svg width="18" height="18">
                      <use xlinkHref="#thumb-down"></use>
                    </svg>
                    <span className="vote_count">{dislikes_count}</span>
                  </button>
                </div>
              </div>
              <div className="main_question_block_actions_right">
                <button
                  className="s_btn s_btn_icon btn_action_outline"
                  title="Пожаловаться"
                  onClick={() =>
                    setComplaintModal({ questionId: initialQuestion.id })
                  }
                >
                  Пожаловаться
                </button>
                <button
                  className={`s_btn s_btn_icon btn_action_outline btn-like ${isFavorited(initialQuestion.id) ? "btn-like--active" : ""}`}
                  title="Мне нравится"
                  onClick={() => toggleFavorite(initialQuestion.id)}
                  disabled={isPending(initialQuestion.id)}
                >
                  <svg width="14" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <button
                  className="s_btn s_btn_icon btn_action_outline"
                  title="Поделиться"
                >
                  <svg width="14" height="14">
                    <use xlinkHref="#share"></use>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Лучший ответ */}
          {bestAnswer && (
            <div className="best-comments" style={{ display: "block" }}>
              <div className="blocks_title mt_25px">
                <h2>Лучший ответ</h2>
              </div>
              <AnswerBlock
                answer={{ ...bestAnswer, answers: [] }}
                questionId={initialQuestion.id}
                questionTitle={initialQuestion.title}
                isBest
                onComplaint={(id) => setComplaintModal({ answerId: id })}
                onScrollToAnswer={scrollToAnswer}
                onStartReplyToAnswer={beginReplyToAnswer}
                allowAnswerComments={allowAnswerComments}
                answerVotes={answerVotes}
              />
            </div>
          )}

          {/* Посмотрите все ответы */}
          <div className="blocks_title mt_25px all-questions">
            <div className="blocks_title-inner">
              <h2>Посмотрите все ответы</h2>
              <span className="answers_count_badge">+{totalAnswers}</span>
            </div>
            <div className="questions_filter">
              <button
                className={`s_btn ${sortBy === "rating" ? "s_btn_active" : ""}`}
                onClick={() => setSortBy("rating")}
              >
                <span>По рейтингу</span>
              </button>
              <button
                className={`s_btn ${sortBy === "date" ? "s_btn_active" : ""}`}
                onClick={() => setSortBy("date")}
              >
                <span>По дате</span>
              </button>
            </div>
          </div>

          {/* Список ответов: дерево как раньше — корень + комментарии отдельными карточками со сдвигом */}
          {sortedAnswers.map((answer) => (
            <div key={answer.id}>
              <AnswerWithReplies
                answer={answer}
                questionId={initialQuestion.id}
                questionTitle={initialQuestion.title}
                canSelectBestAnswer={canSelectBestAnswer}
                onSetBestAnswer={onSetBestAnswer}
                pendingBestAnswer={pendingBestAnswer}
                onComplaint={(id) => setComplaintModal({ answerId: id })}
                onScrollToAnswer={scrollToAnswer}
                onStartReplyToAnswer={beginReplyToAnswer}
                allowAnswerComments={allowAnswerComments}
                answerVotes={answerVotes}
              />
            </div>
          ))}
          {answersPage < answersLastPage ? (
            <div className="show_more_btn_wrapper" style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              <button
                className="show_more_btn"
                type="button"
                onClick={loadMoreAnswers}
                disabled={answersLoadingMore}
              >
                <svg width="22" height="22">
                  <use xlinkHref="#sync"></use>
                </svg>
                <span>{answersLoadingMore ? "Загрузка..." : "Загрузить еще"}</span>
              </button>
            </div>
          ) : null}

          {/* Ответить на вопрос / пользователю */}
          <div className="blocks_title mt_25px comments-form__title" id="answer">
            <h2>
              {replyTarget ? (
                <>
                  Ответ пользователю{" "}
                  <span style={{ color: REPLY_NAME_COLOR }}>
                    {replyTarget.replyToName}
                  </span>
                </>
              ) : (
                "Ответить на вопрос"
              )}
            </h2>
          </div>

          <form
            className="ask_question_form form"
            onSubmit={submitAnswer}
          >
            {answerSubmitError ? (
              <p role="alert">{answerSubmitError}</p>
            ) : null}
            <div className="ask_form_item ask_form_item_block_actions">
              <textarea
                ref={answerRef}
                name="message"
                placeholder="Введите текст ответа"
                disabled={answerSubmitPending}
                value={answerFieldValue}
                onChange={handleAnswerChange}
                onKeyDown={handleAnswerKeyDown}
                onSelect={clampSelectionPastPrefix}
                onClick={clampSelectionPastPrefix}
                autoComplete="off"
              />
              <div className="ask_form_item_actions">
                <div>
                  <svg width="15.67" height="13.71">
                    <use xlinkHref="#add-file"></use>
                  </svg>
                  <p>
                    <span>Добавить файл</span>
                    <span>Файл</span>
                  </p>
                </div>
                <div>
                  <svg width="13.71" height="12.73">
                    <use xlinkHref="#add-video"></use>
                  </svg>
                  <p>
                    <span>Добавить видео</span>
                    <span>Видео</span>
                  </p>
                </div>
                <div>
                  <svg width="12.73" height="12.73">
                    <use xlinkHref="#add-link"></use>
                  </svg>
                  <p>
                    <span>Добавить ссылку</span>
                    <span>Ссылка</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="ask_from_send_btn" style={{ marginTop: "15px" }}>
              <button
                type="submit"
                className="m_btn category_btn"
                disabled={answerSubmitPending}
              >
                {answerSubmitPending ? "Отправка…" : "Ответить"}
              </button>
              <p>
                Нажимая на кнопку, вы принимаете условия <br />
                <a href="/privacy">пользовательского соглашения</a>
              </p>
            </div>
          </form>
        </div>

        {/* Правый сайдбар — как в макете: вопросы-лидеры с API */}
        <QuestionLeadersSidebar questionId={initialQuestion.id} />
      </div>

      {/* Не нашли то, что искали? */}
      <div className="container">
        <div className="ask_question">
          <p>Не нашли то, что искали?</p>
          <Link href="/ask" className="ask_question__button">
            Задайте свой вопрос
          </Link>
        </div>
      </div>

      <SimilarQuestionsBlock questionId={initialQuestion.id} />

      <Footer />

      <ComplaintModal
        isOpen={complaintModal != null}
        onClose={() => setComplaintModal(null)}
        questionId={complaintModal?.questionId}
        answerId={complaintModal?.answerId}
      />
    </>
  );
}
