"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SharePopup from "@/components/SharePopup";
import { formatTimeAgo } from "@/lib/time-ago";
import { api } from "@/lib/api-client";
import { getApiFullUrl } from "@/config/api";
import { getToken } from "@/lib/cookies";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import type { MeApiResponse } from "@/lib/server-me";
import type { ProfileWidgetsPayload } from "@/lib/server-profile-widgets";
import { mockUsers } from "@/data/mock-users";
import type { UserAnswer } from "@/data/mock-answers";
import SearchResultCard from "@/components/SearchResultCard";
import AnswerResultCard from "@/components/AnswerResultCard";
import { ProfileLevelsMenuInner, ProfileRulesMenuInner } from "./ProfileLevelsRulesContent";
import ProfileWeeklyLeadersSidebar from "@/components/ProfileWeeklyLeadersSidebar";

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

type ProfileFollowUser = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
  balls?: number;
  created_at?: string | null;
  subscribed_by_me?: boolean;
  questions_count?: number;
  answers_count?: number;
  level_name?: string | null;
};

function numWordFollow(value: number, words: [string, string, string]): string {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index = abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value.toLocaleString("ru-RU")} ${words[index]}`;
}

type ProfileSettings = {
  site: {
    receive_all: boolean;
    new_answer_on_my_question: boolean;
    my_content_liked: boolean;
    new_comment_on_my_answer: boolean;
    balls_balance_changes: boolean;
    sound_enabled: boolean;
    receive_project_news: boolean;
    compact_view: boolean;
    color_theme: "light" | "dark" | "auto";
  };
  notifications: {
    receive_all: boolean;
    new_answer_on_my_question: boolean;
    my_content_liked: boolean;
    new_comment_on_my_answer: boolean;
  };
  general: {
    new_poll_vote_site: boolean;
    new_poll_vote_email: boolean;
  };
};

const defaultSettings: ProfileSettings = {
  site: {
    receive_all: true,
    new_answer_on_my_question: true,
    my_content_liked: true,
    new_comment_on_my_answer: true,
    balls_balance_changes: true,
    sound_enabled: true,
    receive_project_news: true,
    compact_view: false,
    color_theme: "auto",
  },
  notifications: {
    receive_all: true,
    new_answer_on_my_question: true,
    my_content_liked: false,
    new_comment_on_my_answer: true,
  },
  general: {
    new_poll_vote_site: true,
    new_poll_vote_email: false,
  },
};

type ProfilePageClientProps = {
  initialMe: MeApiResponse;
  initialWidgets: ProfileWidgetsPayload;
};

export default function ProfilePageClient({ initialMe, initialWidgets }: ProfilePageClientProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const authUser = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);

  useLayoutEffect(() => {
    hydrateFromMe({
      user: initialMe.user,
      favorite_question_ids: initialMe.favorite_question_ids ?? [],
      favorite_answer_ids: initialMe.favorite_answer_ids ?? [],
      subscribed_user_ids: initialMe.subscribed_user_ids ?? [],
      subscribed_question_ids: initialMe.subscribed_question_ids ?? [],
    });
  }, [initialMe, hydrateFromMe]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const [activeTab, setActiveTab] = useState("menu1");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const BIO_MAX_LENGTH = 250;

  // Мок-данные текущего пользователя (fallback, если в API пусто)
  const user = mockUsers[0];
  const isMyProfile = true;
  const meUser = authUser ?? initialMe.user;
  const initialName = meUser.first_name?.trim() || user.displayName;
  const initialDescription = meUser.description ?? user.bio ?? "";
  const [profileName, setProfileName] = useState(
    () => initialMe.user.first_name?.trim() || user.displayName,
  );
  const [profileDescription, setProfileDescription] = useState(
    () => initialMe.user.description ?? user.bio ?? "",
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const displayName = meUser.first_name?.trim() || user.displayName;
  const avatarUrl = meUser.avatar_url || user.avatar;
  const balls = meUser.balls ?? user.rating;
  const kpdPercent = Math.round((meUser.kpd ?? 0) * 100);
  const nextLevelBalls = meUser.next_level_balls ?? 1000;
  const registeredAt = meUser.created_at ?? user.createdAt;
  const registeredAgo = registeredAt ? formatTimeAgo(registeredAt) : "только что";
  const registeredInService = registeredAgo.replace(/\s+назад$/, "");
  const progress = nextLevelBalls && nextLevelBalls > 0
    ? Math.max(0, Math.min(100, Math.round((balls / nextLevelBalls) * 100)))
    : 100;

  const [questionsFilter, setQuestionsFilter] = useState<"all" | "open" | "voting" | "best">("all");
  const [userQuestions, setUserQuestions] = useState<ProfileQuestionItem[]>(
    () => (initialMe.my_questions ?? []) as ProfileQuestionItem[],
  );
  const [userQuestionsPage, setUserQuestionsPage] = useState(1);
  const [userQuestionsLastPage, setUserQuestionsLastPage] = useState(1);
  const [userQuestionsLoading, setUserQuestionsLoading] = useState(false);
  const [userQuestionsLoadingMore, setUserQuestionsLoadingMore] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const mergedFromMe = {
    site: { ...defaultSettings.site, ...((meUser.settings as { site?: Partial<ProfileSettings["site"]> } | undefined)?.site ?? {}) },
    notifications: { ...defaultSettings.notifications, ...((meUser.settings as { notifications?: Partial<ProfileSettings["notifications"]> } | undefined)?.notifications ?? {}) },
    general: { ...defaultSettings.general, ...((meUser.settings as { general?: Partial<ProfileSettings["general"]> } | undefined)?.general ?? {}) },
  };
  const [settingsDraft, setSettingsDraft] = useState<ProfileSettings>(mergedFromMe);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [answersFilter, setAnswersFilter] = useState<"all" | "best">("all");
  const [subscriptions, setSubscriptions] = useState<ProfileFollowUser[]>([]);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [subscriptionsLastPage, setSubscriptionsLastPage] = useState(1);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsLoadingMore, setSubscriptionsLoadingMore] = useState(false);
  const [subscribers, setSubscribers] = useState<ProfileFollowUser[]>([]);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [subscribersLastPage, setSubscribersLastPage] = useState(1);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersLoadingMore, setSubscribersLoadingMore] = useState(false);
  const [followFilter, setFollowFilter] = useState<"all" | "online" | "vip">("all");
  const [subscriberFilter, setSubscriberFilter] = useState<"all" | "online" | "vip">("all");
  const [followPendingIds, setFollowPendingIds] = useState<number[]>([]);
  const [myAnswers, setMyAnswers] = useState<ProfileAnswerItem[]>([]);
  const [myAnswersPage, setMyAnswersPage] = useState(1);
  const [myAnswersLastPage, setMyAnswersLastPage] = useState(1);
  const [myAnswersLoading, setMyAnswersLoading] = useState(false);
  const [myAnswersLoadingMore, setMyAnswersLoadingMore] = useState(false);

  const fetchMyQuestions = useCallback(
    async (
      filter: "all" | "open" | "voting" | "best",
      page: number,
      append: boolean,
      opts?: { isInitialSync?: boolean },
    ) => {
      if (append) {
        setUserQuestionsLoadingMore(true);
      } else {
        setUserQuestionsLoading(true);
        if (!opts?.isInitialSync) {
          setUserQuestions([]);
        }
      }
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
        }>(`v1/me/my-questions?${params}`);
        if (append) {
          setUserQuestions((prev) => [...prev, ...(data.questions ?? [])]);
        } else {
          setUserQuestions(data.questions ?? []);
        }
        setUserQuestionsPage(data.current_page ?? 1);
        setUserQuestionsLastPage(data.last_page ?? 1);
      } catch {
        if (!append) {
          setUserQuestions([]);
          setUserQuestionsPage(1);
          setUserQuestionsLastPage(1);
        }
      } finally {
        setUserQuestionsLoading(false);
        setUserQuestionsLoadingMore(false);
      }
    },
    [],
  );

  /** Если в /me пришло 5 превью — подгружаем первую страницу списка (корректная пагинация), без повторного /me */
  useEffect(() => {
    if ((initialMe.my_questions?.length ?? 0) >= 5) {
      void fetchMyQuestions("all", 1, false, { isInitialSync: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при монтировании
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    setProfileName(initialName);
    setProfileDescription(initialDescription);
  }, [initialName, initialDescription]);

  useEffect(() => {
    setSettingsDraft(mergedFromMe);
  }, [meUser.settings]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setProfileSaving(true);
    try {
      await api.post<{ user?: { first_name?: string; description?: string | null } }>(
        "v1/me/profile",
        {
          first_name: profileName.trim(),
          description: profileDescription.trim() || null,
        },
      );
      patchUser({
        first_name: profileName.trim(),
        description: profileDescription.trim() || null,
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Обработчик клика по кнопке "Поделиться"
  const handleShareClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, title: string, questionId: number) => {
      const btn = e.currentTarget;
      if (shareButtonRef.current === btn && isShareOpen) {
        setIsShareOpen(false);
        return;
      }
      shareButtonRef.current = btn;
      setShareData({
        title,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/question/${questionId}`,
      });
      setIsShareOpen(true);
    },
    [isShareOpen],
  );

  const handleAvatarPick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const fd = new FormData();
    fd.append("avatar", file);
    setAvatarUploading(true);
    try {
      const res = await fetch(getApiFullUrl("v1/me/avatar"), {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message || "Ошибка загрузки аватара");
      const nextAvatar = (data as { avatar_url?: string }).avatar_url;
      if (nextAvatar) patchUser({ avatar_url: nextAvatar });
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }, [patchUser, router]);

  const handleSettingsSave = useCallback(async () => {
    setSettingsSaving(true);
    try {
      await api.put("v1/me/settings", { settings: settingsDraft });
      patchUser({ settings: settingsDraft });
    } finally {
      setSettingsSaving(false);
    }
  }, [settingsDraft, patchUser]);

  const handleSettingsCancel = useCallback(() => {
    setSettingsDraft(mergedFromMe);
  }, [mergedFromMe]);

  const fetchMyAnswers = useCallback(
    async (filter: "all" | "best", page: number, append: boolean) => {
      if (append) {
        setMyAnswersLoadingMore(true);
      } else {
        setMyAnswersLoading(true);
        setMyAnswers([]);
      }
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
        }>(`v1/me/my-answers?${params}`);
        setMyAnswers((prev) => (append ? [...prev, ...(data.answers ?? [])] : (data.answers ?? [])));
        setMyAnswersPage(data.current_page ?? 1);
        setMyAnswersLastPage(data.last_page ?? 1);
      } catch {
        if (!append) {
          setMyAnswers([]);
          setMyAnswersPage(1);
          setMyAnswersLastPage(1);
        }
      } finally {
        setMyAnswersLoading(false);
        setMyAnswersLoadingMore(false);
      }
    },
    [],
  );

  const fetchSubscriptions = useCallback(async (page: number, append: boolean) => {
    if (append) {
      setSubscriptionsLoadingMore(true);
    } else {
      setSubscriptionsLoading(true);
      setSubscriptions([]);
    }
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
        filter: followFilter,
      });
      const data = await api.get<{
        subscriptions: ProfileFollowUser[];
        current_page: number;
        last_page: number;
      }>(`v1/me/subscriptions?${params}`);
      setSubscriptions((prev) => (append ? [...prev, ...(data.subscriptions ?? [])] : (data.subscriptions ?? [])));
      setSubscriptionsPage(data.current_page ?? 1);
      setSubscriptionsLastPage(data.last_page ?? 1);
    } finally {
      setSubscriptionsLoading(false);
      setSubscriptionsLoadingMore(false);
    }
  }, [followFilter]);

  const fetchSubscribers = useCallback(async (page: number, append: boolean) => {
    if (append) {
      setSubscribersLoadingMore(true);
    } else {
      setSubscribersLoading(true);
      setSubscribers([]);
    }
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
        filter: subscriberFilter,
      });
      const data = await api.get<{
        subscribers: ProfileFollowUser[];
        current_page: number;
        last_page: number;
      }>(`v1/me/subscribers?${params}`);
      setSubscribers((prev) => (append ? [...prev, ...(data.subscribers ?? [])] : (data.subscribers ?? [])));
      setSubscribersPage(data.current_page ?? 1);
      setSubscribersLastPage(data.last_page ?? 1);
    } finally {
      setSubscribersLoading(false);
      setSubscribersLoadingMore(false);
    }
  }, [subscriberFilter]);

  const toggleFollow = useCallback(async (targetId: number, shouldSubscribe: boolean) => {
    setFollowPendingIds((prev) => [...prev, targetId]);
    try {
      if (shouldSubscribe) await api.post(`v1/users/${targetId}/subscribe`);
      else await api.delete(`v1/users/${targetId}/subscribe`);
      setSubscriptions((prev) => (shouldSubscribe ? prev : prev.filter((u) => u.id !== targetId)));
      setSubscribers((prev) => prev.map((u) => (u.id === targetId ? { ...u, subscribed_by_me: shouldSubscribe } : u)));
      patchUser({
        subscriptions_count: Math.max(0, (meUser.subscriptions_count ?? 0) + (shouldSubscribe ? 1 : -1)),
      });
    } finally {
      setFollowPendingIds((prev) => prev.filter((id) => id !== targetId));
    }
  }, [patchUser, meUser.subscriptions_count]);

  useEffect(() => {
    if (activeTab !== "menu_answers") return;
    if (myAnswers.length > 0) return;
    fetchMyAnswers(answersFilter, 1, false);
  }, [activeTab, myAnswers.length, answersFilter, fetchMyAnswers]);

  useEffect(() => {
    if (activeTab !== "menu_subscriptions") return;
    void fetchSubscriptions(1, false);
  }, [activeTab, followFilter, fetchSubscriptions]);

  useEffect(() => {
    if (activeTab !== "menu_subscribers") return;
    void fetchSubscribers(1, false);
  }, [activeTab, subscriberFilter, fetchSubscribers]);

  const profileQuestionStatus = (q: ProfileQuestionItem): "opened" | "voting" | "closed" => {
    if (q.status === "voting") return "voting";
    if (q.status === "closed" || q.status === "best") return "closed";
    if (questionsFilter === "voting") return "voting";
    if (questionsFilter === "best") return "closed";
    return "opened";
  };

  const profileQuestionsForCard = userQuestions.map((q) => ({
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
  }));

  const profileAnswersForCard: UserAnswer[] = myAnswers.map((a) => ({
    id: a.id,
    questionId: a.question?.id ?? 0,
    questionTitle: a.question?.title || "Без заголовка",
    questionSlug: String(a.question?.id ?? 0),
    questionAnswersCount: a.comments_count ?? 0,
    author: {
      id: meUser.id ?? user.id,
      username: String(meUser.id ?? user.id),
      displayName: displayName,
      email: meUser.email || "",
      avatar: avatarUrl || "/images/icons/avatar.svg",
      bio: meUser.description || "",
      rating: balls,
      balance: 0,
      vipStatus: false,
      followersCount: 0,
      followingsCount: 0,
      questionsCount: meUser.questions_count ?? 0,
      answersCount: meUser.answers_count ?? 0,
      createdAt: registeredAt || new Date().toISOString(),
      role: meUser.level_name || "",
    },
    content: a.text,
    rating: 0,
    isBestAnswer: a.is_best,
    likesCount: 0,
    dislikesCount: 0,
    createdAt: a.created_at,
    updatedAt: a.created_at,
  }));

  const renderUserFollowCard = (u: ProfileFollowUser, isSubscriberView: boolean) => {
    const tenure = u.created_at ? formatTimeAgo(u.created_at).replace(/\s+назад$/, "") : "недавно";
    const qCount = u.questions_count ?? 0;
    const aCount = u.answers_count ?? 0;
    const ballsLine = numWordFollow(u.balls ?? 0, ["балл", "балла", "баллов"]);
    const showSubscribe = isSubscriberView && !u.subscribed_by_me;
    return (
      <div className="user-follow-card" key={u.id}>
        <div className="user-follow-left">
          <Link href={`/profile/${u.id}`}>
            <img src={u.avatar_url || "/images/icons/avatar.svg"} alt={u.full_name} className="user-follow-avatar" />
          </Link>
          <div className="user-follow-info">
            <Link href={`/profile/${u.id}`} className="user-follow-name">
              {u.full_name || "Пользователь"}
            </Link>
            <span className="user-follow-time">В сервисе {tenure}</span>
          </div>
        </div>

        <div className="user-follow-stats-row">
          <div className="user-follow-separator" aria-hidden />
          <div className="user-follow-stat">
            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M15.7322 3.71726L15.3443 2.57747L12.8215 2.16178L11.6277 0H10.3723L9.17847 2.16178L6.65577 2.57747L6.26777 3.71722L8.05273 5.469L7.68732 7.88775L8.70306 8.59211L11 7.51298L13.297 8.59211L14.3126 7.8877L13.9473 5.469L15.7322 3.71726Z"
                fill="#5E68FF"
              />
              <path
                d="M20.668 19.7695V15.1626H15.082V19.7695H13.793V11.8813H8.20703V19.7695H6.91797V14.1372H1.33203V19.7695H0V21H22V19.7695H20.668Z"
                fill="#5E68FF"
              />
            </svg>
            <span className="user-follow-stat-bold">{ballsLine}</span>
          </div>
          <div className="user-follow-separator" aria-hidden />
          <div className="user-follow-stat">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M10.8182 0H3.18182C2.33826 0.00101045 1.52954 0.336559 0.933049 0.933043C0.336561 1.52953 0.00101045 2.33824 0 3.1818V8.27267C0.000925606 9.00589 0.254603 9.71637 0.718275 10.2844C1.18195 10.8524 1.82726 11.2431 2.54545 11.3908V13.3635C2.54544 13.4788 2.5767 13.5918 2.6359 13.6906C2.6951 13.7895 2.78002 13.8704 2.8816 13.9247C2.98319 13.9791 3.09762 14.0048 3.21269 13.9993C3.32777 13.9937 3.43916 13.9569 3.535 13.893L7.19091 11.4545H10.8182C11.6617 11.4535 12.4705 11.1179 13.067 10.5214C13.6634 9.92494 13.999 9.11623 14 8.27267V3.1818C13.999 2.33824 13.6634 1.52953 13.067 0.933043C12.4705 0.336559 11.6617 0.00101045 10.8182 0ZM9.54545 7.63631H4.45455C4.28577 7.63631 4.12391 7.56927 4.00457 7.44993C3.88523 7.33059 3.81818 7.16873 3.81818 6.99995C3.81818 6.83118 3.88523 6.66932 4.00457 6.54998C4.12391 6.43064 4.28577 6.36359 4.45455 6.36359H9.54545C9.71423 6.36359 9.87609 6.43064 9.99543 6.54998C10.1148 6.66932 10.1818 6.83118 10.1818 6.99995C10.1818 7.16873 10.1148 7.33059 9.99543 7.44993C9.87609 7.56927 9.71423 7.63631 9.54545 7.63631ZM10.8182 5.09087H3.18182C3.01304 5.09087 2.85118 5.02383 2.73184 4.90449C2.6125 4.78515 2.54545 4.62329 2.54545 4.45452C2.54545 4.28574 2.6125 4.12388 2.73184 4.00454C2.85118 3.8852 3.01304 3.81816 3.18182 3.81816H10.8182C10.987 3.81816 11.1488 3.8852 11.2682 4.00454C11.3875 4.12388 11.4545 4.28574 11.4545 4.45452C11.4545 4.62329 11.3875 4.78515 11.2682 4.90449C11.1488 5.02383 10.987 5.09087 10.8182 5.09087Z"
                fill="#6069FF"
              />
            </svg>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              <span className="user-follow-stat-gray">{qCount.toLocaleString("ru-RU")}</span>
              <span className="user-follow-stat-gray">вопросов</span>
            </div>
          </div>
          <div className="user-follow-separator" aria-hidden />
          <div className="user-follow-stat">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M10.8182 0H3.18182C2.33826 0.00101045 1.52954 0.336559 0.933049 0.933043C0.336561 1.52953 0.00101045 2.33824 0 3.1818V8.27267C0.000925606 9.00589 0.254603 9.71637 0.718275 10.2844C1.18195 10.8524 1.82726 11.2431 2.54545 11.3908V13.3635C2.54544 13.4788 2.5767 13.5918 2.6359 13.6906C2.6951 13.7895 2.78002 13.8704 2.8816 13.9247C2.98319 13.9791 3.09762 14.0048 3.21269 13.9993C3.32777 13.9937 3.43916 13.9569 3.535 13.893L7.19091 11.4545H10.8182C11.6617 11.4535 12.4705 11.1179 13.067 10.5214C13.6634 9.92494 13.999 9.11623 14 8.27267V3.1818C13.999 2.33824 13.6634 1.52953 13.067 0.933043C12.4705 0.336559 11.6617 0.00101045 10.8182 0ZM9.54545 7.63631H4.45455C4.28577 7.63631 4.12391 7.56927 4.00457 7.44993C3.88523 7.33059 3.81818 7.16873 3.81818 6.99995C3.81818 6.83118 3.88523 6.66932 4.00457 6.54998C4.12391 6.43064 4.28577 6.36359 4.45455 6.36359H9.54545C9.71423 6.36359 9.87609 6.43064 9.99543 6.54998C10.1148 6.66932 10.1818 6.83118 10.1818 6.99995C10.1818 7.16873 10.1148 7.33059 9.99543 7.44993C9.87609 7.56927 9.71423 7.63631 9.54545 7.63631ZM10.8182 5.09087H3.18182C3.01304 5.09087 2.85118 5.02383 2.73184 4.90449C2.6125 4.78515 2.54545 4.62329 2.54545 4.45452C2.54545 4.28574 2.6125 4.12388 2.73184 4.00454C2.85118 3.8852 3.01304 3.81816 3.18182 3.81816H10.8182C10.987 3.81816 11.1488 3.8852 11.2682 4.00454C11.3875 4.12388 11.4545 4.28574 11.4545 4.45452C11.4545 4.62329 11.3875 4.78515 11.2682 4.90449C11.1488 5.02383 10.987 5.09087 10.8182 5.09087Z"
                fill="#6069FF"
              />
            </svg>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              <span className="user-follow-stat-gray">{aCount.toLocaleString("ru-RU")}</span>
              <span className="user-follow-stat-gray">ответов</span>
            </div>
          </div>
        </div>

        <div className="user-follow-right">
          {showSubscribe ? (
            <button
              type="button"
              className="user-follow-btn subscribe-btn"
              style={{ minWidth: "140px" }}
              disabled={followPendingIds.includes(u.id)}
              onClick={() => toggleFollow(u.id, true)}
            >
              Подписаться
            </button>
          ) : (
            <button
              type="button"
              className="user-follow-btn subscribed-btn"
              style={{ minWidth: "140px" }}
              disabled={followPendingIds.includes(u.id)}
              onClick={() => toggleFollow(u.id, false)}
            >
              Вы подписаны
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="profile_page_layout">
      <Header />

      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <span className="breadcrumbs__current">Профиль</span>
        </div>

        {/* profile page */}
        <div className="profile_page">
          <div className="profile_menu_column">
          <div className="profile_menu">
            <div className="blocks_title">
              <h2>Ваш профиль</h2>
            </div>
            <div className="profile_menu_list tabs_list">
              {isMyProfile && (
                <>
                  <div
                    className={`profile_menu_item menu_item profile-edit-btn ${activeTab === "menu2" ? "active_menu" : ""}`}
                    data-id="menu2"
                    onClick={() => handleTabClick("menu2")}
                  >
                    <svg width="15.714844" height="20.000000">
                      <use xlinkHref="#profile"></use>
                    </svg>
                    <p className="main_text">Редактировать профиль</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                    data-id="menu_levels"
                    onClick={() => handleTabClick("menu_levels")}
                  >
                    <svg width="13" height="20">
                      <use xlinkHref="#levels"></use>
                    </svg>
                    <p className="main_text">Уровни</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                    data-id="menu_rules"
                    onClick={() => handleTabClick("menu_rules")}
                  >
                    <svg width="20" height="17">
                      <use xlinkHref="#rules"></use>
                    </svg>
                    <p className="main_text">Ограничения</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_vip" ? "active_menu" : ""}`}
                    data-id="menu_vip"
                    onClick={() => handleTabClick("menu_vip")}
                  >
                    <svg width="16" height="20">
                      <use xlinkHref="#vip"></use>
                    </svg>
                    <p className="main_text">VIP - статус</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu4" ? "active_menu" : ""}`}
                    data-id="menu4"
                    onClick={() => handleTabClick("menu4")}
                  >
                    <svg width="20.000000" height="20.000000">
                      <use xlinkHref="#settings"></use>
                    </svg>
                    <p className="main_text">Настройки</p>
                  </div>
                  <div
                    className="profile_menu_item menu_item"
                    onClick={handleLogout}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                  >
                    <img src="/images/icons/logout.svg" alt="" width="20" height="20" />
                    <p className="main_text">Выход</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="profile_menu_weekly">
            <ProfileWeeklyLeadersSidebar initialWidgets={initialWidgets} />
          </div>
          </div>

          <div className="profile_page_content">
            <div className="user_profile_block">
              <img
                className="user_profile_block_bg"
                src="/images/user-profile-bg.svg"
                alt=""
              />
              <img
                className="user_profile_block_bg_dark"
                src="/images/user-profile-bg-d.svg"
                alt=""
              />
              <img
                className="user_profile_block_rect"
                src="/images/main-rect.svg"
                alt=""
              />
              <div className="user_profile_block_content">
                <div className="user_profile_block_content_profile">
                  <div className="user_profile_img">
                    <img
                      className="user_profile_image"
                      src={avatarUrl}
                      alt=""
                    />
                    <button
                      className="user_profile_img_action"
                      title="Редактировать аватар"
                      type="button"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <svg width="11" height="11">
                        <use xlinkHref="#pencil-edit"></use>
                      </svg>
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      style={{ display: "none" }}
                      onChange={handleAvatarPick}
                    />
                  </div>
                  <div className="user_profile_block_content_profile_desc">
                    <h4>{displayName}</h4>
                    <p>В сервисе {registeredInService}</p>
                  </div>
                </div>
                <div className="user_public_stats">
                  <div className="stat_item">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <svg
                        width="30"
                        height="29"
                        viewBox="0 0 30 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.453 5.13336L20.9241 3.55937L17.4839 2.98531L15.856 0H14.144L12.5161 2.98531L9.07605 3.55937L8.54695 5.1333L10.981 7.55243L10.4827 10.8926L11.8678 11.8653L15 10.3751L18.1322 11.8653L19.5172 10.8925L19.019 7.55243L21.453 5.13336Z"
                          fill="#5E68FF"
                        />
                        <path
                          d="M28.1836 27.3008V20.9388H20.5664V27.3008H18.8086V16.4075H11.1914V27.3008H9.43359V19.5227H1.81641V27.3008H0V29H30V27.3008H28.1836Z"
                          fill="#5E68FF"
                        />
                      </svg>
                      <div className="stat_info">
                        <div className="stat_value">{balls}</div>
                        <div className="stat_label">Балл</div>
                      </div>
                    </div>
                  </div>
                  <div className="stats_divider"></div>
                  <div className="stat_item">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <svg
                        width="30"
                        height="19"
                        viewBox="0 0 30 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
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

              {/* Мобильное меню табов */}
              <div className="profile_menu_list_mob tabs_list_m">
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu2" ? "active_menu" : ""}`}
                  data-id="menu2"
                  onClick={() => handleTabClick("menu2")}
                >
                  <svg width="15.714844" height="20.000000">
                    <use xlinkHref="#profile"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                  data-id="menu_levels"
                  onClick={() => handleTabClick("menu_levels")}
                >
                  <svg width="13" height="20">
                    <use xlinkHref="#levels"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                  data-id="menu_rules"
                  onClick={() => handleTabClick("menu_rules")}
                >
                  <svg width="20" height="17">
                    <use xlinkHref="#rules"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu_vip" ? "active_menu" : ""}`}
                  data-id="menu_vip"
                  onClick={() => handleTabClick("menu_vip")}
                >
                  <svg width="16" height="20">
                    <use xlinkHref="#vip"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu4" ? "active_menu" : ""}`}
                  data-id="menu4"
                  onClick={() => handleTabClick("menu4")}
                >
                  <svg width="20" height="20">
                    <use xlinkHref="#settings"></use>
                  </svg>
                </div>
                <div
                  className="profile_menu_item menu_item_m"
                  onClick={handleLogout}
                  role="button"
                  title="Выход"
                >
                  <img src="/images/icons/logout.svg" alt="" width="20" height="20" />
                </div>
              </div>
            </div>

            <div className="user_profile_pages">
              {/* Таб 1: Вопросы пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_1 ${activeTab === "menu1" ? "active_menu" : ""}`}
                id="menu1"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter">
                    <button
                      className={`s_btn ${questionsFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      type="button"
                      onClick={() => {
                        setQuestionsFilter("all");
                        fetchMyQuestions("all", 1, false);
                      }}
                    >
                      Все
                    </button>
                    <button
                      className={`s_btn ${questionsFilter === "open" ? "s_btn_active questions_filter_active" : ""}`}
                      type="button"
                      onClick={() => {
                        setQuestionsFilter("open");
                        fetchMyQuestions("open", 1, false);
                      }}
                    >
                      Открытые
                    </button>
                    <button
                      className={`s_btn ${questionsFilter === "voting" ? "s_btn_active questions_filter_active" : ""}`}
                      type="button"
                      onClick={() => {
                        setQuestionsFilter("voting");
                        fetchMyQuestions("voting", 1, false);
                      }}
                    >
                      На голосовании
                    </button>
                    <button
                      className={`s_btn ${questionsFilter === "best" ? "s_btn_active questions_filter_active" : ""}`}
                      type="button"
                      onClick={() => {
                        setQuestionsFilter("best");
                        fetchMyQuestions("best", 1, false);
                      }}
                    >
                      Лучшие
                    </button>
                  </div>

                  {userQuestionsLoading && !userQuestionsLoadingMore && userQuestions.length === 0 ? (
                    <p className="secondary_text" style={{ textAlign: "center", padding: "48px 0" }}>
                      Загрузка…
                    </p>
                  ) : userQuestions.length > 0 ? (
                    <div style={{ position: "relative" }}>
                      <div
                        className="questions_list_profile"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        {profileQuestionsForCard.map((question, index) => (
                          <SearchResultCard
                            key={question.id}
                            question={question}
                            isProfilePage={true}
                            status={question.status as "opened" | "voting" | "closed"}
                            votesCount={question.votesCount}
                            isOwnProfile={true}
                            answersCountOverride={userQuestions[index]?.answers_count ?? 0}
                          />
                        ))}
                      </div>
                      {userQuestionsLoading && !userQuestionsLoadingMore ? (
                        <div
                          className="secondary_text"
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.82)",
                            borderRadius: "8px",
                          }}
                        >
                          Загрузка…
                        </div>
                      ) : null}
                      {userQuestionsPage < userQuestionsLastPage ? (
                        <div
                          className="show_more_btn_wrapper"
                          style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}
                        >
                          <button
                            className="show_more_btn"
                            type="button"
                            onClick={() => fetchMyQuestions(questionsFilter, userQuestionsPage + 1, true)}
                            disabled={userQuestionsLoadingMore}
                          >
                            <svg width="22" height="22">
                              <use xlinkHref="#sync"></use>
                            </svg>
                            <span>{userQuestionsLoadingMore ? "Загрузка…" : "Загрузить еще"}</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : !userQuestionsLoading ? (
                    <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
                      Вопросов пока нет
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Таб: Ответы пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_answers ${activeTab === "menu_answers" ? "active_menu" : ""}`}
                id="menu_answers"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter" style={{ marginBottom: "12px" }}>
                    <button
                      className={`s_btn ${answersFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => {
                        setAnswersFilter("all");
                        fetchMyAnswers("all", 1, false);
                      }}
                    >
                      Все
                    </button>
                    <button
                      className={`s_btn ${answersFilter === "best" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => {
                        setAnswersFilter("best");
                        fetchMyAnswers("best", 1, false);
                      }}
                    >
                      Лучшие
                    </button>
                  </div>
                  {myAnswersLoading && !myAnswersLoadingMore && myAnswers.length === 0 ? (
                    <p className="secondary_text" style={{ textAlign: "center", padding: "48px 0" }}>
                      Загрузка…
                    </p>
                  ) : profileAnswersForCard.length > 0 ? (
                    <div style={{ position: "relative" }}>
                      <div className="answers_list_profile" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {profileAnswersForCard.map((answer) => (
                          <AnswerResultCard
                            key={answer.id}
                            answer={answer}
                            isBestView={answer.isBestAnswer}
                            isOwnProfile={true}
                          />
                        ))}
                      </div>
                      {myAnswersLoading && !myAnswersLoadingMore ? (
                        <div
                          className="secondary_text"
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.82)",
                            borderRadius: "8px",
                          }}
                        >
                          Загрузка…
                        </div>
                      ) : null}
                      {myAnswersPage < myAnswersLastPage ? (
                        <div className="show_more_btn_wrapper" style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                          <button
                            className="show_more_btn"
                            type="button"
                            onClick={() => fetchMyAnswers(answersFilter, myAnswersPage + 1, true)}
                            disabled={myAnswersLoadingMore}
                          >
                            <svg width="22" height="22">
                              <use xlinkHref="#sync"></use>
                            </svg>
                            <span>{myAnswersLoadingMore ? "Загрузка…" : "Загрузить еще"}</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : !myAnswersLoading ? (
                    <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
                      Ответов пока нет
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Таб: Подписки пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_answers ${activeTab === "menu_subscriptions" ? "active_menu" : ""}`}
                id="menu_subscriptions"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter" style={{ marginBottom: "12px" }}>
                    <button
                      type="button"
                      className={`s_btn ${followFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setFollowFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      type="button"
                      className={`s_btn ${followFilter === "online" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setFollowFilter("online")}
                    >
                      В сети
                    </button>
                    <button
                      type="button"
                      className={`s_btn ${followFilter === "vip" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setFollowFilter("vip")}
                    >
                      VIP
                    </button>
                  </div>
                  <div className="answers_list_profile" style={{ display: "flex", flexDirection: "column", gap: "5px", position: "relative", minHeight: "120px" }}>
                    {subscriptionsLoading && !subscriptionsLoadingMore ? (
                      <p className="secondary_text" style={{ textAlign: "center", padding: "48px 0" }}>
                        Загрузка…
                      </p>
                    ) : subscriptions.length > 0 ? (
                      subscriptions.map((u) => renderUserFollowCard(u, false))
                    ) : (
                      <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
                        Список пуст
                      </p>
                    )}
                  </div>
                  {subscriptionsPage < subscriptionsLastPage && subscriptions.length > 0 && !subscriptionsLoading ? (
                    <div className="show_more_btn_wrapper" style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        className="show_more_btn"
                        type="button"
                        onClick={() => fetchSubscriptions(subscriptionsPage + 1, true)}
                        disabled={subscriptionsLoadingMore}
                      >
                        <svg width="22" height="22"><use xlinkHref="#sync"></use></svg>
                        <span>{subscriptionsLoadingMore ? "Загрузка…" : "Загрузить еще"}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Таб: Подписчики пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_answers ${activeTab === "menu_subscribers" ? "active_menu" : ""}`}
                id="menu_subscribers"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter" style={{ marginBottom: "12px" }}>
                    <button
                      type="button"
                      className={`s_btn ${subscriberFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setSubscriberFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      type="button"
                      className={`s_btn ${subscriberFilter === "online" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setSubscriberFilter("online")}
                    >
                      В сети
                    </button>
                    <button
                      type="button"
                      className={`s_btn ${subscriberFilter === "vip" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setSubscriberFilter("vip")}
                    >
                      VIP
                    </button>
                  </div>
                  <div className="answers_list_profile" style={{ display: "flex", flexDirection: "column", gap: "5px", position: "relative", minHeight: "120px" }}>
                    {subscribersLoading && !subscribersLoadingMore ? (
                      <p className="secondary_text" style={{ textAlign: "center", padding: "48px 0" }}>
                        Загрузка…
                      </p>
                    ) : subscribers.length > 0 ? (
                      subscribers.map((u) => renderUserFollowCard(u, true))
                    ) : (
                      <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
                        Список пуст
                      </p>
                    )}
                  </div>
                  {subscribersPage < subscribersLastPage && subscribers.length > 0 && !subscribersLoading ? (
                    <div className="show_more_btn_wrapper" style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        className="show_more_btn"
                        type="button"
                        onClick={() => fetchSubscribers(subscribersPage + 1, true)}
                        disabled={subscribersLoadingMore}
                      >
                        <svg width="22" height="22"><use xlinkHref="#sync"></use></svg>
                        <span>{subscribersLoadingMore ? "Загрузка…" : "Загрузить еще"}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                id="menu_levels"
              >
                <ProfileLevelsMenuInner
                  balls={balls}
                  level={meUser.level ?? 0}
                  kpd={meUser.kpd ?? 0}
                  levelName={meUser.level_name ?? ""}
                  ballsToNextLevel={meUser.balls_to_next_level}
                />
              </div>

              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                id="menu_rules"
              >
                <ProfileRulesMenuInner />
              </div>

              {/* Таб 2: Редактировать профиль */}
              <div
                className={`menu_item_content profile-edit-tab menu_item_content_m ${activeTab === "menu2" ? "active_menu" : ""}`}
                id="menu2"
              >
                <div className="user_profile_page_content">
                  <div className="blocks_title">
                    <h2>Редактировать профиль</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <form
                      method="post"
                      className="form"
                      id="edit_profile_form"
                      onSubmit={handleEditSubmit}
                    >
                      <div className="profile_input">
                        <p className="main_text">Ваше имя</p>
                        <input
                          type="text"
                          placeholder="Ваше имя"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          name="name"
                        />
                      </div>
                      <div className="profile_warning">
                        <img src="/images/icons/info.svg" alt="" />
                        <p className="secondary_text">
                          Вы можете изменить имя в общих настройках
                        </p>
                      </div>
                      <div className="profile_input">
                        <p className="main_text">
                          В чем вы лучше всего разбираетесь?
                        </p>
                        <div className="textarea_wrapper">
                          <textarea
                            placeholder="Опишите как можно подробнее"
                            name="description"
                            value={profileDescription}
                            maxLength={BIO_MAX_LENGTH}
                            onChange={(e) => setProfileDescription(e.target.value)}
                          />
                          <span className="textarea_char_counter">
                            {BIO_MAX_LENGTH - profileDescription.length}
                          </span>
                        </div>
                      </div>
                      <p className="secondary_text">
                        Например, &quot;Люблю фотографировать и могу
                        порекомендовать, какую технику выбрать&quot;
                      </p>
                      <div className="profile_action_btns">
                        <button className="m_btn category_btn" type="submit" disabled={profileSaving}>
                          Сохранить профиль
                        </button>
                        <button
                          className="m_btn cancel_btn"
                          type="button"
                          onClick={() => {
                            setProfileName(initialName);
                            setProfileDescription(initialDescription);
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Таб: VIP-статус */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_vip" ? "active_menu" : ""}`}
                id="menu_vip"
              >
                <div className="user_profile_page_content profile-vip">
                  <div className="blocks_title">
                    <h2>Активировать VIP-статус</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <p className="secondary_text">
                      VIP — это особые знаки отличия на проекте, выделение
                      ответов и вопросов в общих списках, в два раза больше
                      баллов за каждый ответ и увеличение ежедневного лимита
                      вопросов до 100, возможность скрыть списки вопросов и
                      ответов в своем личном кабинете, а также отключение
                      рекламы!
                    </p>
                    <form method="post" className="vip_form">
                      {/* Карточки услуг */}
                      <div className="vip_status_card">
                        <div>
                          <img src="/images/icons/vip.svg" alt="VIP" />
                          <h3>100 ₽</h3>
                          <div className="secondary_text">
                            Продление VIP статуса на 10 дней
                          </div>
                        </div>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.6619 1.9725C12.59 0.75 10.2886 0 7.5 0C4.71139 0 2.41005 0.75 1.33808 1.9725C-0.446027 4.0425 -0.446027 10.9725 1.33808 13.0275C2.41005 14.25 4.71139 15 7.5 15C10.2886 15 12.59 14.25 13.6619 13.0275C15.446 10.9575 15.446 4.0425 13.6619 1.9725ZM7.5 3.5625C7.68533 3.5625 7.86649 3.61748 8.02059 3.7205C8.17468 3.82351 8.29478 3.96993 8.3657 4.14123C8.43663 4.31254 8.45518 4.50104 8.41903 4.6829C8.38287 4.86475 8.29363 5.0318 8.16258 5.16291C8.03154 5.29402 7.86457 5.38331 7.68281 5.41949C7.50104 5.45566 7.31263 5.43709 7.14141 5.36614C6.97019 5.29518 6.82385 5.17502 6.72089 5.02085C6.61793 4.86668 6.56297 4.68542 6.56297 4.5C6.56297 4.25136 6.66169 4.0129 6.83742 3.83709C7.01315 3.66127 7.25148 3.5625 7.5 3.5625ZM8.24963 11.625H6.75038C6.55156 11.625 6.36089 11.546 6.22031 11.4053C6.07973 11.2647 6.00075 11.0739 6.00075 10.875C6.00075 10.6761 6.07973 10.4853 6.22031 10.3447C6.36089 10.204 6.55156 10.125 6.75038 10.125V7.875C6.55156 7.875 6.36089 7.79598 6.22031 7.65533C6.07973 7.51468 6.00075 7.32391 6.00075 7.125C6.00075 6.92609 6.07973 6.73532 6.22031 6.59467C6.36089 6.45402 6.55156 6.375 6.75038 6.375H7.5C7.69881 6.375 7.88948 6.45402 8.03007 6.59467C8.17065 6.73532 8.24963 6.92609 8.24963 7.125V10.125C8.44844 10.125 8.63911 10.204 8.77969 10.3447C8.92027 10.4853 8.99925 10.6761 8.99925 10.875C8.99925 11.0739 8.92027 11.2647 8.77969 11.4053C8.63911 11.546 8.44844 11.625 8.24963 11.625Z"
                            fill="#636BFF"
                          />
                        </svg>
                      </div>

                      <div className="mini-title">Выберите способ платежа</div>

                      {/* Блок AskPay: инпут ФИО + кнопка выйти */}
                      <div className="payment_askpay_block">
                        <input
                          type="text"
                          placeholder="Введите ФИО"
                          className="payment_fio_input"
                        />
                        <button type="button" className="payment_logout_btn">
                          <span>Выйти</span>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.5303 8.28597C10.3834 8.27356 10.2378 8.32149 10.1253 8.41926C10.0128 8.51703 9.94258 8.65666 9.93012 8.80751C9.88091 9.40399 9.81999 9.92282 9.76668 10.1955V10.1988C9.60939 11.0324 8.84081 11.8564 8.05261 12.0376C7.98436 12.052 7.91582 12.0659 7.84757 12.0791C7.90615 11.3048 7.9498 10.3147 7.94394 9.55115C7.95273 8.38468 7.84406 6.58864 7.74769 5.87389C7.57459 4.55786 6.78697 3.09827 5.91558 2.47802L5.9103 2.4744C5.30444 2.05386 4.65512 1.70353 3.97421 1.42982C3.85275 1.38147 3.73276 1.33633 3.61423 1.2944C4.26061 1.19172 4.91384 1.1414 5.5679 1.14392C6.45833 1.14392 7.27114 1.22728 8.05261 1.39401C8.84081 1.57458 9.60939 2.39917 9.76668 3.23279V3.2361C9.8197 3.50695 9.88062 4.02578 9.92983 4.62045C9.94234 4.77158 10.0128 4.91142 10.1256 5.0092C10.2385 5.10698 10.3845 5.15469 10.5316 5.14184C10.6787 5.12899 10.8148 5.05663 10.91 4.94068C11.0051 4.82472 11.0516 4.67468 11.0391 4.52355C10.9857 3.87982 10.9201 3.32939 10.8586 3.0128C10.6158 1.73047 9.51127 0.554068 8.28927 0.275994L8.28224 0.274489C7.42345 0.0915136 6.53595 0.00183172 5.56585 2.60448e-05C4.59575 -0.00177963 3.71177 0.0903099 2.85297 0.27479L2.84565 0.276295C2.30026 0.400585 1.7786 0.703939 1.34627 1.11533C1.22943 1.20585 1.1273 1.31485 1.0437 1.43825C0.661754 1.89629 0.384374 2.44431 0.276585 3.0128C0.141556 3.70828 -0.0110467 5.51185 0.000669454 6.71564C-0.00577444 7.36147 0.0349392 8.18004 0.0952775 8.90743C0.127497 9.37389 0.16411 9.78017 0.199259 10.0408C0.372365 11.3568 1.15998 12.8164 2.03167 13.4367L2.03665 13.4403C2.64266 13.8608 3.29207 14.2111 3.97304 14.4849C4.66253 14.7599 5.29521 14.9267 5.90767 14.9947H5.91294C6.736 15.0702 7.48408 14.3362 7.71049 13.263C7.90205 13.2317 8.09195 13.1961 8.28019 13.1562L8.28722 13.1547C9.50951 12.8766 10.6138 11.7002 10.8566 10.4179C10.9181 10.1007 10.984 9.54905 11.0373 8.90382C11.0497 8.75283 11.0033 8.60295 10.9082 8.4871C10.8132 8.37125 10.6772 8.29891 10.5303 8.28597Z"
                              fill="#5D67FF"
                            />
                            <path
                              d="M15 6.71474C15 6.69578 15 6.67682 14.9971 6.65786C14.9972 6.65666 14.9972 6.65544 14.9971 6.65424C14.9953 6.63646 14.9927 6.61878 14.9892 6.60128V6.59737C14.9672 6.48869 14.9148 6.389 14.8383 6.31056L12.8466 4.26233C12.7422 4.15505 12.6006 4.09477 12.453 4.09474C12.3054 4.09472 12.1638 4.15494 12.0594 4.26218C11.955 4.36941 11.8963 4.51486 11.8963 4.66654C11.8963 4.81822 11.9549 4.9637 12.0592 5.07097L13.104 6.14414H9.26201C9.11441 6.14414 8.97286 6.20438 8.86849 6.31162C8.76412 6.41885 8.70549 6.56429 8.70549 6.71594C8.70549 6.86759 8.76412 7.01303 8.86849 7.12026C8.97286 7.22749 9.11441 7.28774 9.26201 7.28774H13.0991L12.0551 8.36031C11.9511 8.46762 11.8928 8.61294 11.893 8.76438C11.8931 8.91583 11.9517 9.06103 12.056 9.16811C12.1602 9.2752 12.3015 9.33543 12.4489 9.33559C12.5963 9.33575 12.7377 9.27582 12.8422 9.16895L14.8248 7.13185C14.8967 7.06265 14.9493 6.97495 14.9772 6.87785C14.9822 6.86054 14.9863 6.84295 14.9895 6.82518C14.9896 6.82268 14.9896 6.82016 14.9895 6.81766C14.9921 6.80231 14.9947 6.78756 14.9962 6.77131C14.9977 6.75506 14.9962 6.74784 14.9962 6.7364C14.9962 6.72978 14.9962 6.72316 14.9962 6.71654L15 6.71474Z"
                              fill="#5D67FF"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="payment_methods">
                        {/* Банковская карта */}
                        <label className="payment_method_label">
                          <input
                            type="radio"
                            name="payment_method"
                            value="card"
                            defaultChecked
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/1.svg" alt="" />
                              <div>
                                <p className="main_text">Банковская карта</p>
                                <p className="secondary_text">
                                  Мир, UnionPay, Visa, Mastercard и другие
                                </p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* Мобильный платёж */}
                        <label className="payment_method_label">
                          <input
                            type="radio"
                            name="payment_method"
                            value="mobile"
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/3.svg" alt="" />
                              <div>
                                <p className="main_text">Мобильный платёж</p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* AskPay */}
                        <label className="payment_method_label">
                          <input
                            type="radio"
                            name="payment_method"
                            value="askpay"
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <svg
                                width="27"
                                height="24"
                                viewBox="0 0 27 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M26.9676 13.3539L24.9261 1.74586C24.7458 0.721037 23.8569 0 22.8537 0C22.7322 0 4.97533 3.12783 4.97533 3.12783C3.82941 3.33042 3.06424 4.42599 3.26632 5.57485L3.46312 6.69394H19.4888C21.5219 6.69394 23.1759 8.3522 23.1759 10.3905V16.169L25.2586 15.8009C26.4045 15.5983 27.1697 14.5027 26.9676 13.3539Z"
                                  fill="#5D67FF"
                                />
                                <path
                                  d="M21.5957 17.0495H0V21.8877C0 23.0543 0.943313 24 2.1069 24H19.4888C20.6524 24 21.5957 23.0543 21.5957 21.8877V17.0495ZM6.2726 22.0969H2.68824C2.25192 22.0969 1.89817 21.7423 1.89817 21.3048C1.89817 20.8674 2.25192 20.5127 2.68824 20.5127H6.2726C6.70892 20.5127 7.06267 20.8674 7.06267 21.3048C7.06267 21.7423 6.70898 22.0969 6.2726 22.0969Z"
                                  fill="#5D67FF"
                                />
                                <path
                                  d="M0.00258399 10.2875H21.5931C21.5395 9.16877 20.6179 8.27824 19.4887 8.27824H2.1069C0.977749 8.27824 0.0561621 9.16877 0.00258399 10.2875Z"
                                  fill="#5D67FF"
                                />
                                <path
                                  d="M0 11.8717H21.5957V15.4653H0V11.8717Z"
                                  fill="#5D67FF"
                                />
                              </svg>
                              <div>
                                <p className="main_text">Баланс AskPay</p>
                                <p className="secondary_text">100 ₽</p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* Другие способы */}
                        <label className="payment_method_label">
                          <input
                            type="radio"
                            name="payment_method"
                            value="other"
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/4.svg" alt="" />
                              <div>
                                <p className="main_text">Другие способы</p>
                                <p className="secondary_text">
                                  SberPay, Юmoney
                                </p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Таб: Настройки */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu4" ? "active_menu" : ""}`}
                id="menu4"
              >
                <div className="user_profile_page_content profile-settings">
                  <div className="blocks_title">
                    <h2>Настройки</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    {/* Уведомления */}
                    <div className="profile_settings_top_titles">
                      <p className="profile_settings_title">Уведомления</p>
                      <p className="secondary_text">Сайт</p>
                      <p className="secondary_text">Почта</p>
                    </div>

                    <div className="user_seting_item">
                      <p className="secondary_text">Получать все уведомления</p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.receive_all}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: { ...prev.site, receive_all: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.notifications.receive_all}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                receive_all: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Новый ответ на мой вопрос
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.new_answer_on_my_question}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: {
                                ...prev.site,
                                new_answer_on_my_question: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.notifications.new_answer_on_my_question}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                new_answer_on_my_question: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Мой вопрос или ответ понравился
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.my_content_liked}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: { ...prev.site, my_content_liked: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.notifications.my_content_liked}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                my_content_liked: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Мне оставили новый комментарий
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.new_comment_on_my_answer}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: {
                                ...prev.site,
                                new_comment_on_my_answer: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.notifications.new_comment_on_my_answer}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                new_comment_on_my_answer: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Баллы: начисления и списания
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.balls_balance_changes}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: {
                                ...prev.site,
                                balls_balance_changes: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                      <span className="secondary_text" aria-hidden>
                        —
                      </span>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Новый голос в опросе</p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.general.new_poll_vote_site}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              general: { ...prev.general, new_poll_vote_site: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.general.new_poll_vote_email}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              general: { ...prev.general, new_poll_vote_email: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>

                    <div className="line"></div>

                    {/* Включить звук для уведомлений */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">
                        Включить звук для уведомлений
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.sound_enabled}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: { ...prev.site, sound_enabled: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item user_seting_item_sound">
                      <button
                        className="play_sound_btn"
                        type="button"
                        title="Прослушать звук"
                      >
                        <svg width="11" height="14">
                          <use xlinkHref="#play-sound"></use>
                        </svg>
                      </button>
                      <p className="secondary_text">Прослушать звук</p>
                    </div>

                    <div className="line"></div>

                    {/* Получать новости проекта */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">
                        Получать новости проекта
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.receive_project_news}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: { ...prev.site, receive_project_news: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>

                    <div className="line"></div>

                    {/* Настройка дизайна уведомлений */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">
                        Настройка дизайна уведомлений
                      </p>
                      <label className="chechbox_item">
                        <input
                          type="checkbox"
                          checked={settingsDraft.site.compact_view}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              site: { ...prev.site, compact_view: e.target.checked },
                            }))
                          }
                        />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Компактный вид</p>
                    </div>

                    <div className="line"></div>

                    {/* Общие настройки */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">Общие настройки</p>
                    </div>
                    <div className="user_seting_item user_seting_item_sec">
                      <p className="secondary_text">Цветовая тема сайта</p>
                      <div className="select_themes">
                        <label className="chechbox_item">
                          <input
                            type="radio"
                            value="auto"
                            name="theme"
                            checked={settingsDraft.site.color_theme === "auto"}
                            onChange={() =>
                              setSettingsDraft((prev) => ({
                                ...prev,
                                site: { ...prev.site, color_theme: "auto" },
                              }))
                            }
                          />
                          <span>Авто</span>
                        </label>
                        <label className="chechbox_item">
                          <input
                            type="radio"
                            value="dark"
                            name="theme"
                            checked={settingsDraft.site.color_theme === "dark"}
                            onChange={() =>
                              setSettingsDraft((prev) => ({
                                ...prev,
                                site: { ...prev.site, color_theme: "dark" },
                              }))
                            }
                          />
                          <span>Темная</span>
                        </label>
                        <label className="chechbox_item">
                          <input
                            type="radio"
                            value="light"
                            name="theme"
                            checked={settingsDraft.site.color_theme === "light"}
                            onChange={() =>
                              setSettingsDraft((prev) => ({
                                ...prev,
                                site: { ...prev.site, color_theme: "light" },
                              }))
                            }
                          />
                          <span>Светлая</span>
                        </label>
                      </div>
                    </div>
                    <p className="secondary_text settings_hint">
                      Если выбран режим авто, мы включим тёмную тему с 21:00 до
                      06:00 по системному времени
                    </p>

                    <div className="line"></div>

                    <div className="profile_action_btns">
                      <button
                        className="m_btn category_btn"
                        type="button"
                        onClick={handleSettingsSave}
                        disabled={settingsSaving}
                      >
                        {settingsSaving ? "Сохранение..." : "Сохранить"}
                      </button>
                      <button
                        className="m_btn cancel_btn"
                        type="button"
                        onClick={handleSettingsCancel}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="line"></div>

          <div className="profile_stats_column">
          <div className="profile_stats">
            <div className="blocks_title">
              <h2>Статистика</h2>
            </div>
            <div className="profile_stats_list">
              <div className={`profile_stats_item ${activeTab === "menu1" ? "active" : ""}`} onClick={() => handleTabClick("menu1")} style={{ cursor: "pointer" }}>
                <p className="main_text">Вопросы</p>
                <div className="stats_badge">
                  <p className="main_text">{meUser.questions_count ?? user.questionsCount}</p>
                </div>
              </div>
              <div className={`profile_stats_item ${activeTab === "menu_answers" ? "active" : ""}`} onClick={() => handleTabClick("menu_answers")} style={{ cursor: "pointer" }}>
                <p className="main_text">Ответы</p>
                <div className="stats_badge">
                  <p className="main_text">{meUser.answers_count ?? user.answersCount}</p>
                </div>
              </div>
              <div className={`profile_stats_item ${activeTab === "menu_subscriptions" ? "active" : ""}`} onClick={() => handleTabClick("menu_subscriptions")} style={{ cursor: "pointer" }}>
                <p className="main_text">Подписки</p>
                <div className="stats_badge">
                  <p className="main_text">{meUser.subscriptions_count ?? subscriptions.length}</p>
                </div>
              </div>
              <div className={`profile_stats_item ${activeTab === "menu_subscribers" ? "active" : ""}`} onClick={() => handleTabClick("menu_subscribers")} style={{ cursor: "pointer" }}>
                <p className="main_text">Подписчики</p>
                <div className="stats_badge">
                  <p className="main_text">{meUser.subscribers_count ?? subscribers.length}</p>
                </div>
              </div>
            </div>
            <>
              <div className="blocks_title" style={{ marginTop: "24px" }}>
                <h2>Ограничения на день</h2>
              </div>
              <div className="profile_stats_list profile_stats_limits_list">
                {[
                  { value: 10, label: "Вопросы" },
                  { value: 0, label: "Прямых вопросов" },
                  { value: 30, label: "Ответов" },
                  { value: 30, label: "Комментариев" },
                  { value: 100, label: "Голосов за ответ" },
                  { value: 100, label: "Голоссов в опрос" },
                  { value: 60, label: "Оценок вопросов" },
                  { value: 60, label: "Оценок ответов" },
                  { value: 10, label: "Фото" },
                  { value: 0, label: "Видео" },
                  { value: 0, label: "Рекомендации" },
                ].map(({ value, label }) => (
                  <div key={label} className="profile_stats_item limits_stat_item">
                    <div className="stats_badge limits_badge">
                      <p className="main_text">{value}</p>
                    </div>
                    <p className="main_text">{label}</p>
                  </div>
                ))}
                <div className="limits_help">
                  <Link href="#" className="limits_help_link">Нужна помощь?</Link>
                </div>
              </div>
            </>
          </div>
          </div>
        </div>
      </div>

      <SharePopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        anchorRef={shareButtonRef}
        title={shareData.title}
        url={shareData.url}
      />

      <Footer />
    </div>
  );
}
