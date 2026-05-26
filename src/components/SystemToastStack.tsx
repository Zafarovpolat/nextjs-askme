"use client";

import { useEffect } from "react";
import "@/components/system-toast-tones.css";
import styles from "@/components/layout/Header.module.css";
import { useSystemToastStore, SYSTEM_TOAST_VISIBLE_MS } from "@/store/systemToastStore";
import type { SystemToast } from "@/store/systemToastStore";
import { useNavChromeStore } from "@/store/navChromeStore";

/** Совпадает с отступом под раскрытую шапку в Header.module.css (.notificationPopupStack). */
const TOAST_TOP_NAV_VISIBLE_PX = 84;
/** Когда `<nav>` уезжает вверх (nav--hidden) — тост у края экрана. */
const TOAST_TOP_NAV_COLLAPSED_PX = 16;

function SystemToastItem({ toast }: { toast: SystemToast }) {
  const dismissToast = useSystemToastStore((s) => s.dismissToast);

  useEffect(() => {
    const t = window.setTimeout(() => dismissToast(toast.id), SYSTEM_TOAST_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [toast.id, dismissToast]);

  return (
    <div
      className={styles.notificationPopup}
      data-system-toast={toast.kind}
      style={{ cursor: "default" }}
      role="status"
      aria-live="polite"
    >
      <div className={styles.notificationPopupText}>{toast.message}</div>
    </div>
  );
}

/**
 * Системные всплывающие сообщения (ошибки API, «сохранено» и т.д.).
 * Вёрстка как у push-уведомлений в шапке, без аватара, заголовка и времени.
 */
export default function SystemToastStack() {
  const toasts = useSystemToastStore((s) => s.toasts);
  const mainNavCollapsed = useNavChromeStore((s) => s.mainNavCollapsed);

  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.notificationPopupStack}
      aria-label="Сообщения"
      style={{
        top: mainNavCollapsed ? TOAST_TOP_NAV_COLLAPSED_PX : TOAST_TOP_NAV_VISIBLE_PX,
        transition: "top 0.3s ease",
      }}
    >
      {toasts.map((toast) => (
        <SystemToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
