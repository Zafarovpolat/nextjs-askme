"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Header.module.css";
import { api } from "@/lib/api-client";
import {
  getNotificationPopupsEnabled,
  getToken,
  setNotificationPopupsEnabled,
} from "@/lib/cookies";
import { formatTimeAgo } from "@/lib/time-ago";
import { isNotificationSoundEnabled, playNotificationSound } from "@/lib/notification-sound";
import {
  createNotificationEcho,
  disconnectNotificationEcho,
} from "@/lib/notification-echo";
import {
  isNotificationCreatedEvent,
  parseNotificationCreatedPayload,
} from "@/lib/notification-realtime";
import { useAuthStore, type AuthNotification } from "@/store/authStore";

type NotificationItem = {
  id: number;
  title?: string | null;
  hint?: string | null;
  url?: string | null;
  text: string;
  is_read: boolean;
  data?: Record<string, unknown> | null;
  created_at: string;
};

type MeLoadedNotification = AuthNotification;

type NotificationsPageResponse = {
  notifications: NotificationItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type RealtimeConfigResponse = {
  channel: string;
  subscription_type: "private";
  auth_endpoint: string;
  driver: string;
  key: string;
  websocket: {
    host: string;
    port: number;
    scheme: string;
  };
};

const DEFAULT_AVATAR = "/images/icons/avatar.svg";
const PAGE_SIZE = 10;
const POPUP_VISIBLE_MS = 4500;
const POPUP_LIMIT = 3;
let realtimeConfigPromise: Promise<RealtimeConfigResponse> | null = null;

const toTimestamp = (value: string): number => {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const normalizeText = (text: string, limit = 140): string => {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= limit) {
    return clean;
  }
  return `${clean.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
};

const normalizeNotification = (notification: NotificationItem): NotificationItem => ({
  ...notification,
  title: notification.title?.trim() || null,
  hint: notification.hint?.trim() || null,
  url: notification.url?.trim() || null,
  text: normalizeText(notification.text),
  is_read: Boolean(notification.is_read),
  created_at: notification.created_at,
});

const sortNotifications = (items: NotificationItem[]): NotificationItem[] => {
  const byId = new Map<number, NotificationItem>();
  items.forEach((item) => {
    byId.set(item.id, normalizeNotification(item));
  });

  return Array.from(byId.values()).sort(
    (a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at),
  );
};

const getRealtimeConfig = async (): Promise<RealtimeConfigResponse> => {
  if (!realtimeConfigPromise) {
    realtimeConfigPromise = api
      .get<RealtimeConfigResponse>("v1/notifications/realtime")
      .catch((error) => {
        realtimeConfigPromise = null;
        throw error;
      });
  }

  return realtimeConfigPromise;
};

function NotificationCard({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: (notification: NotificationItem) => void;
}) {
  const createdAtText = formatTimeAgo(notification.created_at);
  const hasLink = Boolean(notification.url);
  const secondaryText = notification.hint ? notification.hint : createdAtText;

  const content = (
    <>
      <div className={styles.notificationHeader}>
        <img
          src={DEFAULT_AVATAR}
          alt=""
          className={styles.notificationAvatar}
        />
        <div className={styles.notificationInfo}>
          {notification.title ? (
            <div className={styles.notificationTitleLine}>{notification.title}</div>
          ) : null}
          <div className={styles.notificationTime}>{secondaryText}</div>
        </div>
      </div>

      <div className={styles.notificationText}>{notification.text}</div>
    </>
  );

  const className = `${styles.notificationCard} ${notification.is_read ? styles.notificationCardRead : styles.notificationCardUnread}`;

  if (hasLink && notification.url) {
    return (
      <Link
        href={notification.url}
        className={className}
        onClick={() => onClick(notification)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick(notification)}
    >
      {content}
    </button>
  );
}

export default function NotificationBtnRealtime() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const userSettings = useAuthStore((s) => s.user?.settings);
  const meNotifications = useAuthStore((s) => s.notifications);
  const isMeReady = useAuthStore((s) => s.isAuthorized === 1 && !s.isLoading);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(
    () => getNotificationPopupsEnabled(),
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [popups, setPopups] = useState<NotificationItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const echoRef = useRef<any>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const lastPageRef = useRef(Number.POSITIVE_INFINITY);
  const popupTimersRef = useRef<Map<number, number>>(new Map());
  const notificationsEnabledRef = useRef(notificationsEnabled);
  const soundEnabledRef = useRef(isNotificationSoundEnabled(userSettings));
  const seededFromMeRef = useRef(false);

  const clearPopupTimers = useCallback(() => {
    popupTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    popupTimersRef.current.clear();
  }, []);

  const disconnectEcho = useCallback(() => {
    disconnectNotificationEcho();
    echoRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    setNotifications([]);
    setPopups([]);
    setCurrentPage(1);
    setLastPage(Number.POSITIVE_INFINITY);
    pageRef.current = 1;
    lastPageRef.current = Number.POSITIVE_INFINITY;
    loadingRef.current = false;
    clearPopupTimers();
  }, [clearPopupTimers]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
    setNotificationPopupsEnabled(notificationsEnabled);
  }, [notificationsEnabled]);

  useEffect(() => {
    soundEnabledRef.current = isNotificationSoundEnabled(userSettings);
  }, [userSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      disconnectEcho();
      clearPopupTimers();
    };
  }, [clearPopupTimers, disconnectEcho]);

  useEffect(() => {
    seededFromMeRef.current = false;
    if (!userId) {
      resetState();
    }
  }, [resetState, userId]);

  useEffect(() => {
    if (!userId || !isMeReady || seededFromMeRef.current) {
      return;
    }

    setNotifications(sortNotifications((meNotifications ?? []) as MeLoadedNotification[]));
    setCurrentPage(1);
    setLastPage(Number.POSITIVE_INFINITY);
    pageRef.current = 1;
    lastPageRef.current = Number.POSITIVE_INFINITY;
    seededFromMeRef.current = true;
  }, [isMeReady, meNotifications, userId]);

  const addPopup = useCallback((notification: NotificationItem) => {
    setPopups((prev) => {
      const next = [notification, ...prev.filter((item) => item.id !== notification.id)];
      return next.slice(0, POPUP_LIMIT);
    });

    const existingTimer = popupTimersRef.current.get(notification.id);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(() => {
      setPopups((prev) => prev.filter((item) => item.id !== notification.id));
      popupTimersRef.current.delete(notification.id);
    }, POPUP_VISIBLE_MS);

    popupTimersRef.current.set(notification.id, timer);
  }, []);

  const markAsReadLocal = useCallback((notificationId: number) => {
    useAuthStore.getState().markNotificationsRead([notificationId]);
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item,
      ),
    );
  }, []);

  const markAsReadRemote = useCallback(async (notificationId: number) => {
    try {
      await api.post("v1/notifications/mark-read", { ids: [notificationId] });
      // Ответ «Уже прочитаны» тоже 200 — в БД уже is_read; стор всё равно приводим к актуальному.
      useAuthStore.getState().markNotificationsRead([notificationId]);
    } catch {
      // локальное состояние уже обновлено; сетевую ошибку не блокируем
    }
  }, []);

  const reloadNotificationsFirstPage = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const data = await api.get<NotificationsPageResponse>(
        `v1/notifications?page=1&per_page=${PAGE_SIZE}`,
      );

      const nextItems = (data.notifications ?? []).map(normalizeNotification);
      setNotifications(sortNotifications(nextItems));
      pageRef.current = data.current_page ?? 1;
      lastPageRef.current = data.last_page ?? 1;
      setCurrentPage(pageRef.current);
      setLastPage(lastPageRef.current);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (markingAllRead || !notifications.some((item) => !item.is_read)) {
      return;
    }

    setMarkingAllRead(true);

    try {
      await api.post("v1/notifications/mark-all-read");
      useAuthStore.getState().markAllNotificationsRead();
      clearPopupTimers();
      setPopups([]);
      await reloadNotificationsFirstPage();
    } catch {
      // ошибка сети — список не трогаем
    } finally {
      setMarkingAllRead(false);
    }
  }, [clearPopupTimers, markingAllRead, notifications, reloadNotificationsFirstPage]);

  const openNotification = useCallback(
    (notification: NotificationItem) => {
      if (!notification.is_read) {
        markAsReadLocal(notification.id);
        void markAsReadRemote(notification.id);
      }

      const popupTimer = popupTimersRef.current.get(notification.id);
      if (popupTimer) {
        window.clearTimeout(popupTimer);
        popupTimersRef.current.delete(notification.id);
      }
      setPopups((prev) => prev.filter((item) => item.id !== notification.id));

      if (notification.url) {
        setIsOpen(false);
        router.push(notification.url);
      }
    },
    [markAsReadLocal, markAsReadRemote, router],
  );

  const pushIncomingNotification = useCallback(
    (notification: NotificationItem) => {
      const next = normalizeNotification(notification);

      setNotifications((prev) =>
        sortNotifications([...prev.filter((item) => item.id !== next.id), next]),
      );

      if (!next.is_read) {
        if (notificationsEnabledRef.current) {
          addPopup(next);
        }
        if (soundEnabledRef.current) {
          void playNotificationSound();
        }
      }
    },
    [addPopup],
  );

  const pushIncomingNotificationRef = useRef(pushIncomingNotification);
  useEffect(() => {
    pushIncomingNotificationRef.current = pushIncomingNotification;
  }, [pushIncomingNotification]);

  const handleRealtimeNotificationEvent = useCallback(
    (eventName: string, payload: unknown) => {
      if (!isNotificationCreatedEvent(eventName)) {
        return;
      }

      const notification = parseNotificationCreatedPayload(payload);
      if (!notification) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[notifications] Не удалось разобрать payload:", payload);
        }
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.debug("[notifications] Realtime уведомление:", notification);
      }

      pushIncomingNotificationRef.current(notification);
    },
    [],
  );

  const loadNotifications = useCallback(async (pageToLoad = 1) => {
    if (loadingRef.current) {
      return;
    }

    if (pageToLoad <= 1) {
      return;
    }

    if (pageToLoad > lastPageRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const data = await api.get<NotificationsPageResponse>(
        `v1/notifications?page=${pageToLoad}&per_page=${PAGE_SIZE}`,
      );

      const nextItems = (data.notifications ?? []).map(normalizeNotification);
      setNotifications((prev) => sortNotifications([...prev, ...nextItems]));

      pageRef.current = data.current_page ?? pageToLoad;
      lastPageRef.current = data.last_page ?? Math.max(pageToLoad, pageRef.current);
      setCurrentPage(pageRef.current);
      setLastPage(lastPageRef.current);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      disconnectEcho();
      resetState();
      return;
    }

    const token = getToken();
    if (!token) {
      disconnectEcho();
      resetState();
      return;
    }

    let cancelled = false;

    const connect = async () => {
      try {
        const realtime = await getRealtimeConfig();

        if (cancelled) {
          return;
        }

        disconnectEcho();

        const echo = await createNotificationEcho(userId, token, realtime);
        if (cancelled) {
          return;
        }

        echoRef.current = echo;

        const channel = echo.private(realtime.channel);

        channel.listen(".notification.created", (payload: unknown) => {
          handleRealtimeNotificationEvent("notification.created", payload);
        });

        channel.error((error: unknown) => {
          console.warn("[notifications] Ошибка подписки на канал:", error);
        });

        if (process.env.NODE_ENV === "development") {
          echo.connector.pusher.connection.bind("state_change", (states: { current: string }) => {
            console.debug("[notifications] WebSocket:", states.current);
          });
          echo.connector.pusher.connection.bind("error", (error: unknown) => {
            console.warn("[notifications] WebSocket error:", error);
          });
        }
      } catch (error) {
        console.warn("[notifications] Не удалось подключить realtime:", error);
      }
    };

    void connect();

    return () => {
      cancelled = true;
      disconnectEcho();
    };
  }, [disconnectEcho, handleRealtimeNotificationEvent, resetState, userId]);

  useEffect(() => {
    if (!isOpen || !userId) {
      return;
    }

    void reloadNotificationsFirstPage();
  }, [isOpen, reloadNotificationsFirstPage, userId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          notifications.length > 0 &&
          pageRef.current < lastPageRef.current &&
          !loadingRef.current
        ) {
          void loadNotifications(pageRef.current + 1);
        }
      },
      {
        root,
        rootMargin: "120px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isOpen, loadNotifications, notifications.length]);

  const unreadNotifications = notifications.filter((item) => !item.is_read);
  const readNotifications = notifications.filter((item) => item.is_read);

  return (
    <div ref={wrapperRef} className={styles.notificationWrapper}>
      <button
        className="theme-toggle-btn mode_toggler"
        title="Уведомления"
        aria-label="Уведомления"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect className="notif-bell-bg" width="50" height="50" rx="12" fill="white" />
          <g transform="translate(16.5, 15)">
            <path
              d="M16.6426 13.8085C16.5692 13.7192 16.4971 13.6299 16.4263 13.5438C15.4532 12.3558 14.8644 11.6388 14.8644 8.27589C14.8644 6.53482 14.4517 5.10625 13.6383 4.03482C13.0385 3.2433 12.2277 2.64286 11.159 2.19911C11.1318 2.18385 11.1182 2.15359 11.109 2.12382C10.7137 0.849869 9.67259 0 8.50011 0C7.32737 0 6.28646 0.850251 5.89143 2.12339C5.88239 2.15253 5.86869 2.18189 5.84212 2.19688C3.34823 3.23304 2.13623 5.22098 2.13623 8.27455C2.13623 11.6388 1.54837 12.3558 0.574347 13.5424C0.503574 13.6286 0.431473 13.7161 0.358045 13.8071C0.168372 14.038 0.0481989 14.3189 0.0117471 14.6165C-0.0247047 14.9141 0.024091 15.2161 0.152359 15.4866C0.42528 16.067 1.00695 16.4272 1.6709 16.4272H15.3342C15.995 16.4272 16.5727 16.0674 16.8465 15.4897C16.9754 15.2191 17.0246 14.917 16.9885 14.619C16.9523 14.321 16.8323 14.0397 16.6426 13.8085Z"
              fill="#6069FF"
            />
            <path
              d="M8.50011 20C9.1393 19.9995 9.76643 19.8244 10.315 19.4932C10.8636 19.1621 11.3131 18.6873 11.6159 18.1192C11.6302 18.092 11.6372 18.0615 11.6364 18.0307C11.6355 17.9999 11.6268 17.9699 11.611 17.9435C11.5953 17.9171 11.573 17.8953 11.5464 17.8802C11.5199 17.865 11.4898 17.8571 11.4593 17.8571H5.54177C5.51122 17.857 5.48116 17.8649 5.45452 17.88C5.42787 17.8951 5.40556 17.9169 5.38975 17.9433C5.37394 17.9697 5.36517 17.9998 5.36429 18.0306C5.36341 18.0614 5.37046 18.0919 5.38474 18.1192C5.68754 18.6872 6.137 19.162 6.68548 19.4931C7.23395 19.8242 7.86099 19.9994 8.50011 20Z"
              fill="#6069FF"
            />
          </g>
        </svg>
      </button>

      {mounted && popups.length > 0
        ? createPortal(
            <div className={styles.notificationPopupStack} aria-live="polite">
              {popups.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={styles.notificationPopup}
                  onClick={() => openNotification(notification)}
                >
                  <div className={styles.notificationPopupHeader}>
                    <img
                      src={DEFAULT_AVATAR}
                      alt=""
                      className={styles.notificationPopupAvatar}
                    />
                    <div className={styles.notificationPopupInfo}>
                      {notification.title ? (
                        <div className={styles.notificationTitleLine}>{notification.title}</div>
                      ) : null}
                      {notification.hint ? (
                        <div className={styles.notificationHint}>{notification.hint}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.notificationPopupText}>{notification.text}</div>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}

      {isOpen ? (
        <div className={styles.notificationDropdown}>
          <h3 className={styles.notificationTitle}>Уведомления</h3>

          <div className={styles.notificationToggle}>
            <div className={styles.toggleLabel}>Всплывающие оповещения</div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(event) => setNotificationsEnabledState(event.target.checked)}
              />
              <span
                className={`${styles.slider} ${notificationsEnabled ? styles.active : ""}`}
              >
                <span
                  className={`${styles.sliderButton} ${notificationsEnabled ? styles.active : ""}`}
                />
              </span>
            </label>
          </div>

          <div
            ref={scrollRef}
            className={styles.notificationScrollArea}
          >
            {unreadNotifications.length > 0 ? (
              <section className={styles.notificationSection}>
                <div className={styles.notificationSectionHeader}>
                  <h4 className={styles.sectionTitle}>Новые</h4>
                  <button
                    type="button"
                    className={styles.markAllReadBtn}
                    disabled={markingAllRead}
                    onClick={() => {
                      void markAllAsRead();
                    }}
                  >
                    {markingAllRead ? "Обновление…" : "Отметить все прочитанными"}
                  </button>
                </div>
                {unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={openNotification}
                  />
                ))}
              </section>
            ) : null}

            {readNotifications.length > 0 ? (
              <section className={styles.notificationSection}>
                <h4 className={styles.sectionTitle}>Последние</h4>
                {readNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={openNotification}
                  />
                ))}
              </section>
            ) : null}

            {loadingMore ? (
              <div className={styles.notificationLoadingMore}>Загрузка…</div>
            ) : null}

            {notifications.length > 0 && currentPage >= lastPage ? (
              <div className={styles.notificationEndHint}>Это все уведомления</div>
            ) : null}

            <div ref={sentinelRef} className={styles.notificationLoadSentinel} aria-hidden="true" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
