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
import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import type { MeApiResponse } from "@/lib/server-me";
import type { ProfileWidgetsPayload } from "@/lib/server-profile-widgets";
import { mockUsers } from "@/data/mock-users";
import type { UserAnswer } from "@/data/mock-answers";
import SearchResultCard from "@/components/SearchResultCard";
import AnswerResultCard from "@/components/AnswerResultCard";
import ProfileHeaderBlock from "@/components/profile/ProfileHeaderBlock";
import UserAvatar from "@/components/UserAvatar";
import { ProfileLevelsMenuInner, ProfileRulesMenuInner } from "./ProfileLevelsRulesContent";
import ProfileWeeklyLeadersSidebar from "@/components/ProfileWeeklyLeadersSidebar";
import { CheckIcon } from "@/components/AboutIcons";
import { useSearchParams } from "next/navigation";
import type { SubscriptionPackage } from "@/types";
import { displayUserName, displayUserSubtitle } from "@/lib/ai-user-display";
import { showSystemToast } from "@/store/systemToastStore";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { playNotificationSound } from "@/lib/notification-sound";

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

type ProfileFollowUser = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
  avatar_url_2x?: string | null;
  balls?: number;
  created_at?: string | null;
  subscribed_by_me?: boolean;
  questions_count?: number;
  answers_count?: number;
  level_name?: string | null;
  is_premium?: boolean;
  premium_is_active?: boolean;
  premium_is_permanent?: boolean;
  premium_package_name?: string | null;
};

type ProfileSettings = {
  site: {
    receive_all: boolean;
    new_answer_on_my_question: boolean;
    my_content_liked: boolean;
    new_comment_on_my_answer: boolean;
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
  };
};

const defaultSettings: ProfileSettings = {
  site: {
    receive_all: true,
    new_answer_on_my_question: true,
    my_content_liked: true,
    new_comment_on_my_answer: true,
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
    // reserved
  },
};

type ProfilePageClientProps = {
  initialMe: MeApiResponse;
  initialWidgets: ProfileWidgetsPayload;
};

export default function ProfilePageClient({ initialMe, initialWidgets }: ProfilePageClientProps) {
  const searchParams = useSearchParams();
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
  const isPremiumUser = Boolean(
    (meUser.premium_is_active ?? meUser.is_premium) ||
      meUser.vip ||
      (typeof meUser.vip_status === "number" ? meUser.vip_status > 0 : meUser.vip_status),
  );

  const dailyLimitsRows = useMemo(() => {
    const limits = meUser.daily_action_limits;
    if (!limits) {
      return [] as { value: string; label: string }[];
    }
    const fmt = (v: number | null | undefined) =>
      v === null || v === undefined ? "∞" : String(v);

    return [
      { value: fmt(limits.ask_question), label: "Вопросы" },
      { value: fmt(limits.answer), label: "Ответов" },
      { value: fmt(limits.answer_comment), label: "Комментариев" },
      { value: fmt(limits.vote_best), label: "Голосов за ответ" },
      { value: fmt(limits.vote_question), label: "Оценок вопроса" },
      { value: fmt(limits.file), label: "Фото" },
      { value: fmt(limits.video), label: "Видео" },
    ];
  }, [meUser]);
  const premiumBadgeText = meUser.premium_is_permanent
    ? "Постоянный"
    : meUser.premium_package_name?.trim() || "Премиум";
  const isAiUser = Boolean(meUser.is_ai);
  const displayName = displayUserName(meUser);
  const rankLabel = displayUserSubtitle(meUser);
  const avatarUrl = meUser.avatar_url || user.avatar;
  const avatarUrl2x = meUser.avatar_url_2x ?? null;
  const balls = isAiUser ? 0 : (meUser.balls ?? user.rating);
  const ballsDisplay = isAiUser ? "∞" : String(meUser.balls ?? user.rating);
  const kpdPercent = Math.round((meUser.kpd ?? 0) * 100);
  const nextLevelBalls = meUser.next_level_balls ?? 1000;
  const registeredAt = meUser.created_at ?? user.createdAt;
  const registeredAgo = registeredAt ? formatTimeAgo(registeredAt) : "только что";
  const registeredInService = registeredAgo.replace(/\s+назад$/, "");
  const progress = nextLevelBalls && nextLevelBalls > 0
    ? (isAiUser ? 100 : Math.max(0, Math.min(100, Math.round((balls / nextLevelBalls) * 100))))
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
  const [subscriptionPackages, setSubscriptionPackages] = useState<SubscriptionPackage[]>([]);
  const [subscriptionPackagesLoading, setSubscriptionPackagesLoading] = useState(false);
  const [subscriptionPackagesLoaded, setSubscriptionPackagesLoaded] = useState(false);
  const [packageCheckoutLoadingId, setPackageCheckoutLoadingId] = useState<number | null>(null);

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
    const tab = searchParams.get("tab");
    if (tab === "edit") {
      setActiveTab("menu2");
    } else if (tab === "levels") {
      setActiveTab("menu_levels");
    } else if (tab === "rules") {
      setActiveTab("menu_rules");
    } else if (tab === "vip" || tab === "packages") {
      setActiveTab("menu_packages");
    } else if (tab === "settings") {
      setActiveTab("menu4");
    }
  }, [searchParams]);

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
      showSystemToast("Профиль сохранён", "success");
    } catch (err) {
      showSystemToast(getApiErrorMessage(err), "error");
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
      const payload = data as { avatar_url?: string; avatar_url_2x?: string | null };
      if (payload.avatar_url) {
        patchUser({
          avatar_url: payload.avatar_url,
          avatar_url_2x: payload.avatar_url_2x ?? null,
        });
      }
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

  const fetchSubscriptionPackages = useCallback(async () => {
    setSubscriptionPackagesLoading(true);
    try {
      const data = await api.get<{ packages: SubscriptionPackage[] }>("v1/subscription-packages");
      setSubscriptionPackages(data.packages ?? []);
    } catch {
      setSubscriptionPackages([]);
    } finally {
      setSubscriptionPackagesLoaded(true);
      setSubscriptionPackagesLoading(false);
    }
  }, []);

  const handlePurchasePackage = useCallback(async (packageId: number) => {
    setPackageCheckoutLoadingId(packageId);
    try {
      const data = await api.post<{
        payment: {
          confirmation_url?: string | null;
        };
      }>("v1/premium-subscriptions/checkout", { package_id: packageId });
      const confirmationUrl = data.payment?.confirmation_url;
      if (confirmationUrl && typeof window !== "undefined") {
        window.location.href = confirmationUrl;
      }
    } finally {
      setPackageCheckoutLoadingId(null);
    }
  }, []);

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

  useEffect(() => {
    if (activeTab !== "menu_packages") return;
    if (subscriptionPackagesLoaded || subscriptionPackagesLoading) return;
    void fetchSubscriptionPackages();
  }, [activeTab, subscriptionPackagesLoaded, subscriptionPackagesLoading, fetchSubscriptionPackages]);

  const profileQuestionStatus = (q: ProfileQuestionItem): "opened" | "voting" | "closed" => {
    if (q.status === "voting") return "voting";
    if (q.status === "closed" || q.status === "best") return "closed";
    if (questionsFilter === "voting") return "voting";
    if (questionsFilter === "best") return "closed";
    return "opened";
  };

  const renderSubscriptionPackageIcon = (iconKey?: string | null) => {
    switch (iconKey) {
      case "standard":
        return (
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M23.7286 10.8317L20.167 11.7513C20.0912 11.7714 20.0115 11.7683 19.9374 11.7423C19.8634 11.7164 19.7982 11.6688 19.7498 11.6053L15.8454 6.55586C15.6166 6.28154 15.3334 6.06144 15.015 5.91058C14.6966 5.75971 14.3505 5.68162 14.0003 5.68162C13.6501 5.68162 13.304 5.75971 12.9856 5.91058C12.6672 6.06144 12.384 6.28154 12.1553 6.55586L8.24959 11.6066C8.19981 11.6686 8.13426 11.7151 8.06033 11.7407C7.98639 11.7662 7.90702 11.7699 7.83117 11.7513L4.27198 10.8317C3.99236 10.7593 3.6994 10.7631 3.42161 10.8426C3.14383 10.9222 2.89067 11.0747 2.68677 11.2855C2.48286 11.4962 2.33517 11.7579 2.25804 12.0452C2.18091 12.3325 2.17699 12.6356 2.24664 12.9249L4.47609 22.1476C4.60283 22.677 4.89747 23.1472 5.31293 23.483C5.72838 23.8188 6.24065 24.0008 6.76789 24H21.2321C21.7593 24.0008 22.2716 23.8188 22.6871 23.483C23.1025 23.1472 23.3972 22.677 23.5239 22.1476L25.7534 12.9249C25.823 12.6356 25.8191 12.3326 25.742 12.0454C25.6649 11.7582 25.5173 11.4964 25.3135 11.2857C25.1096 11.075 24.8566 10.9224 24.5788 10.8428C24.3011 10.7633 24.0082 10.7594 23.7286 10.8317Z" fill="white"/>
            <path d="M1.95349 9.76735C3.03237 9.76735 3.90698 8.86259 3.90698 7.74652C3.90698 6.63045 3.03237 5.72569 1.95349 5.72569C0.874607 5.72569 0 6.63045 0 7.74652C0 8.86259 0.874607 9.76735 1.95349 9.76735Z" fill="white"/>
            <path d="M26.0465 9.76735C27.1254 9.76735 28 8.86259 28 7.74652C28 6.63045 27.1254 5.72569 26.0465 5.72569C24.9676 5.72569 24.093 6.63045 24.093 7.74652C24.093 8.86259 24.9676 9.76735 26.0465 9.76735Z" fill="white"/>
            <path d="M14 4.04166C15.0789 4.04166 15.9535 3.13691 15.9535 2.02083C15.9535 0.904757 15.0789 0 14 0C12.9211 0 12.0465 0.904757 12.0465 2.02083C12.0465 3.13691 12.9211 4.04166 14 4.04166Z" fill="white"/>
          </svg>
        );
      case "premium":
        return (
          <svg width="30" height="28" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M8.78504 6.74069L5.23553 17.3803C5.21447 17.4394 5.20831 17.5025 5.21755 17.5644C5.2268 17.6262 5.2512 17.6851 5.28873 17.7361C5.32627 17.7872 5.37587 17.8289 5.43347 17.858C5.49107 17.887 5.55501 17.9025 5.62006 17.9032H6.61392C6.70263 17.9029 6.78887 17.8751 6.85977 17.8239C6.93068 17.7727 6.98244 17.7008 7.00732 17.619L7.56341 15.9139H12.4233L12.3553 15.8088L12.9646 17.619C12.9895 17.7008 13.0412 17.7727 13.1121 17.8239C13.183 17.8751 13.2693 17.9029 13.358 17.9032H14.3519C14.417 17.9035 14.4812 17.8891 14.5393 17.8609C14.5975 17.8328 14.6478 17.7917 14.6862 17.7412C14.7246 17.6907 14.75 17.6322 14.7603 17.5704C14.7705 17.5087 14.7654 17.4455 14.7453 17.386L11.1957 6.74638C11.1704 6.66481 11.1186 6.59319 11.0478 6.54204C10.977 6.49089 10.8909 6.46291 10.8023 6.4622H9.16957C9.08314 6.46389 8.99946 6.49171 8.93042 6.5417C8.86139 6.5917 8.81052 6.66133 8.78504 6.74069ZM8.155 14.2089L9.98596 8.73278L11.8317 14.2089H8.155Z" fill="white"/>
            <path d="M18.8124 6.46504H17.8659C17.6372 6.46504 17.4518 6.64316 17.4518 6.86289V17.5025C17.4518 17.7222 17.6372 17.9003 17.8659 17.9003H18.8124C19.0411 17.9003 19.2265 17.7222 19.2265 17.5025V6.86289C19.2265 6.64316 19.0411 6.46504 18.8124 6.46504Z" fill="white"/>
            <path d="M13.9792 22.1658H5.37159C4.73145 22.1658 4.11752 21.9215 3.66487 21.4867C3.21222 21.0518 2.95793 20.462 2.95793 19.847V5.16067C2.95793 4.54566 3.21222 3.95584 3.66487 3.52097C4.11752 3.08609 4.73145 2.84178 5.37159 2.84178H20.6581C21.2983 2.84178 21.9122 3.08609 22.3649 3.52097C22.8175 3.95584 23.0718 4.54566 23.0718 5.16067V12.5038C23.0772 12.6588 23.1462 12.8055 23.2636 12.912C23.381 13.0184 23.5375 13.076 23.6989 13.0722C24.2026 13.0707 24.6998 13.1816 25.1512 13.3961C25.245 13.4423 25.3495 13.4644 25.4548 13.4602C25.56 13.4559 25.6623 13.4256 25.7517 13.3721C25.8411 13.3185 25.9145 13.2437 25.9648 13.1547C26.0151 13.0658 26.0405 12.9659 26.0386 12.8647V5.16067C26.0386 4.48224 25.8994 3.81047 25.6289 3.1838C25.3584 2.55712 24.9619 1.98784 24.4622 1.50851C23.9624 1.02919 23.3692 0.649235 22.7165 0.390389C22.0638 0.131544 21.3643 -0.0011137 20.6581 7.04248e-06H5.37159C3.94696 7.04248e-06 2.58067 0.543718 1.5733 1.51153C0.565934 2.47934 0 3.79198 0 5.16067V19.847C0 21.2156 0.565934 22.5283 1.5733 23.4961C2.58067 24.4639 3.94696 25.0076 5.37159 25.0076H15.2215C15.3425 25.0078 15.4609 24.9734 15.5616 24.909C15.6624 24.8445 15.741 24.7528 15.7875 24.6455C15.834 24.5382 15.8464 24.42 15.823 24.3059C15.7997 24.1918 15.7417 24.0869 15.6563 24.0045C15.1961 23.5988 14.8232 23.1102 14.5589 22.5665C14.5166 22.4508 14.4383 22.3503 14.3346 22.2786C14.2309 22.207 14.1069 22.1676 13.9792 22.1658Z" fill="white"/>
            <path d="M27.133 23.2457L29.8129 22.2312C29.8681 22.2103 29.9154 22.1738 29.9488 22.1267C29.9822 22.0796 30 22.0239 30 21.9669C30 21.9099 29.9822 21.8542 29.9488 21.8071C29.9154 21.76 29.8681 21.7236 29.8129 21.7026L27.133 20.6881C26.6587 20.5079 26.2278 20.2361 25.8671 19.8896C25.5063 19.543 25.2235 19.1291 25.0359 18.6733L23.9799 16.1157C23.958 16.0628 23.92 16.0175 23.871 15.9856C23.8219 15.9537 23.7641 15.9366 23.7048 15.9367C23.6456 15.9366 23.5877 15.9537 23.5386 15.9856C23.4896 16.0175 23.4516 16.0628 23.4297 16.1157L22.3737 18.6733C22.1866 19.1293 21.9039 19.5435 21.5431 19.8901C21.1824 20.2367 20.7512 20.5084 20.2766 20.6881L17.6144 21.7026C17.5593 21.7236 17.5119 21.76 17.4786 21.8071C17.4452 21.8542 17.4274 21.9099 17.4274 21.9669C17.4274 22.0239 17.4452 22.0796 17.4786 22.1267C17.5119 22.1738 17.5593 22.2103 17.6144 22.2312L20.2766 23.2457C20.7512 23.4255 21.1824 23.6971 21.5431 24.0437C21.9039 24.3903 22.1866 24.8045 22.3737 25.2605L23.4297 27.8181C23.4512 27.8715 23.4889 27.9175 23.538 27.9499C23.5871 27.9824 23.6452 27.9998 23.7048 28C23.7644 27.9998 23.8225 27.9824 23.8716 27.9499C23.9207 27.9175 23.9584 27.8715 23.9799 27.8181L25.0359 25.2605C25.2235 24.8048 25.5063 24.3908 25.8671 24.0443C26.2278 23.6977 26.6587 23.4259 27.133 23.2457Z" fill="white"/>
          </svg>
        );
      default:
        return (
          <svg width="29" height="18" viewBox="0 0 29 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M5.356 0L0 17.524H4.108L5.356 13.026H10.374L11.726 17.524H15.99L10.556 0H5.356ZM5.928 10.061L6.968 6.343C7.254 5.329 7.514 4.003 7.774 2.963H7.826C8.086 4.003 8.398 5.303 8.71 6.343L9.802 10.061H5.928Z" fill="white"/>
            <path d="M27.898 14.429V10.009C27.898 7.019 26.545 4.523 22.308 4.523C19.994 4.523 18.25 5.147 17.368 5.641L18.096 8.189C18.928 7.669 20.307 7.227 21.606 7.227C23.557 7.227 23.92 8.189 23.92 8.866V9.049C19.422 9.023 16.458 10.61 16.458 13.91C16.458 15.938 17.992 17.81 20.566 17.81C22.074 17.81 23.374 17.263 24.206 16.248H24.284L24.517 17.522H28.079C27.95 16.822 27.898 15.652 27.898 14.429ZM24.05 12.896C24.05 13.128 24.024 13.364 23.973 13.572C23.712 14.379 22.907 15.028 21.918 15.028C21.034 15.028 20.357 14.534 20.357 13.52C20.357 11.986 21.97 11.492 24.049 11.517L24.05 12.896Z" fill="white"/>
            <path d="M21.663 3.607L26.08 1.803L21.663 0V1.241H15.637V2.366H21.663V3.607Z" fill="white"/>
          </svg>
        );
    }
  };

  const getAdvancedAnswerLabel = (count: number) => {
    if (count === 1) return "На каждый вопрос 1 продвинутый ответ";
    if (count >= 2 && count <= 4) return `На каждый вопрос ${count} продвинутых ответа`;
    return `На каждый вопрос ${count} продвинутых ответов`;
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
      avatar2x: avatarUrl2x ?? undefined,
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
    likesCount: a.likes_count ?? 0,
    dislikesCount: a.dislikes_count ?? 0,
    user_vote: a.user_vote ?? null,
    createdAt: a.created_at,
    updatedAt: a.created_at,
  }));

  const renderUserFollowCard = (u: ProfileFollowUser, isSubscriberView: boolean) => {
    const tenure = u.created_at ? formatTimeAgo(u.created_at).replace(/\s+назад$/, "") : "недавно";
    const qCount = u.questions_count ?? 0;
    const aCount = u.answers_count ?? 0;
    const ballsLine = `${u.balls ?? 0} ${["балл", "балла", "баллов"][(u.balls ?? 0) % 10 === 1 && (u.balls ?? 0) % 100 !== 11 ? 0 : (u.balls ?? 0) % 10 >= 2 && (u.balls ?? 0) % 10 <= 4 && !((u.balls ?? 0) % 100 >= 12 && (u.balls ?? 0) % 100 <= 14) ? 1 : 2]}`;
    const showSubscribe = isSubscriberView && !u.subscribed_by_me;
    const followPremium = u.premium_is_active ?? u.is_premium ?? false;
    const followPremiumText = u.premium_is_permanent
      ? "Постоянный"
      : u.premium_package_name?.trim() || "Премиум";
    return (
      <div className="user-follow-card" key={u.id}>
        <div className="user-follow-left">
          <Link href={`/profile/${u.id}`}>
            <UserAvatar
              src={u.avatar_url}
              src2x={u.avatar_url_2x}
              alt={u.full_name || ""}
              premium={followPremium}
              premiumText={followPremiumText}
              size={51}
              imgClassName="user-follow-avatar"
            />
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
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
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
                    className={`profile_menu_item menu_item ${activeTab === "menu_packages" ? "active_menu" : ""}`}
                    data-id="menu_packages"
                    onClick={() => handleTabClick("menu_packages")}
                  >
                    <svg width="16" height="20">
                      <use xlinkHref="#vip"></use>
                    </svg>
                    <p className="main_text">Пакеты</p>
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
            <ProfileHeaderBlock
              variant="cabinet"
              premium={isPremiumUser}
              premiumBadgeText={premiumBadgeText}
              displayName={displayName}
              rankLabel={rankLabel}
              registeredInService={registeredInService}
              avatarUrl={avatarUrl || "/images/icons/avatar.svg"}
              avatarUrl2x={avatarUrl2x}
              ballsDisplay={ballsDisplay}
              kpdPercentDisplay={`${kpdPercent}%`}
              editableAvatar
              avatarInputRef={avatarInputRef}
              onAvatarPick={handleAvatarPick}
              avatarUploading={avatarUploading}
              cabinetFooter={
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
                    className={`profile_menu_item menu_item_m ${activeTab === "menu_packages" ? "active_menu" : ""}`}
                    data-id="menu_packages"
                    onClick={() => handleTabClick("menu_packages")}
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
              }
            />

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
                            isPremiumUser={isPremiumUser}
                            showVotes
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
                  levelName={rankLabel}
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

              {/* Таб: Пакеты подписок */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_packages" ? "active_menu" : ""}`}
                id="menu_packages"
              >
                <div className="user_profile_page_content profile-vip">
                  <div className="blocks_title">
                    <h2>Пакеты подписок</h2>
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
                    <div className="secondary_text" style={{ marginTop: 12, marginBottom: 20 }}>
                      {meUser.premium_is_active ? (
                        <>
                          Текущий тариф:{" "}
                          <strong>{meUser.premium_is_permanent ? "Постоянный" : (meUser.premium_package_name ?? "Премиум")}</strong>
                          {meUser.premium_is_permanent
                            ? " · действует постоянно"
                            : meUser.premium_until
                              ? ` · действует до ${new Date(meUser.premium_until).toLocaleString("ru-RU")}`
                              : ""}
                        </>
                      ) : (
                        <>Премиум сейчас не активен.</>
                      )}
                    </div>
                    {subscriptionPackagesLoading && subscriptionPackages.length === 0 ? (
                      <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
                        Загрузка…
                      </p>
                    ) : subscriptionPackages.length > 0 ? (
                      <div className="vip_plans_grid">
                        {subscriptionPackages.map((packageItem) => (
                          <div className="vip_plan_card" key={packageItem.id}>
                            {packageItem.is_recommended ? <div className="vip_recommended_badge">Рекомендуем</div> : null}
                            <div className="vip_plan_icon">{renderSubscriptionPackageIcon(packageItem.icon_key)}</div>
                            <h3 className="vip_plan_title">{packageItem.name}</h3>
                            <div className="vip_plan_price_container">
                              <span className="vip_plan_price_label">Цена</span>
                              <span className="vip_plan_price_value">{packageItem.monthly_price.toLocaleString("ru-RU")} ₽/Мес</span>
                            </div>
                            <ul className="vip_plan_features">
                              <li>
                                <CheckIcon />
                                <span>
                                  {packageItem.premium_questions_per_month === null
                                    ? "Безлимитные премиум вопросы"
                                    : `${packageItem.premium_questions_per_month} премиум вопросов в месяц`}
                                </span>
                              </li>
                              <li>
                                <CheckIcon />
                                <span>{getAdvancedAnswerLabel(packageItem.premium_answers_per_question)}</span>
                              </li>
                              <li>
                                <CheckIcon />
                                <span>Лимит X{packageItem.limit_multiplier}</span>
                              </li>
                            </ul>
                            <button
                              className="vip_buy_btn_card"
                              type="button"
                              onClick={() => void handlePurchasePackage(packageItem.id)}
                              disabled={packageCheckoutLoadingId === packageItem.id}
                            >
                              {packageCheckoutLoadingId === packageItem.id ? "Создание счёта…" : "Купить"}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
                        Пакеты пока не добавлены
                      </p>
                    )}
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
                        onClick={() => {
                          void playNotificationSound();
                        }}
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
                {dailyLimitsRows.length === 0 ? (
                  <p className="main_text" style={{ padding: "8px 0" }}>
                    Лимиты загружаются с сервера — обновите страницу.
                  </p>
                ) : (
                  dailyLimitsRows.map(({ value, label }) => (
                    <div key={label} className="profile_stats_item limits_stat_item">
                      <div className="stats_badge limits_badge">
                        <p className="main_text">{value}</p>
                      </div>
                      <p className="main_text">{label}</p>
                    </div>
                  ))
                )}
                <div className="limits_help">
                  {/* п.18 — ссылка на поддержку */}
                  <Link href="/faq" className="limits_help_link">Нужна помощь?</Link>
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
