"use client";

import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import SharePopup from "@/components/SharePopup";
import { formatTimeAgo } from "@/lib/time-ago";
import { api } from "@/lib/api-client";
import { getApiFullUrl } from "@/config/api";
import { getToken } from "@/lib/cookies";
import { persistThemePreference } from "@/lib/theme-cookie";
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
import ProfileMenuListMob from "@/components/profile/ProfileMenuListMob";
import UserAvatar from "@/components/UserAvatar";
import { HydrationSafeInput, HydrationSafeTextarea } from "@/components/HydrationSafeInput";
import { ProfileLevelsMenuInner, ProfileRulesMenuInner } from "./ProfileLevelsRulesContent";
import ProfileWeeklyLeadersSidebar from "@/components/ProfileWeeklyLeadersSidebar";
import {
  compactCountTitle,
  formatCompactCount,
  formatCompactNumWord,
} from "@/lib/format-compact-count";
import VipPlansGrid from "@/components/profile/VipPlansGrid";
import ProfileSecuritySettings from "@/components/profile/ProfileSecuritySettings";
import { useSearchParams } from "next/navigation";
import type { SubscriptionPackage } from "@/types";
import { displayUserName, displayUserSubtitle, displayPremiumBadge } from "@/lib/ai-user-display";
import { showSystemToast } from "@/store/systemToastStore";
import { getFormApiErrorMessage } from "@/lib/form-api-error-message";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { validateAvatarFile } from "@/lib/avatar-validation";
import {
  sanitizeUserFirstNameInput,
  USER_FIRST_NAME_MAX_LENGTH,
  validateUserFirstName,
} from "@/lib/user-first-name";
import { playNotificationSound } from "@/lib/notification-sound";
import { usePageStickySidebars } from "@/hooks/usePageStickySidebars";

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
  const { wrapperRef, leftSidebarRef, rightSidebarRef } = usePageStickySidebars();
  const BIO_MAX_LENGTH = 250;

  // Мок-данные текущего пользователя (fallback, если в API пусто)
  const user = mockUsers[0];
  const isMyProfile = true;
  const meUser = authUser ?? initialMe.user;
  const initialName = meUser.first_name?.trim() || user.displayName;
  const initialDescription = meUser.description ?? "";
  const [profileName, setProfileName] = useState(
    () => initialMe.user.first_name?.trim() || user.displayName,
  );
  const [profileDescription, setProfileDescription] = useState(
    () => initialMe.user.description ?? "",
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const isPremiumUser = Boolean(
    (meUser.premium_is_active ?? meUser.is_premium) ||
      meUser.vip ||
      (typeof meUser.vip_status === "number" ? meUser.vip_status > 0 : meUser.vip_status),
  );

  const dailyLimitsRows = useMemo(() => {
    const remaining = meUser.daily_action_remaining ?? meUser.daily_action_limits;
    if (!remaining) {
      return [] as { value: string; label: string }[];
    }
    const fmt = (v: number | null | undefined) =>
      v === null || v === undefined ? "∞" : String(v);

    return [
      { value: fmt(remaining.ask_question), label: "Вопросы" },
      { value: fmt(remaining.answer), label: "Ответов" },
      { value: fmt(remaining.answer_comment), label: "Комментариев" },
      { value: fmt(remaining.vote_best), label: "Голосов за ответ" },
      { value: fmt(remaining.vote_question), label: "Оценок вопроса" },
      { value: fmt(remaining.file), label: "Фото" },
      { value: fmt(remaining.video), label: "Видео" },
    ];
  }, [meUser]);
  const premiumBadgeText = displayPremiumBadge(meUser) ?? "Премиум";
  const isAiUser = Boolean(meUser.is_ai);
  const displayName = displayUserName(meUser);
  const rankLabel = displayUserSubtitle(meUser);
  const avatarUrl = meUser.avatar_url || user.avatar;
  const avatarUrl2x = meUser.avatar_url_2x ?? null;
  const ballsRaw = meUser.balls ?? user.rating;
  const balls = isAiUser ? 0 : ballsRaw;
  const ballsDisplay = isAiUser ? "∞" : formatCompactCount(ballsRaw);
  const ballsTitle = isAiUser ? undefined : compactCountTitle(ballsRaw);
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
    const nameError = validateUserFirstName(profileName);
    if (nameError) {
      showSystemToast(nameError, "error");
      return;
    }
    const trimmedName = profileName.trim();
    setProfileSaving(true);
    try {
      await api.post<{ user?: { first_name?: string; description?: string | null } }>(
        "v1/me/profile",
        {
          first_name: trimmedName,
          description: profileDescription.trim() || null,
        },
      );
      patchUser({
        first_name: trimmedName,
        description: profileDescription.trim() || null,
      });
      setProfileName(trimmedName);
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
    if (avatarUploading) {
      e.target.value = "";
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = await validateAvatarFile(file);
    if (validationError) {
      showSystemToast(validationError, "error");
      e.target.value = "";
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/login");
      e.target.value = "";
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
      if (!res.ok) {
        showSystemToast(
          getFormApiErrorMessage(data, "Не удалось загрузить аватар. Проверьте формат и размер."),
          "error",
        );
        return;
      }
      const payload = data as { message?: string; avatar_url?: string; avatar_url_2x?: string | null };
      if (payload.avatar_url) {
        patchUser({
          avatar_url: payload.avatar_url,
          avatar_url_2x: payload.avatar_url_2x ?? null,
        });
      }
      showSystemToast(payload.message?.trim() || "Аватар обновлён", "success");
    } catch {
      showSystemToast("Не удалось загрузить аватар. Проверьте соединение и попробуйте снова.", "error");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }, [avatarUploading, patchUser, router]);

  const handleSettingsSave = useCallback(async () => {
    setSettingsSaving(true);
    try {
      await api.put("v1/me/settings", { settings: settingsDraft });
      patchUser({ settings: settingsDraft });
      persistThemePreference(settingsDraft.site.color_theme);
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
        return;
      }
      showSystemToast("Не удалось получить ссылку на оплату. Попробуйте позже.", "error");
    } catch (err) {
      showSystemToast(getApiErrorMessage(err), "error");
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
    const ballsLine = formatCompactNumWord(u.balls ?? 0, ["балл", "балла", "баллов"]);
    const showSubscribe = isSubscriberView && !u.subscribed_by_me;
    const followPremium = u.premium_is_active ?? u.is_premium ?? false;
    const followPremiumText = displayPremiumBadge(u) ?? "Премиум";
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
            <Link
              href={`/profile/${u.id}`}
              className="user-follow-name"
              title={u.full_name || undefined}
            >
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
            <span className="user-follow-stat-bold" title={compactCountTitle(u.balls ?? 0)}>
              {ballsLine}
            </span>
          </div>
          <div className="user-follow-stats-qa">
            <div className="user-follow-stat">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M10.8182 0H3.18182C2.33826 0.00101045 1.52954 0.336559 0.933049 0.933043C0.336561 1.52953 0.00101045 2.33824 0 3.1818V8.27267C0.000925606 9.00589 0.254603 9.71637 0.718275 10.2844C1.18195 10.8524 1.82726 11.2431 2.54545 11.3908V13.3635C2.54544 13.4788 2.5767 13.5918 2.6359 13.6906C2.6951 13.7895 2.78002 13.8704 2.8816 13.9247C2.98319 13.9791 3.09762 14.0048 3.21269 13.9993C3.32777 13.9937 3.43916 13.9569 3.535 13.893L7.19091 11.4545H10.8182C11.6617 11.4535 12.4705 11.1179 13.067 10.5214C13.6634 9.92494 13.999 9.11623 14 8.27267V3.1818C13.999 2.33824 13.6634 1.52953 13.067 0.933043C12.4705 0.336559 11.6617 0.00101045 10.8182 0ZM9.54545 7.63631H4.45455C4.28577 7.63631 4.12391 7.56927 4.00457 7.44993C3.88523 7.33059 3.81818 7.16873 3.81818 6.99995C3.81818 6.83118 3.88523 6.66932 4.00457 6.54998C4.12391 6.43064 4.28577 6.36359 4.45455 6.36359H9.54545C9.71423 6.36359 9.87609 6.43064 9.99543 6.54998C10.1148 6.66932 10.1818 6.83118 10.1818 6.99995C10.1818 7.16873 10.1148 7.33059 9.99543 7.44993C9.87609 7.56927 9.71423 7.63631 9.54545 7.63631ZM10.8182 5.09087H3.18182C3.01304 5.09087 2.85118 5.02383 2.73184 4.90449C2.6125 4.78515 2.54545 4.62329 2.54545 4.45452C2.54545 4.28574 2.6125 4.12388 2.73184 4.00454C2.85118 3.8852 3.01304 3.81816 3.18182 3.81816H10.8182C10.987 3.81816 11.1488 3.8852 11.2682 4.00454C11.3875 4.12388 11.4545 4.28574 11.4545 4.45452C11.4545 4.62329 11.3875 4.78515 11.2682 4.90449C11.1488 5.02383 10.987 5.09087 10.8182 5.09087Z"
                  fill="#6069FF"
                />
              </svg>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                <span className="user-follow-stat-gray" title={compactCountTitle(qCount)}>
                  {formatCompactCount(qCount)}
                </span>
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
                <span className="user-follow-stat-gray" title={compactCountTitle(aCount)}>
                  {formatCompactCount(aCount)}
                </span>
                <span className="user-follow-stat-gray">ответов</span>
              </div>
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
      <div className="container">
        {/* Хлебные крошки */}
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Профиль", href: "/profile" },
          ]}
        />

        {/* profile page */}
        <div className="profile_page" ref={wrapperRef}>
          <div className="profile_menu_column" ref={leftSidebarRef}>
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
                    title="Редактировать профиль"
                    onClick={() => handleTabClick("menu2")}
                  >
                    <svg width="15.714844" height="20.000000">
                      <use xlinkHref="/sprites.svg#profile"></use>
                    </svg>
                    <p className="main_text">Редактировать профиль</p>
                  </div>
                  <Link href="/notifications" className="profile_menu_item menu_item" title="Уведомления">
                    <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden>
                      <path d="M15.6636 13.8085C15.5945 13.7192 15.5267 13.6299 15.4601 13.5438C14.5442 12.3558 13.9901 11.6388 13.9901 8.27589C13.9901 6.53482 13.6016 5.10625 12.836 4.03482C12.2715 3.2433 11.5084 2.64286 10.5026 2.19911C10.4896 2.19139 10.4781 2.18126 10.4684 2.1692C10.1067 0.870089 9.11666 0 8.0001 0C6.88355 0 5.89396 0.870089 5.53219 2.16786C5.52253 2.17948 5.51113 2.18928 5.49846 2.19688C3.15128 3.23304 2.01057 5.22098 2.01057 8.27455C2.01057 11.6388 1.45729 12.3558 0.540562 13.5424C0.473952 13.6286 0.406092 13.7161 0.336984 13.8071C0.158468 14.038 0.0453637 14.3189 0.0110561 14.6165C-0.0232514 14.9141 0.0226739 15.2161 0.143397 15.4866C0.400264 16.067 0.947719 16.4272 1.57261 16.4272H14.4322C15.0542 16.4272 15.5979 16.0674 15.8556 15.4897C15.9768 15.2191 16.0232 14.917 15.9892 14.619C15.9551 14.321 15.8422 14.0397 15.6636 13.8085Z" />
                      <path d="M8.0001 20C8.60169 19.9995 9.19194 19.8244 9.70823 19.4932C10.2245 19.1621 10.6476 18.6873 10.9326 18.1192C10.9461 18.092 10.9527 18.0615 10.9519 18.0307C10.9511 17.9999 10.9429 17.9699 10.928 17.9435C10.9132 17.9171 10.8922 17.8953 10.8672 17.8802C10.8422 17.865 10.814 17.8571 10.7853 17.8571H5.21579C5.18703 17.857 5.15874 17.8649 5.13366 17.88C5.10859 17.8951 5.08759 17.9169 5.07271 17.9433C5.05783 17.9697 5.04957 17.9998 5.04874 18.0306C5.04792 18.0614 5.05455 18.0919 5.06799 18.1192C5.35298 18.6872 5.776 19.162 6.29221 19.4931C6.80843 19.8242 7.39858 19.9994 8.0001 20Z" />
                    </svg>
                    <p className="main_text">Уведомления</p>
                  </Link>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                    data-id="menu_levels"
                    title="Уровни"
                    onClick={() => handleTabClick("menu_levels")}
                  >
                    <svg width="13" height="20">
                      <use xlinkHref="/sprites.svg#levels"></use>
                    </svg>
                    <p className="main_text">Уровни</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                    data-id="menu_rules"
                    title="Ограничения"
                    onClick={() => handleTabClick("menu_rules")}
                  >
                    <svg width="20" height="17">
                      <use xlinkHref="/sprites.svg#rules"></use>
                    </svg>
                    <p className="main_text">Ограничения</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_packages" ? "active_menu" : ""}`}
                    data-id="menu_packages"
                    title="Пакеты"
                    onClick={() => handleTabClick("menu_packages")}
                  >
                    <svg width="16" height="20">
                      <use xlinkHref="/sprites.svg#vip"></use>
                    </svg>
                    <p className="main_text">Пакеты</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu4" ? "active_menu" : ""}`}
                    data-id="menu4"
                    title="Настройки"
                    onClick={() => handleTabClick("menu4")}
                  >
                    <svg width="20.000000" height="20.000000">
                      <use xlinkHref="/sprites.svg#settings"></use>
                    </svg>
                    <p className="main_text">Настройки</p>
                  </div>
                  <div
                    className="profile_menu_item menu_item"
                    title="Выход"
                    onClick={handleLogout}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                  >
                    <svg width="20" height="20" aria-hidden>
                      <use xlinkHref="/sprites.svg#logout-profile" />
                    </svg>
                    <p className="main_text">Выход</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="profile_menu_weekly profile_menu_weekly--sidebar">
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
              ballsTitle={ballsTitle}
              kpdPercentDisplay={`${kpdPercent}%`}
              editableAvatar
              avatarInputRef={avatarInputRef}
              onAvatarPick={handleAvatarPick}
              avatarUploading={avatarUploading}
              cabinetFooter={
                <ProfileMenuListMob>
                  <div
                    className={`profile_menu_item menu_item_m ${activeTab === "menu2" ? "active_menu" : ""}`}
                    data-id="menu2"
                    title="Редактировать профиль"
                    onClick={() => handleTabClick("menu2")}
                  >
                    <svg width="15.714844" height="20.000000">
                      <use xlinkHref="/sprites.svg#profile"></use>
                    </svg>
                  </div>
                  <Link href="/notifications" className="profile_menu_item menu_item_m" title="Уведомления">
                    <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden>
                      <path d="M15.6636 13.8085C15.5945 13.7192 15.5267 13.6299 15.4601 13.5438C14.5442 12.3558 13.9901 11.6388 13.9901 8.27589C13.9901 6.53482 13.6016 5.10625 12.836 4.03482C12.2715 3.2433 11.5084 2.64286 10.5026 2.19911C10.4896 2.19139 10.4781 2.18126 10.4684 2.1692C10.1067 0.870089 9.11666 0 8.0001 0C6.88355 0 5.89396 0.870089 5.53219 2.16786C5.52253 2.17948 5.51113 2.18928 5.49846 2.19688C3.15128 3.23304 2.01057 5.22098 2.01057 8.27455C2.01057 11.6388 1.45729 12.3558 0.540562 13.5424C0.473952 13.6286 0.406092 13.7161 0.336984 13.8071C0.158468 14.038 0.0453637 14.3189 0.0110561 14.6165C-0.0232514 14.9141 0.0226739 15.2161 0.143397 15.4866C0.400264 16.067 0.947719 16.4272 1.57261 16.4272H14.4322C15.0542 16.4272 15.5979 16.0674 15.8556 15.4897C15.9768 15.2191 16.0232 14.917 15.9892 14.619C15.9551 14.321 15.8422 14.0397 15.6636 13.8085Z" />
                      <path d="M8.0001 20C8.60169 19.9995 9.19194 19.8244 9.70823 19.4932C10.2245 19.1621 10.6476 18.6873 10.9326 18.1192C10.9461 18.092 10.9527 18.0615 10.9519 18.0307C10.9511 17.9999 10.9429 17.9699 10.928 17.9435C10.9132 17.9171 10.8922 17.8953 10.8672 17.8802C10.8422 17.865 10.814 17.8571 10.7853 17.8571H5.21579C5.18703 17.857 5.15874 17.8649 5.13366 17.88C5.10859 17.8951 5.08759 17.9169 5.07271 17.9433C5.05783 17.9697 5.04957 17.9998 5.04874 18.0306C5.04792 18.0614 5.05455 18.0919 5.06799 18.1192C5.35298 18.6872 5.776 19.162 6.29221 19.4931C6.80843 19.8242 7.39858 19.9994 8.0001 20Z" />
                    </svg>
                  </Link>
                  <div
                    className={`profile_menu_item menu_item_m ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                    data-id="menu_levels"
                    title="Уровни"
                    onClick={() => handleTabClick("menu_levels")}
                  >
                    <svg width="13" height="20">
                      <use xlinkHref="/sprites.svg#levels"></use>
                    </svg>
                  </div>
                  <div
                    className={`profile_menu_item menu_item_m ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                    data-id="menu_rules"
                    title="Ограничения"
                    onClick={() => handleTabClick("menu_rules")}
                  >
                    <svg width="20" height="17">
                      <use xlinkHref="/sprites.svg#rules"></use>
                    </svg>
                  </div>
                  <div
                    className={`profile_menu_item menu_item_m ${activeTab === "menu_packages" ? "active_menu" : ""}`}
                    data-id="menu_packages"
                    title="Пакеты"
                    onClick={() => handleTabClick("menu_packages")}
                  >
                    <svg width="16" height="20">
                      <use xlinkHref="/sprites.svg#vip"></use>
                    </svg>
                  </div>
                  <div
                    className={`profile_menu_item menu_item_m ${activeTab === "menu4" ? "active_menu" : ""}`}
                    data-id="menu4"
                    title="Настройки"
                    onClick={() => handleTabClick("menu4")}
                  >
                    <svg width="20" height="20">
                      <use xlinkHref="/sprites.svg#settings"></use>
                    </svg>
                  </div>
                  <div
                    className="profile_menu_item menu_item_m"
                    onClick={handleLogout}
                    role="button"
                    title="Выход"
                  >
                    <svg width="20" height="20" aria-hidden>
                      <use xlinkHref="/sprites.svg#logout-profile" />
                    </svg>
                  </div>
                </ProfileMenuListMob>
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
                              <use xlinkHref="/sprites.svg#sync"></use>
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
                      <div className="answers_list_profile">
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
                              <use xlinkHref="/sprites.svg#sync"></use>
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
                  <div className="answers_list_profile" style={{ position: "relative" }}>
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
                        <svg width="22" height="22"><use xlinkHref="/sprites.svg#sync"></use></svg>
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
                  <div className="answers_list_profile" style={{ position: "relative" }}>
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
                        <svg width="22" height="22"><use xlinkHref="/sprites.svg#sync"></use></svg>
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
                  onBuyVip={() => handleTabClick("menu_packages")}
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
                        <HydrationSafeInput
                          type="text"
                          placeholder="Ваше имя"
                          value={profileName}
                          onChange={(e) => setProfileName(sanitizeUserFirstNameInput(e.target.value))}
                          maxLength={USER_FIRST_NAME_MAX_LENGTH}
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
                          <HydrationSafeTextarea
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
                          <strong>{meUser.premium_package_name ?? (meUser.premium_is_permanent ? "Постоянный" : "Премиум")}</strong>
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
                    <VipPlansGrid
                      packages={subscriptionPackages}
                      loading={subscriptionPackagesLoading}
                      checkoutLoadingId={packageCheckoutLoadingId}
                      onPurchase={(packageId) => void handlePurchasePackage(packageId)}
                    />
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                          <use xlinkHref="/sprites.svg#play-sound"></use>
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
                        <HydrationSafeInput
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
                        <HydrationSafeInput
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
                          <HydrationSafeInput
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
                          <HydrationSafeInput
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
                          <HydrationSafeInput
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

                  <ProfileSecuritySettings />
                </div>
              </div>
            </div>
          </div>

          <div className="line"></div>

          <div className="profile_stats_column" ref={rightSidebarRef}>
          <div className="profile_stats">
            <div className="profile_stats_list">
              <div className={`profile_stats_item ${activeTab === "menu1" ? "active" : ""}`} onClick={() => handleTabClick("menu1")} style={{ cursor: "pointer" }}>
                <p className="main_text">Вопросы</p>
                <div className="stats_badge">
                  <p className="main_text" title={compactCountTitle(meUser.questions_count ?? user.questionsCount)}>
                    {formatCompactCount(meUser.questions_count ?? user.questionsCount)}
                  </p>
                </div>
              </div>
              <div className={`profile_stats_item ${activeTab === "menu_answers" ? "active" : ""}`} onClick={() => handleTabClick("menu_answers")} style={{ cursor: "pointer" }}>
                <p className="main_text">Ответы</p>
                <div className="stats_badge">
                  <p className="main_text" title={compactCountTitle(meUser.answers_count ?? user.answersCount)}>
                    {formatCompactCount(meUser.answers_count ?? user.answersCount)}
                  </p>
                </div>
              </div>
              <div className={`profile_stats_item ${activeTab === "menu_subscriptions" ? "active" : ""}`} onClick={() => handleTabClick("menu_subscriptions")} style={{ cursor: "pointer" }}>
                <p className="main_text">Подписки</p>
                <div className="stats_badge">
                  <p className="main_text" title={compactCountTitle(meUser.subscriptions_count ?? subscriptions.length)}>
                    {formatCompactCount(meUser.subscriptions_count ?? subscriptions.length)}
                  </p>
                </div>
              </div>
              <div className={`profile_stats_item ${activeTab === "menu_subscribers" ? "active" : ""}`} onClick={() => handleTabClick("menu_subscribers")} style={{ cursor: "pointer" }}>
                <p className="main_text">Подписчики</p>
                <div className="stats_badge">
                  <p className="main_text" title={compactCountTitle(meUser.subscribers_count ?? subscribers.length)}>
                    {formatCompactCount(meUser.subscribers_count ?? subscribers.length)}
                  </p>
                </div>
              </div>
            </div>
            <>
              <div className="blocks_title" style={{ marginTop: "24px" }}>
                <h2>Остаток на день</h2>
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

          <div className="profile_menu_weekly profile_menu_weekly--inline">
            <ProfileWeeklyLeadersSidebar initialWidgets={initialWidgets} />
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
