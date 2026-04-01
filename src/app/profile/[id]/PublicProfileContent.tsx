"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchResultCard from "@/components/SearchResultCard";
import AnswerResultCard from "@/components/AnswerResultCard";
import type { UserAnswer } from "@/data/mock-answers";
import { api } from "@/lib/api-client";
import { getToken } from "@/lib/cookies";
import { useAuthStore } from "@/store/authStore";
import type { PublicProfileUser } from "@/types";

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
  author: { id: number; full_name: string; avatar_url?: string | null; balls?: number };
  latest_likers: { id: number; avatar_url?: string | null }[];
};

type ProfileAnswerItem = {
  id: number;
  text: string;
  created_at: string;
  comments_count: number;
  is_best: boolean;
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

const ProfileSharePopup = () => (
  <div className="profile_share_popup">
    <div className="profile_share_popup_title">Поделиться</div>
    <div className="profile_share_popup_subtitle">через</div>
    <div className="profile_share_popup_icons">
      <div className="share_icon_btn vk">
        <svg width="17" height="10" viewBox="0 0 17 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.9098 9.0311C16.8893 8.98536 16.8701 8.94742 16.8522 8.91702C16.5573 8.36934 15.9937 7.6971 15.1617 6.9001L15.1441 6.88185L15.1353 6.8729L15.1264 6.86373H15.1175C14.7399 6.49261 14.5007 6.24307 14.4006 6.11532C14.2174 5.87195 14.1763 5.62561 14.2765 5.37602C14.3472 5.18743 14.613 4.78918 15.0731 4.1807C15.3151 3.85823 15.5068 3.59977 15.6484 3.40506C16.6693 2.00572 17.1119 1.11153 16.9761 0.722125L16.9234 0.631127C16.8879 0.576343 16.7965 0.526225 16.6491 0.480518C16.5014 0.434907 16.3127 0.427364 16.0825 0.45776L13.5334 0.475915C13.4921 0.460829 13.4331 0.462235 13.3563 0.480518C13.2796 0.4988 13.2412 0.507974 13.2412 0.507974L13.1968 0.530827L13.1616 0.558283C13.1321 0.576438 13.0997 0.60837 13.0642 0.654013C13.029 0.699496 12.9995 0.752873 12.9759 0.813699C12.6984 1.54984 12.3829 2.23426 12.0287 2.86693C11.8104 3.24419 11.6099 3.57114 11.4267 3.84797C11.2439 4.1247 11.0904 4.32859 10.9666 4.45929C10.8426 4.59011 10.7307 4.69492 10.6302 4.77409C10.5298 4.85329 10.4532 4.88676 10.4002 4.87452C10.347 4.86228 10.297 4.85013 10.2496 4.83798C10.167 4.7832 10.1006 4.70869 10.0505 4.6144C10.0002 4.52011 9.96639 4.40144 9.94868 4.25847C9.93108 4.1154 9.92066 3.99234 9.91768 3.88888C9.91492 3.78554 9.91619 3.63938 9.92218 3.4508C9.92832 3.26212 9.93108 3.13446 9.93108 3.06753C9.93108 2.83631 9.93545 2.58537 9.94422 2.31464C9.95315 2.04392 9.96037 1.82941 9.96642 1.67139C9.97243 1.51321 9.97522 1.34585 9.97522 1.16941C9.97522 0.992979 9.96481 0.854611 9.94422 0.754184C9.92388 0.653884 9.89266 0.556526 9.85153 0.462139C9.81014 0.367849 9.74956 0.294909 9.67007 0.24313C9.59043 0.191414 9.49141 0.150373 9.37358 0.119881C9.0608 0.0469095 8.66252 0.00743533 8.17856 0.00129845C7.08107 -0.0108474 6.37588 0.0622196 6.06313 0.220404C5.93922 0.287238 5.82709 0.378556 5.72683 0.49407C5.62059 0.627962 5.60577 0.70103 5.68247 0.713048C6.03657 0.767736 6.28724 0.89856 6.43478 1.10539L6.48795 1.21499C6.5293 1.29407 6.5706 1.43407 6.61192 1.63479C6.65319 1.83552 6.67982 2.05757 6.69154 2.3008C6.72099 2.74499 6.72099 3.12522 6.69154 3.44153C6.66199 3.75796 6.63409 4.0043 6.60746 4.18073C6.58083 4.35717 6.54102 4.50014 6.48795 4.60961C6.43478 4.71911 6.39941 4.78605 6.38167 4.81034C6.36397 4.83463 6.34922 4.84994 6.3375 4.85595C6.2608 4.88625 6.18103 4.90169 6.09847 4.90169C6.01579 4.90169 5.91553 4.85905 5.79754 4.77384C5.67958 4.68862 5.55716 4.57157 5.43027 4.4225C5.30338 4.27339 5.16027 4.06503 5.0009 3.79737C4.84164 3.52971 4.6764 3.21338 4.50527 2.84836L4.36369 2.58364C4.27518 2.41334 4.15427 2.16538 4.00085 1.83996C3.84733 1.51442 3.71163 1.19952 3.59367 0.895332C3.54652 0.767576 3.47568 0.670314 3.38128 0.603383L3.33698 0.575927C3.30753 0.551635 3.26025 0.525841 3.19539 0.498353C3.13045 0.470897 3.06268 0.451208 2.99181 0.439094L0.566585 0.457249C0.318758 0.457249 0.150606 0.515133 0.0620652 0.630743L0.0266304 0.685432C0.00892846 0.715892 0 0.76454 0 0.831502C0 0.898432 0.0177019 0.980577 0.0531367 1.07784C0.407175 1.93572 0.792183 2.76308 1.20816 3.56005C1.62414 4.35701 1.98562 4.99898 2.29238 5.48539C2.5992 5.97216 2.91195 6.43156 3.23061 6.86338C3.54928 7.29535 3.76021 7.57219 3.86342 7.6938C3.96674 7.81565 4.04791 7.90674 4.1069 7.96757L4.32822 8.18654C4.46984 8.33258 4.6778 8.50748 4.95219 8.71125C5.22665 8.91514 5.5305 9.11586 5.86389 9.31375C6.19734 9.51131 6.58526 9.67253 7.02787 9.79722C7.47042 9.92203 7.90115 9.97212 8.32014 9.94795H9.33805C9.54449 9.92957 9.70089 9.86265 9.80719 9.74713L9.84241 9.70139C9.8661 9.66508 9.88826 9.60867 9.90872 9.53276C9.92943 9.45672 9.93973 9.37294 9.93973 9.28181C9.93368 9.02026 9.95299 8.78454 9.99714 8.57467C10.0413 8.36486 10.0915 8.20668 10.1478 8.10015C10.204 7.99371 10.2674 7.9039 10.338 7.83108C10.4087 7.75811 10.4592 7.71391 10.4887 7.69869C10.5181 7.68338 10.5416 7.673 10.5593 7.66676C10.7009 7.61812 10.8676 7.66523 11.0595 7.80833C11.2513 7.9513 11.4312 8.12783 11.5995 8.33763C11.7677 8.54763 11.9698 8.78323 12.2058 9.04478C12.4419 9.30643 12.6484 9.50092 12.8253 9.62887L13.0023 9.73837C13.1205 9.81144 13.2739 9.87837 13.4627 9.9392C13.6513 9.99999 13.8164 10.0152 13.9583 9.98481L16.2241 9.94837C16.4482 9.94837 16.6226 9.91011 16.7463 9.8342C16.8702 9.75816 16.9439 9.67438 16.9676 9.58326C16.9913 9.49203 16.9926 9.38854 16.9721 9.27283C16.9511 9.15742 16.9304 9.07671 16.9098 9.0311Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  </div>
);

type PublicProfileContentProps = {
  initialUser: PublicProfileUser;
};

export default function PublicProfileContent({ initialUser }: PublicProfileContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  const [profile, setProfile] = useState<PublicProfileUser>(initialUser);
  const [followPending, setFollowPending] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  /** Серверный fetch без cookie — subscribed_by_me может быть неверным; с токеном подтягиваем с API. */
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api
      .get<{ user: PublicProfileUser }>(`v1/users/${initialUser.id}`)
      .then((data) => {
        if (!cancelled && data?.user) setProfile(data.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialUser.id]);

  const kpdPercent = Math.round((profile.kpd ?? 0) * 100);
  const displayName = profile.full_name || profile.first_name || "Пользователь";
  const isOwnProfile = authUser?.id === profile.id;

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
        likesCount: 0,
        dislikesCount: 0,
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
      <div className="profile_stats_list">
        <div
          className={`profile_stats_item ${activeMainTab === "questions" ? "active" : ""}`}
          onClick={() => setTab("questions")}
          style={{ cursor: "pointer" }}
        >
          <p className="main_text">Вопросы</p>
          <div className="stats_badge">
            <p className="main_text">{profile.questions_count}</p>
          </div>
        </div>
        <div
          className={`profile_stats_item ${activeMainTab === "answers" ? "active" : ""}`}
          onClick={() => setTab("answers")}
          style={{ cursor: "pointer" }}
        >
          <p className="main_text">Ответы</p>
          <div className="stats_badge">
            <p className="main_text">{profile.answers_count}</p>
          </div>
        </div>
        {!isOwnProfile && (
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
          {isShareOpen && <ProfileSharePopup />}
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
        </div>

        <div className="questions_page_list" style={{ width: "63%", position: "relative" }}>
          <div className="main_question_block main_question_block_item profile_question_block" style={{ marginTop: 0, marginBottom: "8px" }}>
            <div className="main_question_bg_wrapper">
              <div className="main_question_block_top_bg">
                <img src="/images/top-leader-bg.svg" className="top_bg_light" alt="" />
                <img src="/images/top-leader-bg-d-2.svg" className="top_bg_dark" alt="" />
                <img src="/images/blues-rect.svg" className="top_bg_rect top_bg_rect_light" alt="" />
                <img src="/images/blues-rect-dark.svg" className="top_bg_rect top_bg_rect_dark" alt="" />
              </div>
            </div>
            <div className="user_profile_block_content" style={{ justifyContent: "space-between", padding: 0 }}>
              <div className="user_profile_block_content_profile">
                <div className="user_profile_img">
                  <img className="user_profile_image" src={profile.avatar_url || "/images/icons/avatar.svg"} alt="" />
                </div>
                <div className="user_profile_block_content_profile_desc">
                  <h4>{displayName}</h4>
                  <div className="user_role_badge">{profile.level_name || "—"}</div>
                </div>
              </div>
              <div className="user_public_stats">
                <div className="stat_item">
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21.453 5.13336L20.9241 3.55937L17.4839 2.98531L15.856 0H14.144L12.5161 2.98531L9.07605 3.55937L8.54695 5.1333L10.981 7.55243L10.4827 10.8926L11.8678 11.8653L15 10.3751L18.1322 11.8653L19.5172 10.8925L19.019 7.55243L21.453 5.13336Z"
                        fill="#5E68FF"
                      />
                      <path d="M28.1836 27.3008V20.9388H20.5664V27.3008H18.8086V16.4075H11.1914V27.3008H9.43359V19.5227H1.81641V27.3008H0V29H30V27.3008H28.1836Z" fill="#5E68FF" />
                    </svg>
                    <div className="stat_info">
                      <div className="stat_value">{(profile.balls ?? 0).toLocaleString()}</div>
                      <div className="stat_label">Балл</div>
                    </div>
                  </div>
                </div>
                <div className="stats_divider" />
                <div className="stat_item">
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <svg width="30" height="19" viewBox="0 0 30 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5.09074 3.68822L10.0901 8.61204C11.2249 7.71796 12.6031 7.13689 14.1211 6.96867V0C10.6641 0.199499 7.5252 1.55531 5.09074 3.68822Z"
                        fill="#5E68FF"
                      />
                      <path
                        d="M3.84791 4.91228C1.49906 7.51274 0 10.9256 0 14.6719C0 15.1503 0.393105 15.5375 0.878906 15.5375H6.21094C6.69674 15.5375 7.08984 15.1503 7.08984 14.6719C7.08984 12.836 7.76467 11.169 8.84725 9.8361L3.84791 4.91228Z"
                        fill="#5E68FF"
                      />
                      <path
                        d="M21.7909 7.90326C21.4948 7.64882 21.0656 7.61587 20.7386 7.82466L13.1109 12.6168C12.0921 13.2576 11.4844 14.3489 11.4844 15.5375C11.4844 17.4471 13.0611 19 15 19C16.363 19 17.6144 18.2138 18.1877 16.9974L22.008 8.91934C22.1729 8.57106 22.0845 8.15683 21.7909 7.90326Z"
                        fill="#5E68FF"
                      />
                      <path
                        d="M26.1521 4.91228L23.5688 7.45654C23.8941 8.14044 23.9369 8.94103 23.6011 9.6505L22.4454 12.0942C22.7429 12.8992 22.9102 13.7644 22.9102 14.6719C22.9102 15.1503 23.3033 15.5375 23.7891 15.5375H29.1211C29.6069 15.5375 30 15.1503 30 14.6719C30 10.9256 28.5009 7.51274 26.1521 4.91228Z"
                        fill="#5E68FF"
                      />
                      <path
                        d="M15.8789 0V6.96867C16.6189 7.05067 17.3239 7.23413 17.9855 7.50068L19.7937 6.36463C20.5181 5.90227 21.4033 5.80307 22.3252 6.23323L24.9093 3.68822C22.4748 1.55531 19.3359 0.199499 15.8789 0Z"
                        fill="#5E68FF"
                      />
                    </svg>
                    <div className="stat_info">
                      <div className="stat_value">{kpdPercent}%</div>
                      <div className="stat_label">
                        КПД
                        <div className="kpd_tooltip_icon">?</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {statsBlock(true)}

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

            <div className="search-results-list" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                      showQuestionVotes
                      likesCount={questions[index]?.likes_count ?? 0}
                      dislikesCount={questions[index]?.dislikes_count ?? 0}
                      userVote={questions[index]?.user_vote ?? null}
                    />
                  ))
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#899AB5" }}>У этого пользователя пока нет вопросов</div>
                )
              ) : aLoading ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#899AB5" }}>Загрузка…</div>
              ) : profileAnswersForCard.length > 0 ? (
                profileAnswersForCard.map((a) => (
                  <AnswerResultCard key={a.id} answer={a} isBestView={aFilter === "best"} isOwnProfile={isOwnProfile} />
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
        </div>

        <div className="question_right_list">
          <div className="vip_status_block">
            <div className="vip_icon">
              <img src="/images/vip.svg" alt="VIP" />
            </div>
            <p className="vip_gift_text">Подарить</p>
            <h3 className="vip_title">VIP статус</h3>
            <button type="button" className="vip_button">
              ПОДАРИТЬ
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="ask_question">
          <p>Не нашли то, что искали?</p>
          <Link href="/ask" className="ask_question__button">
            Задайте свой вопрос
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
