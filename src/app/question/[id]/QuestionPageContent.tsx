"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { formatTimeAgo } from "@/lib/time-ago";
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion";
import { useVoteQuestion } from "@/hooks/useVoteQuestion";
import ComplaintModal from "@/components/ComplaintModal";
import ShareIconsPopup from "@/components/ShareIconsPopup";
import AnswerBlock, { AnswerWithReplies } from "./AnswerBlock";
import SimilarQuestionsBlock from "./SimilarQuestionsBlock";
import QuestionLeadersSidebar from "./QuestionLeadersSidebar";
import TextWithLinks from "@/components/TextWithLinks";
import BodyAttachments from "@/components/BodyAttachments";
import { api } from "@/lib/api-client";
import { getToken } from "@/lib/cookies";
import { useAuthStore } from "@/store/authStore";
import { displayPremiumBadge, displayUserName, displayUserSubtitle } from "@/lib/ai-user-display";
import AnswerLinkUrl from "@/components/AnswerLinkUrl";
import type { ApiCategoryTree } from "@/lib/server-categories";
import type { ProfileWidgetsPayload } from "@/lib/server-profile-widgets";
import type { AnswerAnchorMeta, QuestionPageData } from "@/types";
import { getApiFullUrl } from "@/config/api";
import LinkInputModal from "@/components/LinkInputModal";
import {
  highlightAnswerElement,
  loadCommentPagesForStep,
  parseAnswerAnchorHash,
} from "@/lib/question-answer-tree";

/** Сайдбар, если API категорий недоступен */
const FALLBACK_SIDEBAR_CATEGORIES = [
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

function categorySidebarIcon(
  cat: ApiCategoryTree | (typeof FALLBACK_SIDEBAR_CATEGORIES)[number],
): string {
  if ("icon_key" in cat && cat.icon_key) return cat.icon_key;
  if ("svgIcon" in cat) return (cat as { svgIcon: string }).svgIcon;
  return "business";
}

/** Как префикс «имя,» в цепочке ответов (AnswerBlock) */
const REPLY_NAME_COLOR = "#6069ff";

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

function canAddAttachment(remaining: number | null | undefined): boolean {
  if (remaining === null || remaining === undefined) return true;
  return remaining > 0;
}

export default function QuestionPageContent({
  initialQuestion,
  initialAnchorAnswerId,
  sidebarCategories = [],
  widgets = { weekly_balls_leaders: [], weekly_active_authors: [] },
}: {
  initialQuestion: QuestionPageData;
  initialAnchorAnswerId?: number;
  sidebarCategories?: ApiCategoryTree[];
  widgets?: ProfileWidgetsPayload;
}) {
  const timeAgoText = initialQuestion.best_answer?.best_answer_set_at
    ? "Решено " + formatTimeAgo(initialQuestion.best_answer.best_answer_set_at)
    : formatTimeAgo(initialQuestion.created_at);

  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const canAddFileAttachment = canAddAttachment(user?.attachment_remaining?.file);
  const canAddVideoAttachment = canAddAttachment(user?.attachment_remaining?.video);
  /* п.9 — если категория отсутствует, ведём на /categories вместо /categories/voprosy (404) */
  const categorySlug = initialQuestion.category?.slug ?? "";
  const categoryName = initialQuestion.category?.name ?? "Вопросы";
  const subcategorySlug = initialQuestion.subcategory?.slug ?? "";
  const subcategoryName = initialQuestion.subcategory?.name ?? "";

  const leftSidebarCats =
    sidebarCategories.length > 0
      ? sidebarCategories
      : FALLBACK_SIDEBAR_CATEGORIES;
  const weeklyBalls = widgets.weekly_balls_leaders ?? [];
  const weeklyAuthors = widgets.weekly_active_authors ?? [];
  const isPremiumQuestion = Boolean(initialQuestion.is_premium);
  const isPremiumAuthor = Boolean(
    initialQuestion.author.premium_is_active ??
      initialQuestion.author.is_premium,
  );
  const premiumAuthorText =
    displayPremiumBadge(initialQuestion.author) ?? "Премиум";
  const authorRankLabel =
    displayUserSubtitle(initialQuestion.author) || "Участник";
  const allowAnswerComments = initialQuestion.allow_answer_comments ?? true;

  /** Доп. данные с клиента, если RSC-запрос пришёл без cookie и без auth_extra */
  const [authExtraClient, setAuthExtraClient] = useState<
    QuestionPageData["auth_extra"] | undefined
  >(undefined);
  const authRefetchTried = useRef(false);
  const authExtra = authExtraClient ?? initialQuestion.auth_extra;

  useEffect(() => {
    authRefetchTried.current = false;
  }, [initialQuestion.id]);

  useEffect(() => {
    if (isAuthorized !== 1) return;
    if (initialQuestion.auth_extra !== undefined) return;
    if (authRefetchTried.current) return;
    authRefetchTried.current = true;
    let cancel = false;
    void api
      .get<QuestionPageData>(`v1/questions/${initialQuestion.id}`)
      .then((d) => {
        if (cancel || !d.auth_extra) return;
        setAuthExtraClient(d.auth_extra);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [isAuthorized, initialQuestion.id, initialQuestion.auth_extra]);

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
    user_vote: authExtra?.user_vote ?? null,
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
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const cycleSortDir = (field: "rating" | "date") => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDir("desc");
    } else {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    }
  };

  const SortChevron = ({ direction }: { direction: "desc" | "asc" }) => (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginLeft: 4,
        verticalAlign: "middle",
        transform: direction === "asc" ? "rotate(180deg)" : "none",
        transition: "transform 0.2s ease",
      }}
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const sortArrow = (field: "rating" | "date") => {
    if (sortBy !== field) return null;
    return <SortChevron direction={sortDir} />;
  };
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
  const [answersPage, setAnswersPage] = useState(
    initialQuestion.answers_loaded_page ?? 1
  );
  const [answersLastPage, setAnswersLastPage] = useState(
    Math.max(1, Math.ceil(totalAnswers / perPage))
  );
  const [answersLoadingMore, setAnswersLoadingMore] = useState(false);
  const [answersData, setAnswersData] = useState(apiAnswers);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  /** Только вводимый текст (без «Имя,»); на сервер уходит только он */
  const [answerText, setAnswerText] = useState("");
  const [fileAttachment, setFileAttachment] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [videoAttachment, setVideoAttachment] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [linkAttachment, setLinkAttachment] = useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const answersDataRef = useRef(answersData);
  const answersPageRef = useRef(answersPage);
  const answersLastPageRef = useRef(answersLastPage);
  const anchorHandledRef = useRef<number | null>(null);

  useEffect(() => {
    answersDataRef.current = answersData;
  }, [answersData]);

  useEffect(() => {
    answersPageRef.current = answersPage;
  }, [answersPage]);

  useEffect(() => {
    answersLastPageRef.current = answersLastPage;
  }, [answersLastPage]);

  useEffect(() => {
    if (!allowAnswerComments && replyTarget) {
      setReplyTarget(null);
      setAnswerSubmitError(null);
    }
  }, [allowAnswerComments, replyTarget]);

  useEffect(() => {
    if (isAuthorized === 1) {
      void fetchMe();
    }
  }, [isAuthorized, fetchMe]);

  const hasBestAnswer =
    bestAnswerId != null || initialQuestion.best_answer != null;
  const isQuestionAuthor = authExtra?.is_author ?? false;
  const canSelectBestAnswer = !hasBestAnswer && isQuestionAuthor;

  const answerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    return () => {
      if (fileAttachment?.previewUrl) URL.revokeObjectURL(fileAttachment.previewUrl);
      if (videoAttachment?.previewUrl) URL.revokeObjectURL(videoAttachment.previewUrl);
    };
  }, [fileAttachment, videoAttachment]);

  const onAddFileClick = useCallback(() => {
    if (!canAddFileAttachment) return;
    fileInputRef.current?.click();
  }, [canAddFileAttachment]);

  const onAddVideoClick = useCallback(() => {
    if (!canAddVideoAttachment) return;
    videoInputRef.current?.click();
  }, [canAddVideoAttachment]);

  const onAddLinkClick = useCallback(() => {
    setIsLinkModalOpen(true);
  }, []);

  const onFileSelected = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setAnswerSubmitError(null);
    if (fileAttachment?.previewUrl) URL.revokeObjectURL(fileAttachment.previewUrl);
    setFileAttachment({ file: f, previewUrl: URL.createObjectURL(f) });
  }, [fileAttachment]);

  const onVideoSelected = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setAnswerSubmitError(null);
    if (videoAttachment?.previewUrl) URL.revokeObjectURL(videoAttachment.previewUrl);
    setVideoAttachment({ file: f, previewUrl: URL.createObjectURL(f) });
  }, [videoAttachment]);

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

  const canSubmitAnswer = useMemo(() => {
    const raw = answerText.trim();
    if (!raw) return false;
    if (replyTarget && !allowAnswerComments) return false;
    return true;
  }, [answerText, replyTarget, allowAnswerComments]);

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
      if (replyTarget && !allowAnswerComments) {
        setAnswerSubmitError("Комментарии к ответам отключены автором вопроса.");
        return;
      }
      setAnswerSubmitPending(true);
      try {
        const token = getToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const fd = new FormData();
        fd.append("text", raw);
        if (replyTarget) fd.append("parent_id", String(replyTarget.parentAnswerId));
        if (linkAttachment) fd.append("links", linkAttachment);
        if (fileAttachment?.file) fd.append("file", fileAttachment.file);
        if (videoAttachment?.file) fd.append("video", videoAttachment.file);

        const res = await fetch(getApiFullUrl(`v1/questions/${initialQuestion.id}/answers`), {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: fd,
        });
        const data = (await res.json().catch(() => ({}))) as {
          errors?: Record<string, string[]>;
          message?: string;
        };
        if (!res.ok) {
          const errLists = data.errors ? Object.values(data.errors) : [];
          const firstArr = errLists.find((a) => Array.isArray(a) && a.length > 0) as
            | string[]
            | undefined;
          const first = firstArr?.[0];
          throw new Error(first || data?.message || "Не удалось отправить ответ");
        }
        setReplyTarget(null);
        setAnswerText("");
        setFileAttachment(null);
        setVideoAttachment(null);
        setLinkAttachment(null);
        /* п.30 — сразу подгружаем свежие ответы, чтобы новый ответ был виден без перезагрузки */
        try {
          const freshRes = await fetch(
            getApiFullUrl(
              `v1/questions/${initialQuestion.id}/answers?page=1&per_page=100&sort_by=${sortBy}&sort_dir=${sortDir}`
            ),
            { headers: { Accept: "application/json" } }
          );
          if (freshRes.ok) {
            const freshData = (await freshRes.json()) as { answers?: typeof apiAnswers };
            if (freshData.answers) {
              setAnswersData(freshData.answers);
            }
          }
        } catch {
          /* fallback — хотя бы refresh */
        }
        router.refresh();
      } catch (err) {
        const e = err as Error & {
          message?: string;
          errors?: Record<string, string[]>;
        };
        setAnswerSubmitError(e.message || "Не удалось отправить ответ");
      } finally {
        setAnswerSubmitPending(false);
      }
    },
    [
      initialQuestion.id,
      isAuthorized,
      replyTarget,
      router,
      answerText,
      allowAnswerComments,
      fileAttachment,
      videoAttachment,
      linkAttachment,
      sortBy,
      sortDir,
    ]
  );

  const regularAnswers = answersData;
  const answersSortQuery = `sort_by=${sortBy}&sort_dir=${sortDir}`;
  const sortInitialRef = useRef(true);

  useEffect(() => {
    if (sortInitialRef.current) {
      sortInitialRef.current = false;
      return;
    }
    const reloadSorted = async () => {
      setAnswersLoadingMore(true);
      try {
        const data = await api.get<{
          answers: NonNullable<QuestionPageData["answers"]>;
          current_page: number;
          last_page: number;
        }>(
          `v1/questions/${initialQuestion.id}/answers?page=1&per_page=${perPage}&${answersSortQuery}`
        );
        setAnswersData(data.answers ?? []);
        setAnswersPage(1);
        setAnswersLastPage(data.last_page ?? 1);
      } finally {
        setAnswersLoadingMore(false);
      }
    };
    void reloadSorted();
  }, [sortBy, sortDir, initialQuestion.id, perPage, answersSortQuery]);

  const answerVotes = authExtra?.answer_votes ?? {};
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
        `v1/questions/${initialQuestion.id}/answers?page=${nextPage}&per_page=${perPage}&${answersSortQuery}`
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
    answersSortQuery,
    initialQuestion.id,
    perPage,
  ]);
  const handleShareClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>, title: string, url: string) => {
      const btn = e.currentTarget;
      if (shareButtonRef.current === btn && isShareOpen) {
        setIsShareOpen(false);
        return;
      }
      shareButtonRef.current = btn;
      setShareData({ title, url });
      setIsShareOpen(true);
    },
    [isShareOpen]
  );

  const handleShareQuestion = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      handleShareClick(
        e,
        initialQuestion.title,
        `${typeof window !== "undefined" ? window.location.origin : ""}/question/${initialQuestion.id}`
      );
    },
    [handleShareClick, initialQuestion.id, initialQuestion.title]
  );

  const handleShareAnswer = useCallback(
    (e: MouseEvent<HTMLButtonElement>, answerId: number) => {
      handleShareClick(
        e,
        initialQuestion.title,
        `${typeof window !== "undefined" ? window.location.origin : ""}/question/${initialQuestion.id}#answer-${answerId}`
      );
    },
    [handleShareClick, initialQuestion.id, initialQuestion.title]
  );

  const navigateToAnswerAnchor = useCallback(
    async (answerId: number) => {
      if (anchorHandledRef.current === answerId) return;

      if (await highlightAnswerElement(answerId)) {
        anchorHandledRef.current = answerId;
        return;
      }

      setAnswersLoadingMore(true);
      try {
        let meta: AnswerAnchorMeta | null =
          initialQuestion.anchor_meta?.answer_id === answerId
            ? initialQuestion.anchor_meta
            : null;

        if (!meta) {
          meta = await api.get<AnswerAnchorMeta>(
            `v1/questions/${initialQuestion.id}/answers/anchor?answer_id=${answerId}&per_page=${perPage}&sort_by=${sortBy}&sort_dir=${sortDir}`
          );
        }

        let merged = [...answersDataRef.current];
        let page = answersPageRef.current;
        let lastPage = answersLastPageRef.current;

        while (page < meta.direct_answers_page) {
          page += 1;
          const data = await api.get<{
            answers: NonNullable<QuestionPageData["answers"]>;
            last_page: number;
          }>(
            `v1/questions/${initialQuestion.id}/answers?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_dir=${sortDir}`
          );
          const existingIds = new Set(merged.map((a) => a.id));
          const nextAnswers = (data.answers ?? []).filter((a) => !existingIds.has(a.id));
          merged = [...merged, ...nextAnswers];
          lastPage = data.last_page ?? lastPage;
        }

        const commentSteps = meta.comment_steps ?? [];
        const fetchCommentPage = async (parentId: number, commentPage: number) => {
          const data = await api.get<{
            answers: NonNullable<QuestionPageData["answers"]>;
          }>(
            `v1/questions/${initialQuestion.id}/answers?answer_id=${parentId}&page=${commentPage}&per_page=${perPage}`
          );
          return data.answers ?? [];
        };

        for (const step of commentSteps) {
          merged = await loadCommentPagesForStep(merged, step, perPage, fetchCommentPage);
        }

        setAnswersData(merged);
        setAnswersPage(page);
        setAnswersLastPage(lastPage);

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });

        let attempts = 0;
        const tryHighlight = async () => {
          if (await highlightAnswerElement(answerId)) {
            anchorHandledRef.current = answerId;
            return;
          }
          if (attempts >= 15) return;
          attempts += 1;
          window.setTimeout(() => void tryHighlight(), 50);
        };
        void tryHighlight();
      } finally {
        setAnswersLoadingMore(false);
      }
    },
    [initialQuestion.anchor_meta, initialQuestion.id, perPage, sortBy, sortDir]
  );

  useEffect(() => {
    const run = (answerId: number | null) => {
      if (!answerId) return;
      void navigateToAnswerAnchor(answerId);
    };

    run(initialAnchorAnswerId ?? parseAnswerAnchorHash(window.location.hash));

    const onHashChange = () => {
      anchorHandledRef.current = null;
      run(parseAnswerAnchorHash(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [initialAnchorAnswerId, navigateToAnswerAnchor]);

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
            href={categorySlug ? `/categories/${categorySlug}` : "/categories"}
            className="breadcrumbs__link"
          >
            {categoryName}
          </Link>
          {subcategorySlug ? (
            <>
              <span className="breadcrumbs__sep">•</span>
              <Link
                href={`/categories/${categorySlug}/${subcategorySlug}`}
                className="breadcrumbs__link"
              >
                {subcategoryName}
              </Link>
            </>
          ) : null}
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
            {leftSidebarCats.map((cat) => (
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
                      <use xlinkHref={`#${categorySidebarIcon(cat)}`}></use>
                    </svg>
                    <p title={cat.name}>{cat.name}</p>
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
                    {cat.subcategories.map((subcat, idx) => {
                      const href =
                        typeof subcat === "string"
                          ? `/categories/${cat.slug}/${encodeURIComponent(subcat.toLowerCase())}`
                          : `/categories/${cat.slug}/${subcat.slug}`;
                      const label =
                        typeof subcat === "string" ? subcat : subcat.name;
                      const key =
                        typeof subcat === "object" && "id" in subcat
                          ? subcat.id
                          : idx;
                      return (
                        <Link href={href} key={key}>
                          <span className="subject_item_list_item">
                            <img
                              src="/images/icons/category-list-item.svg"
                              alt=""
                            />
                            <span>{label}</span>
                          </span>
                        </Link>
                      );
                    })}
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
            {weeklyBalls.map((user) => {
              const p = user.premium_is_active ?? user.is_premium ?? false;
              const pt = user.premium_is_permanent
                ? "Постоянный"
                : user.premium_package_name?.trim() || "Премиум";
              return (
              <Link href={`/profile/${user.id}`} key={user.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <UserAvatar
                      src={user.avatar_url}
                      src2x={user.avatar_url_2x}
                      alt=""
                      size={40}
                      premium={p}
                      premiumText={pt}
                    />
                    <div className="question_list_item_left__user_meta">
                      <p className="main_text">{user.full_name}</p>
                      <span>
                        {numWord(user.week_score ?? 0, [
                          "балл",
                          "балла",
                          "баллов",
                        ])}{" "}
                        за неделю
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
            })}
          </div>

          {/* Самые активные авторы */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Самые активные авторы</h2>
            </div>
            {weeklyAuthors.map((user) => {
              const p = user.premium_is_active ?? user.is_premium ?? false;
              const pt = user.premium_is_permanent
                ? "Постоянный"
                : user.premium_package_name?.trim() || "Премиум";
              return (
              <Link href={`/profile/${user.id}`} key={user.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <UserAvatar
                      src={user.avatar_url}
                      src2x={user.avatar_url_2x}
                      alt=""
                      size={40}
                      premium={p}
                      premiumText={pt}
                    />
                    <div className="question_list_item_left__user_meta">
                      <p className="main_text">{user.full_name}</p>
                      <span>
                        {numWord(user.balls ?? 0, ["балл", "балла", "баллов"])}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        </div>

        {/* Основной контент */}
        <div className="questions_page_list">
          <div className="blocks_title questions_page_list_title">
            <h2>Ваш вопрос</h2>
          </div>

          {/* Блок вопроса (данные из API) */}
          <div
            className={`main_question_block main_question_block_item ${isPremiumQuestion ? "premium-question" : ""} ${(initialQuestion.dislikes_count ?? 0) > (initialQuestion.likes_count ?? 0) ? "blocked_question_block" : ""}`}
          >
            {isPremiumQuestion ? (
              <div className="premium_crown_floating" aria-hidden>
                <svg width="38" height="31">
                  <use xlinkHref="#crown-premium" />
                </svg>
              </div>
            ) : null}
            <div className="main_question_bg_wrapper">
              <div className="main_question_block_top_bg">
                <img
                  src={
                    isPremiumQuestion
                      ? "/images/top-leader-bg-d-2.svg"
                      : "/images/top-leader-bg.svg"
                  }
                  className="top_bg_light"
                  alt=""
                />
                <img
                  src="/images/top-leader-bg-d-2.svg"
                  className="top_bg_dark"
                  alt=""
                />
                <img
                  src={
                    isPremiumQuestion
                      ? "/images/blues-rect-dark.svg"
                      : "/images/blues-rect.svg"
                  }
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
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <UserAvatar
                      src={initialQuestion.author.avatar_url}
                      src2x={initialQuestion.author.avatar_url_2x}
                      alt={displayUserName(initialQuestion.author)}
                      size={40}
                      premium={isPremiumAuthor}
                      premiumText={premiumAuthorText}
                    />
                  </div>
                </Link>
                <div className="question_list_item_left__user_meta">
                  <Link
                    href={`/profile/${initialQuestion.author.id}`}
                    className="main_text"
                  >
                    {displayUserName(initialQuestion.author)}
                  </Link>
                  <div className="quest_user_title">
                    <p>{authorRankLabel}</p>
                  </div>
                  <span>{timeAgoText}</span>
                </div>
                <div className="quest_user_title">
                  <p>{authorRankLabel}</p>
                </div>
              </div>
            </div>
            <div className="main_question_block_title">
              <h1>{initialQuestion.title}</h1>
            </div>
            {isPremiumQuestion ? (
              <div className="leader_quest question_leader_badge">
                <svg width="20" height="20" aria-hidden>
                  <use xlinkHref="#crown-premium" />
                </svg>
                <p>Премиум вопрос</p>
              </div>
            ) : null}
            <div className="main_question_block_text">
              <div className="main_question_block_text-body">
                <TextWithLinks text={initialQuestion.description} />
              </div>
              <BodyAttachments
                files={initialQuestion.files}
                videos={initialQuestion.videos}
                links={initialQuestion.links}
              />
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
                  type="button"
                  className="s_btn s_btn_icon btn_action_outline"
                  title="Поделиться"
                  onClick={handleShareQuestion}
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
                onShareClick={handleShareAnswer}
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
              {/* п.22 — кнопки сортировки с 3 состояниями и стрелками */}
              <button
                className={`s_btn ${sortBy === "rating" ? "s_btn_active" : ""}`}
                onClick={() => cycleSortDir("rating")}
              >
                <span>По рейтингу</span>{sortArrow("rating")}
              </button>
              <button
                className={`s_btn ${sortBy === "date" ? "s_btn_active" : ""}`}
                onClick={() => cycleSortDir("date")}
              >
                <span>По дате</span>{sortArrow("date")}
              </button>
            </div>
          </div>

          {/* Список ответов: дерево как раньше — корень + комментарии отдельными карточками со сдвигом */}
          {regularAnswers.map((answer) => (
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
                onShareClick={handleShareAnswer}
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
            <div className="ask_form_item ask_form_item_block_actions">
              {/* п.21 — auto-grow textarea */}
              <textarea
                ref={answerRef}
                name="message"
                placeholder="Введите текст ответа"
                disabled={answerSubmitPending}
                value={answerFieldValue}
                onChange={(e) => {
                  handleAnswerChange(e);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={handleAnswerKeyDown}
                onSelect={clampSelectionPastPrefix}
                onClick={clampSelectionPastPrefix}
                autoComplete="off"
                style={{ overflow: "hidden", resize: "none" }}
              />
              <div className="ask_form_item_actions">
                <div
                  className={!canAddFileAttachment ? "attachment-action-disabled" : undefined}
                  title={!canAddFileAttachment ? "Достигнут лимит публикаций с фото за сутки" : undefined}
                  onClick={onAddFileClick}
                >
                  <svg width="15.67" height="13.71">
                    <use xlinkHref="#add-file"></use>
                  </svg>
                  <p>
                    <span>Добавить файл</span>
                    <span>Файл</span>
                  </p>
                </div>
                <div
                  className={!canAddVideoAttachment ? "attachment-action-disabled" : undefined}
                  title={!canAddVideoAttachment ? "Достигнут лимит публикаций с видео за сутки" : undefined}
                  onClick={onAddVideoClick}
                >
                  <svg width="13.71" height="12.73">
                    <use xlinkHref="#add-video"></use>
                  </svg>
                  <p>
                    <span>Добавить видео</span>
                    <span>Видео</span>
                  </p>
                </div>
                <div onClick={onAddLinkClick}>
                  <svg width="12.73" height="12.73">
                    <use xlinkHref="#add-link"></use>
                  </svg>
                  <p>
                    <span>Добавить ссылку</span>
                    <span>Ссылка</span>
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
                onChange={onFileSelected}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                style={{ display: "none" }}
                onChange={onVideoSelected}
              />

              {(fileAttachment || videoAttachment || linkAttachment) ? (
                <div className="form_attachments_preview">
                  {linkAttachment ? (
                    <div className="form_attachment_link_wrap">
                      <AnswerLinkUrl href={linkAttachment} />
                      <button
                        type="button"
                        className="form_attachment_remove_inline"
                        aria-label="Удалить ссылку"
                        onClick={() => setLinkAttachment(null)}
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                  {(fileAttachment || videoAttachment) ? (
                    <div className="answer_media" style={{ marginTop: 0 }}>
                      {fileAttachment ? (
                        <div className="answer_media_item answer_media_item--image">
                          <img src={fileAttachment.previewUrl} alt="" loading="lazy" decoding="async" />
                          <button
                            type="button"
                            className="form_attachment_remove_overlay"
                            aria-label="Удалить фото"
                            onClick={() => {
                              if (fileAttachment.previewUrl) URL.revokeObjectURL(fileAttachment.previewUrl);
                              setFileAttachment(null);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : null}
                      {videoAttachment ? (
                        <div className="answer_media_item answer_media_item--inline-player answer_media_item--file-video">
                          <video
                            className="answer_media_inline_video"
                            src={videoAttachment.previewUrl}
                            controls
                            playsInline
                            preload="metadata"
                          />
                          <button
                            type="button"
                            className="form_attachment_remove_overlay"
                            aria-label="Удалить видео"
                            onClick={() => {
                              if (videoAttachment.previewUrl) URL.revokeObjectURL(videoAttachment.previewUrl);
                              setVideoAttachment(null);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="ask_from_send_btn" style={{ marginTop: "15px" }}>
              {answerSubmitError ? (
                <p role="alert" className="secondary_text" style={{ color: "#c00", marginBottom: 10 }}>
                  {answerSubmitError}
                </p>
              ) : null}
              <button
                type="submit"
                className="m_btn category_btn"
                disabled={answerSubmitPending || (isAuthorized === 1 && !canSubmitAnswer)}
                title={
                  isAuthorized === 1 && !canSubmitAnswer
                    ? replyTarget && !allowAnswerComments
                      ? "Комментарии к ответам отключены автором вопроса"
                      : "Введите текст ответа"
                    : undefined
                }
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
      <LinkInputModal
        isOpen={isLinkModalOpen}
        initialValue={linkAttachment}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={(url) => setLinkAttachment(url)}
      />
      <ShareIconsPopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        anchorRef={shareButtonRef}
        title={shareData.title}
        url={shareData.url}
      />
    </>
  );
}
