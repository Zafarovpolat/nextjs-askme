/* п.28 — страница /notifications (ранее возвращала 404) */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import { formatTimeAgo } from "@/lib/time-ago";

type NotificationItem = {
  id: number;
  title?: string | null;
  hint?: string | null;
  url?: string | null;
  text: string;
  is_read: boolean;
  created_at: string;
};

type NotificationsPageResponse = {
  notifications: NotificationItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const isLoading = useAuthStore((s) => s.isLoading);
  const meNotifications = useAuthStore((s) => s.notifications);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/login");
    }
  }, [isLoading, isAuthorized, router]);

  useEffect(() => {
    if (!isAuthorized) return;
    setLoading(true);
    api
      .get<NotificationsPageResponse>(`v1/notifications?page=1&per_page=${PAGE_SIZE}`)
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setCurrentPage(data.current_page ?? 1);
        setLastPage(data.last_page ?? 1);
      })
      .catch(() => {
        /* seed from store */
        setNotifications((meNotifications ?? []) as NotificationItem[]);
      })
      .finally(() => setLoading(false));
  }, [isAuthorized, meNotifications]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || currentPage >= lastPage) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const data = await api.get<NotificationsPageResponse>(
        `v1/notifications?page=${currentPage + 1}&per_page=${PAGE_SIZE}`
      );
      setNotifications((prev) => [...prev, ...(data.notifications ?? [])]);
      setCurrentPage(data.current_page ?? currentPage + 1);
      setLastPage(data.last_page ?? lastPage);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [currentPage, lastPage]);

  const markAllRead = useCallback(async () => {
    if (!notifications.some((n) => !n.is_read)) return;
    try {
      await api.post("v1/notifications/mark-all-read");
      useAuthStore.getState().markAllNotificationsRead();
      const data = await api.get<NotificationsPageResponse>(
        `v1/notifications?page=1&per_page=${PAGE_SIZE}`,
      );
      setNotifications(data.notifications ?? []);
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page ?? 1);
    } catch { /* ignore */ }
  }, [notifications]);

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    useAuthStore.getState().markNotificationsRead([id]);
    try {
      await api.post("v1/notifications/mark-read", { ids: [id] });
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="page-layout-sticky-footer">
      <Header />
      <div className="container" style={{ flex: 1, paddingBottom: 40 }}>
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Уведомления</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Уведомления</h2>
          {notifications.some((n) => !n.is_read) && (
            <button
              type="button"
              onClick={markAllRead}
              style={{
                background: "none",
                border: "none",
                color: "#626aff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Nunito, sans-serif",
              }}
            >
              Прочитать все
            </button>
          )}
        </div>

        {loading ? (
          <p className="secondary_text">Загрузка…</p>
        ) : notifications.length === 0 ? (
          <p className="secondary_text">Нет уведомлений</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="question_list_item"
                style={{
                  cursor: n.url ? "pointer" : "default",
                  opacity: n.is_read ? 0.7 : 1,
                  padding: "14px 20px",
                }}
                onClick={() => {
                  if (!n.is_read) markRead(n.id);
                  if (n.url) router.push(n.url);
                }}
              >
                <div className="question_list_item_left" style={{ gap: 12 }}>
                  <img
                    src="/images/icons/avatar.svg"
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: "50%" }}
                  />
                  <div>
                    {n.title && (
                      <div className="main_text" style={{ fontWeight: 700, marginBottom: 2 }}>
                        {n.title}
                      </div>
                    )}
                    <div className="main_text">{n.text}</div>
                    <div className="secondary_text" style={{ fontSize: 12, marginTop: 4 }}>
                      {formatTimeAgo(n.created_at)}
                    </div>
                  </div>
                </div>
                {!n.is_read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#626aff",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}

            {currentPage < lastPage && (
              <div className="show_more_btn_wrapper">
                <button
                  className="show_more_btn"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                >
                  <svg width="22" height="22">
                    <use xlinkHref="#sync"></use>
                  </svg>
                  {loadingMore ? "Загрузка…" : "Показать еще"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
