"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchResultCard from "@/components/SearchResultCard";
import AnswerResultCard from "@/components/AnswerResultCard";
import ProfileRelatedQuestionsBlock from "./ProfileRelatedQuestionsBlock";
import ProfileWeeklyLeadersSidebar from "@/components/ProfileWeeklyLeadersSidebar";
import type { ProfileWidgetsPayload } from "@/lib/server-profile-widgets";
import type { UserAnswer } from "@/data/mock-answers";
import { api } from "@/lib/api-client";
import { getToken } from "@/lib/cookies";
import { formatTimeAgo } from "@/lib/time-ago";
import { useAuthStore } from "@/store/authStore";
import ProfileHeaderBlock from "@/components/profile/ProfileHeaderBlock";
import {
  compactCountTitle,
  formatCompactCount,
} from "@/lib/format-compact-count";
import ProfileSharePopup from "@/components/profile/ProfileSharePopup";
import GiftVipModal from "@/components/profile/GiftVipModal";
import type { PublicProfileUser } from "@/types";
import { displayUserName, displayUserSubtitle } from "@/lib/ai-user-display";

type ProfileQuestionItem = {
  id: number;
  title: string;
  created_at: string;
  answers_count: number;
  likes_count: number;
  dislikes_count?: number;
  description?: string;
  votes_count?: number;
  user_vote?: 1 | -1 | null;
  status?: "open" | "opened" | "voting" | "best" | "closed";
  category?: { name?: string; slug?: string; icon_key?: string; svg_icon?: string };
  author: {
    id: number;
    full_name: string;
    avatar_url?: string | null;
    avatar_url_2x?: string | null;
    balls?: number;
  };
  latest_likers: { id: number; avatar_url?: string | null; avatar_url_2x?: string | null }[];
  is_premium?: boolean;
};

type ProfileAnswerItem = {
  id: number;
  text: string;
  created_at: string;
  comments_count: number;
  is_best: boolean;
  likes_count: number;
  dislikes_count: number;
  votes_count: number;
  user_vote?: 1 | -1 | null;
  question: { id: number; title: string } | null;
};

type TabKey = "questions" | "answers";

type QuestionFilter = "all" | "open" | "voting" | "best";
type AnswerFilter = "all" | "best";

function parseTab(s: string | null): TabKey {
  return s === "answers" ? "answers" : "questions";
}

function parseQuestionFilter(s: string | null): QuestionFilter {
  if (s === "open" || s === "voting" || s === "best") return s;
  return "all";
}

function parseAnswerFilter(s: string | null): AnswerFilter {
  return s === "best" ? "best" : "all";
}

function parsePage(s: string | null): number {
  const n = parseInt(s ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

type PublicProfileContentProps = {
  initialUser: PublicProfileUser;
  initialWidgets: ProfileWidgetsPayload;
};

export default function PublicProfileContent({ initialUser, initialWidgets }: PublicProfileContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  const [profile, setProfile] = useState<PublicProfileUser>(initialUser);
  const [followPending, setFollowPending] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGiftVipOpen, setIsGiftVipOpen] = useState(false);
  const premiumProfile = profile as PublicProfileUser & {
    premium_is_active?: boolean;
    premium_package_name?: string | null;
  };
  const isPremiumUser = Boolean(
    (premiumProfile.premium_is_active ?? premiumProfile.is_premium) ||
      profile.vip ||
      (typeof profile.vip_status === "number" ? profile.vip_status > 0 : profile.vip_status),
  );
  const premiumBadgeText = premiumProfile.premium_is_permanent
    ? "Постоянный"
    : premiumProfile.premium_package_name?.trim() || "Премиум";

  const tab = parseTab(searchParams.get("tab"));
  const qFilter = parseQuestionFilter(searchParams.get("qf"));
  const aFilter = parseAnswerFilter(searchParams.get("af"));
  const qPage = parsePage(searchParams.get("qp"));
  const aPage = parsePage(searchParams.get("ap"));

  const [questions, setQuestions] = useState<ProfileQuestionItem[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qLoadingMore, setQLoadingMore] = useState(false);
  const [qLastPage, setQLastPage] = useState(1);

  const [answers, setAnswers] = useState<ProfileAnswerItem[]>([]);
  const [aLoading, setALoading] = useState(false);
  const [aLoadingMore, setALoadingMore] = useState(false);
  const [aLastPage, setALastPage] = useState(1);

  const activeMainTab: TabKey = tab;
  const userId = profile.id;
  const isAiUser = Boolean(profile.is_ai);
  const displayName = displayUserName(profile);
  const rankLabel = displayUserSubtitle(profile);

  const replaceQuery = useCallback(
    (next: Record<string, string | undefined>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === "") p.delete(k);
        else p.set(k, v);
      });
      const qs = p.toString();
      router.replace(qs ? `/profile/${userId}?${qs}` : `/profile/${userId}`, { scroll: false });
    },
    [router, searchParams, userId],
  );

  const fetchQuestions = useCallback(
    async (filter: QuestionFilter, page: number, append: boolean) => {
      if (append) setQLoadingMore(true);
      else setQLoading(true);
      try {
        const params = new URLSearchParams({
          filter,
          page: String(page),
          per_page: "10",
        });
        const data = await api.get<{
          questions: ProfileQuestionItem[];
          current_page: number;
          last_page: number;
        }>(`v1/users/${userId}/questions?${params}`);
        if (append) {
          setQuestions((prev) => [...prev, ...(data.questions ?? [])]);
        } else {
          setQuestions(data.questions ?? []);
        }
        setQLastPage(data.last_page ?? 1);
      } catch {
        if (!append) setQuestions([]);
        setQLastPage(1);
      } finally {
        setQLoading(false);
        setQLoadingMore(false);
      }
    },
    [userId],
  );

  const fetchAnswers = useCallback(
    async (filter: AnswerFilter, page: number, append: boolean) => {
      if (append) setALoadingMore(true);
      else setALoading(true);
      try {
        const params = new URLSearchParams({
          filter,
          page: String(page),
          per_page: "10",
        });
        const data = await api.get<{
          answers: ProfileAnswerItem[];
          current_page: number;
          last_page: number;
        }>(`v1/users/${userId}/answers?${params}`);
        if (append) {
          setAnswers((prev) => [...prev, ...(data.answers ?? [])]);
        } else {
          setAnswers(data.answers ?? []);
        }
        setALastPage(data.last_page ?? 1);
      } catch {
        if (!append) setAnswers([]);
        setALastPage(1);
      } finally {
        setALoading(false);
        setALoadingMore(false);
      }
    },
    [userId],
  );

  const qFetchKey = `${qFilter}-${qPage}`;
  const aFetchKey = `${aFilter}-${aPage}`;
  const prevQKey = useRef("");
  const prevAKey = useRef("");

  useEffect(() => {
    if (activeMainTab !== "questions") return;
    if (prevQKey.current === qFetchKey) return;
    prevQKey.current = qFetchKey;
    const append = qPage > 1;
    fetchQuestions(qFilter, qPage, append);
  }, [activeMainTab, qFetchKey, qFilter, qPage, fetchQuestions]);

  useEffect(() => {
    if (activeMainTab !== "answers") return;
    if (prevAKey.current === aFetchKey) return;
    prevAKey.current = aFetchKey;
    const append = aPage > 1;
    fetchAnswers(aFilter, aPage, append);
  }, [activeMainTab, aFetchKey, aFilter, aPage, fetchAnswers]);

  useEffect(() => {
    setProfile(initialUser);
  }, [initialUser]);

  const kpdPercent = Math.round((profile.kpd ?? 0) * 100);
  const avatarUrl = profile.avatar_url || "/images/icons/avatar.svg";
  const avatarUrl2x = profile.avatar_url_2x ?? null;
  const registeredAgo = profile.created_at
    ? formatTimeAgo(profile.created_at)
    : "только что";
  const registeredInService = registeredAgo.replace(/\s+назад$/, "");
  const isOwnProfile = authUser?.id === profile.id;
  const isBanned = Boolean(profile.is_blocked);
  const ballsRaw = profile.balls ?? 0;
  const ballsDisplay = isAiUser ? "∞" : formatCompactCount(ballsRaw);
  const ballsTitle = isAiUser ? undefined : compactCountTitle(ballsRaw);

  const profileQuestionStatus = (q: ProfileQuestionItem): "opened" | "voting" | "closed" => {
    if (q.status === "voting") return "voting";
    if (q.status === "closed" || q.status === "best") return "closed";
    return "opened";
  };

  const profileQuestionsForCard = useMemo(
    () =>
      questions.map((q) => ({
        id: q.id,
        title: q.title,
        content: q.description || "",
        slug: String(q.id),
        author: {
          id: q.author.id,
          username: String(q.author.id),
          displayName: q.author.full_name,
          email: "",
          avatar: q.author.avatar_url || "/images/icons/avatar.svg",
          avatar2x: q.author.avatar_url_2x ?? undefined,
          bio: "",
          rating: q.author.balls ?? 0,
          balance: 0,
          vipStatus: false,
          followersCount: 0,
          followingsCount: 0,
          questionsCount: 0,
          answersCount: 0,
          createdAt: q.created_at,
          role: "",
        },
        category: {
          id: 0,
          name: q.category?.name || "Без категории",
          slug: q.category?.slug || "",
          description: "",
          svgIcon: q.category?.svg_icon || q.category?.icon_key,
          parent: null,
          children: [],
          questionsCount: 0,
        },
        rating: q.likes_count,
        status: profileQuestionStatus(q),
        commentsCount: q.answers_count,
        createdAt: q.created_at,
        updatedAt: q.created_at,
        is_premium: q.is_premium ?? false,
        votesCount:
          q.votes_count ??
          (q.likes_count ?? 0) + (q.dislikes_count ?? 0),
      })),
    [questions],
  );

  const profileAnswersForCard: UserAnswer[] = useMemo(
    () =>
      answers.map((a) => ({
        id: a.id,
        questionId: a.question?.id ?? 0,
        questionTitle: a.question?.title || "Без заголовка",
        questionSlug: String(a.question?.id ?? 0),
        questionAnswersCount: a.comments_count ?? 0,
        author: {
          id: profile.id,
          username: String(profile.id),
          displayName: displayName,
          email: "",
          avatar: profile.avatar_url || "/images/icons/avatar.svg",
          avatar2x: profile.avatar_url_2x ?? undefined,
          bio: "",
          rating: profile.balls,
          balance: 0,
          vipStatus: false,
          followersCount: 0,
          followingsCount: 0,
          questionsCount: profile.questions_count,
          answersCount: profile.answers_count,
          createdAt: new Date().toISOString(),
          role: profile.level_name || "",
        },
        content: a.text,
        rating: 0,
        isBestAnswer: a.is_best,
        likesCount: a.likes_count ?? 0,
        dislikesCount: a.dislikes_count ?? 0,
        user_vote: a.user_vote ?? null,
        createdAt: a.created_at,
        updatedAt: a.created_at,
      })),
    [answers, displayName, profile],
  );

  const setTab = (t: TabKey) => {
    if (t === activeMainTab) return;
    if (t === "questions") {
      replaceQuery({ tab: undefined, qf: qFilter !== "all" ? qFilter : undefined, qp: qPage > 1 ? String(qPage) : undefined, af: undefined, ap: undefined });
    } else {
      replaceQuery({ tab: "answers", qf: undefined, qp: undefined, af: aFilter !== "all" ? aFilter : undefined, ap: aPage > 1 ? String(aPage) : undefined });
    }
    prevQKey.current = "";
    prevAKey.current = "";
  };

  const setQuestionFilter = (f: QuestionFilter) => {
    prevQKey.current = "";
    replaceQuery({ qf: f === "all" ? undefined : f, qp: undefined });
  };

  const setAnswerFilter = (f: AnswerFilter) => {
    prevAKey.current = "";
    replaceQuery({ tab: "answers", af: f === "all" ? undefined : f, ap: undefined });
  };

  const loadMoreQuestions = () => {
    if (qPage >= qLastPage) return;
    const next = qPage + 1;
    replaceQuery({ qf: qFilter !== "all" ? qFilter : undefined, qp: String(next) });
  };

  const loadMoreAnswers = () => {
    if (aPage >= aLastPage) return;
    const next = aPage + 1;
    replaceQuery({ tab: "answers", af: aFilter !== "all" ? aFilter : undefined, ap: String(next) });
  };

  const toggleSubscribe = async () => {
    if (isOwnProfile) return;
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setFollowPending(true);
    const shouldSubscribe = !profile.subscribed_by_me;
    try {
      if (shouldSubscribe) await api.post(`v1/users/${profile.id}/subscribe`);
      else await api.delete(`v1/users/${profile.id}/subscribe`);
      setProfile((p) => ({ ...p, subscribed_by_me: shouldSubscribe }));
      patchUser({
        subscriptions_count: Math.max(0, (authUser?.subscriptions_count ?? 0) + (shouldSubscribe ? 1 : -1)),
      });
    } finally {
      setFollowPending(false);
    }
  };

  const handleGiftVipClick = () => {
    if (isOwnProfile || isBanned) return;
    if (!getToken()) {
      router.push(`/login?return=${encodeURIComponent(`/profile/${profile.id}`)}`);
      return;
    }
    setIsGiftVipOpen(true);
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isShareOpen && !target.closest(".profile_share_popup") && !target.closest(".profile_stats_action")) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [isShareOpen]);

  const statsBlock = (mobile: boolean) => (
    <div className={`profile_stats ${mobile ? "profile_stats_mobile" : "profile_stats_desktop"}`} style={{ width: "100%", marginBottom: "14px" }}>
      <div className={`profile_stats_list${isBanned ? " banned_opacity" : ""}`}>
        <div
          className={`profile_stats_item ${activeMainTab === "questions" ? "active" : ""}`}
          onClick={() => setTab("questions")}
          style={{ cursor: "pointer" }}
        >
          <p className="main_text">Вопросы</p>
          <div className="stats_badge">
            <p className="main_text" title={compactCountTitle(profile.questions_count)}>
              {formatCompactCount(profile.questions_count)}
            </p>
          </div>
        </div>
        <div
          className={`profile_stats_item ${activeMainTab === "answers" ? "active" : ""}`}
          onClick={() => setTab("answers")}
          style={{ cursor: "pointer" }}
        >
          <p className="main_text">Ответы</p>
          <div className="stats_badge">
            <p className="main_text" title={compactCountTitle(profile.answers_count)}>
              {formatCompactCount(profile.answers_count)}
            </p>
          </div>
        </div>
        {!isOwnProfile && !isBanned && (
          <div className="profile_stats_item profile_stats_action">
            <button
              type="button"
              className="profile_stats_action_inner"
              style={{ border: "none", background: "none", cursor: followPending ? "wait" : "pointer", padding: 0, width: "100%" }}
              disabled={followPending}
              onClick={toggleSubscribe}
            >
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.223 1.27533C13.4346 -0.425109 10.537 -0.425109 8.74859 1.27533L8.5 1.51167L8.25141 1.27533C6.46301 -0.425109 3.56541 -0.425109 1.77701 1.27533C-0.126569 3.08502 -0.126569 6.01498 1.77701 7.82467L8.5 14.2147L15.223 7.82467C17.1266 6.01498 17.1266 3.08502 15.223 1.27533Z"
                  fill="currentColor"
                />
              </svg>
              <p className="main_text">{profile.subscribed_by_me ? "Вы подписаны" : "Подписаться"}</p>
            </button>
          </div>
        )}
        <div
          className="profile_stats_item profile_stats_action"
          style={{ position: "relative", cursor: "pointer" }}
          onClick={(e) => {
            if ((e.target as Element).closest(".profile_share_popup")) return;
            setIsShareOpen(!isShareOpen);
          }}
        >
          <div className="profile_stats_action_inner">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.42 5.7115L12.5718 1.86329C12.2543 1.54577 11.9322 1.38477 11.6146 1.38477C11.1785 1.38477 10.6693 1.71646 10.6693 2.65133V3.96143C7.87342 4.08328 5.2625 5.22989 3.27111 7.22118C1.16191 9.33024 0.000199219 12.1344 0 15.1172C0 15.3315 0.137062 15.5218 0.340332 15.5896C0.392229 15.6069 0.445354 15.6153 0.49798 15.6153C0.651611 15.6153 0.800328 15.544 0.896219 15.4163C3.24763 12.2864 6.78775 10.4367 10.6693 10.2907V11.5806C10.6693 12.5154 11.1785 12.8472 11.6146 12.8472H11.6147C11.9323 12.8472 12.2543 12.6862 12.5718 12.3687L16.42 8.52042C16.794 8.14652 17 7.64774 17 7.11596C17 6.58428 16.794 6.08546 16.42 5.7115Z"
                fill="currentColor"
              />
            </svg>
            <p className="main_text">Поделиться</p>
          </div>
          {isShareOpen ? (
            <ProfileSharePopup
              title={displayName}
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/${userId}`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{displayName}</span>
        </div>
      </div>

      <div className="question_wrapper container" style={{ paddingBottom: "20px", borderBottom: "1px solid #E0E2EF" }}>
        <div className="question_left_list">
          {statsBlock(false)}
          <div className="profile_menu_weekly profile_menu_weekly--sidebar">
            <ProfileWeeklyLeadersSidebar initialWidgets={initialWidgets} />
          </div>
        </div>

        <div
          className={`questions_page_list${isBanned ? " banned_relative banned_opacity" : ""}`}
          style={{ width: "63%", position: "relative" }}
        >
          {isBanned ? (
            <div className="banned_banner" role="note">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M20.9767 22.5053C27.1932 22.5053 32.2326 17.4674 32.2326 11.2527C32.2326 5.03799 27.1932 0 20.9767 0C14.7603 0 9.72093 5.03799 9.72093 11.2527C9.72093 17.4674 14.7603 22.5053 20.9767 22.5053Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M38.6832 25.6643L25.6592 38.6846C25.0595 39.2821 25.0595 40.2559 25.6592 40.8533C26.2567 41.4528 27.2309 41.4528 27.8285 40.8533L40.8525 27.833C41.4521 27.2356 41.4521 26.2617 40.8525 25.6643C40.2549 25.0648 39.2807 25.0648 38.6832 25.6643Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M33.2558 22.5176C27.325 22.5176 22.5116 27.3297 22.5116 33.2588C22.5116 39.1879 27.325 44 33.2558 44C39.1866 44 44 39.1879 44 33.2588C44 27.3297 39.1866 22.5176 33.2558 22.5176ZM33.2558 25.5865C37.4921 25.5865 40.9302 29.0237 40.9302 33.2588C40.9302 37.4939 37.4921 40.9311 33.2558 40.9311C29.0195 40.9311 25.5814 37.4939 25.5814 33.2588C25.5814 29.0237 29.0195 25.5865 33.2558 25.5865Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M23.893 41.9663C21.7667 39.6831 20.4651 36.6223 20.4651 33.2588C20.4651 29.8155 21.8301 26.6872 24.0486 24.3876C23.0458 24.3099 22.0205 24.2689 20.9767 24.2689C14.1782 24.2689 8.15944 25.9691 4.42251 28.5163C1.57172 30.46 0 32.9294 0 35.5216V38.4882C0 39.411 0.366326 40.2968 1.01916 40.9475C1.672 41.6001 2.55609 41.9663 3.47907 41.9663H23.893Z"
                  fill="white"
                />
              </svg>
              <div className="banned_banner_content">
                {profile.block_reason?.trim() ? (
                  <p style={{ margin: 0 }}>{profile.block_reason.trim()}</p>
                ) : (
                  <p style={{ margin: 0 }}>
                    Пользователь заблокирован за нарушение правил использования сервиса. О принципах модерации читайте{" "}
                    <Link href="/about">здесь</Link>.
                  </p>
                )}
              </div>
            </div>
          ) : null}
          <ProfileHeaderBlock
            variant="public"
            premium={isPremiumUser}
            premiumBadgeText={premiumBadgeText}
            displayName={displayName}
            rankLabel={rankLabel}
            registeredInService={registeredInService}
            avatarUrl={avatarUrl}
            avatarUrl2x={avatarUrl2x}
            ballsDisplay={ballsDisplay}
            ballsTitle={ballsTitle}
            kpdPercentDisplay={`${kpdPercent}%`}
          />

          <div className="questions_page_inner">
            {activeMainTab === "questions" ? (
              <div className="questions_filter" style={{ marginTop: "24px", marginBottom: "14px" }}>
                <button
                  type="button"
                  className={`s_btn ${qFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setQuestionFilter("all")}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`s_btn ${qFilter === "open" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setQuestionFilter("open")}
                >
                  Открытые
                </button>
                <button
                  type="button"
                  className={`s_btn ${qFilter === "voting" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setQuestionFilter("voting")}
                >
                  На голосовании
                </button>
                <button
                  type="button"
                  className={`s_btn ${qFilter === "best" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setQuestionFilter("best")}
                >
                  Решенные
                </button>
              </div>
            ) : (
              <div className="questions_filter" style={{ marginTop: "20px", marginBottom: "14px" }}>
                <button
                  type="button"
                  className={`s_btn ${aFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setAnswerFilter("all")}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`s_btn ${aFilter === "best" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setAnswerFilter("best")}
                >
                  Лучшие
                </button>
              </div>
            )}

            <div
              className={
                activeMainTab === "questions" ? "questions_list_profile" : "answers_list_profile"
              }
            >
              {activeMainTab === "questions" ? (
                qLoading ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "#899AB5" }}>Загрузка…</div>
                ) : profileQuestionsForCard.length > 0 ? (
                  profileQuestionsForCard.map((question, index) => (
                    <SearchResultCard
                      key={question.id}
                      question={question}
                      isProfilePage
                      isOwnProfile={isOwnProfile}
                      status={question.status}
                      votesCount={question.votesCount}
                      answersCountOverride={questions[index]?.answers_count ?? 0}
                    />
                  ))
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#899AB5" }}>У этого пользователя пока нет вопросов</div>
                )
              ) : aLoading ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#899AB5" }}>Загрузка…</div>
              ) : profileAnswersForCard.length > 0 ? (
                profileAnswersForCard.map((a) => (
                  <AnswerResultCard
                    key={a.id}
                    answer={a}
                    isBestView={aFilter === "best"}
                    isOwnProfile={isOwnProfile}
                    isPremiumUser={isPremiumUser}
                  showVotes
                  />
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#899AB5" }}>У этого пользователя пока нет ответов</div>
              )}
            </div>

            {activeMainTab === "questions" && qPage < qLastPage && (
              <div className="show_more_btn_wrapper" style={{ display: "flex", justifyContent: "center" }}>
                <button className="show_more_btn" type="button" disabled={qLoadingMore} onClick={loadMoreQuestions}>
                  <svg width="22" height="22">
                    <use xlinkHref="#sync"></use>
                  </svg>
                  <span>{qLoadingMore ? "Загрузка…" : "Загрузить еще"}</span>
                </button>
              </div>
            )}

            {activeMainTab === "answers" && aPage < aLastPage && (
              <div className="show_more_btn_wrapper" style={{ display: "flex", justifyContent: "center" }}>
                <button className="show_more_btn" type="button" disabled={aLoadingMore} onClick={loadMoreAnswers}>
                  <svg width="22" height="22">
                    <use xlinkHref="#sync"></use>
                  </svg>
                  <span>{aLoadingMore ? "Загрузка…" : "Загрузить еще"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="profile_menu_weekly profile_menu_weekly--inline">
            <ProfileWeeklyLeadersSidebar initialWidgets={initialWidgets} />
          </div>

          {statsBlock(true)}
        </div>

        {!isOwnProfile && !isBanned ? (
          <div className={`question_right_list${isBanned ? " banned_opacity" : ""}`}>
            <div className="vip_status_block">
              <div className="vip_icon">
                <img src="/images/vip.svg" alt="VIP" />
              </div>
              <p className="vip_gift_text">Подарить</p>
              <h3 className="vip_title">VIP статус</h3>
              <button type="button" className="vip_button" onClick={handleGiftVipClick}>
                ПОДАРИТЬ
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <GiftVipModal
        isOpen={isGiftVipOpen}
        onClose={() => setIsGiftVipOpen(false)}
        recipientId={profile.id}
        recipientName={displayName}
      />

      <div className="container">
        <div className="ask_question">
          <p>Не нашли то, что искали?</p>
          <Link href="/ask" className="ask_question__button">
            Задайте свой вопрос
          </Link>
        </div>
      </div>

      <ProfileRelatedQuestionsBlock profileUserId={profile.id} />

      <Footer />
    </>
  );
}
