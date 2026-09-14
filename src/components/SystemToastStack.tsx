"use client";

import { useEffect, useRef, useState } from "react";
import "@/components/system-toast-tones.css";
import styles from "@/components/layout/Header.module.css";
import { useSystemToastStore, SYSTEM_TOAST_VISIBLE_MS } from "@/store/systemToastStore";
import type { SystemToast } from "@/store/systemToastStore";
import { useNavChromeStore } from "@/store/navChromeStore";

/** Совпадает с отступом под раскрытую шапку в Header.module.css (.notificationPopupStack). */
const TOAST_TOP_NAV_VISIBLE_PX = 84;
/** Когда `<nav>` уезжает вверх (nav--hidden) — тост у края экрана. */
const TOAST_TOP_NAV_COLLAPSED_PX = 16;

function ToneIcon({ kind }: { kind: SystemToast["kind"] }) {
  if (kind === "error") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 8v5m0 3.5v.1M10.3 3.6 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function SystemToastItem({ toast }: { toast: SystemToast }) {
  const dismissToast = useSystemToastStore((s) => s.dismissToast);
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(SYSTEM_TOAST_VISIBLE_MS);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (paused) return;
    startedAtRef.current = Date.now();
    const t = window.setTimeout(() => dismissToast(toast.id), remainingRef.current);
    return () => {
      window.clearTimeout(t);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    };
  }, [paused, toast.id, dismissToast]);

  return (
    <div
      className={styles.notificationPopup}
      data-system-toast={toast.kind}
      style={{ cursor: "default" }}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className={styles.popupIcon}>
        <ToneIcon kind={toast.kind} />
      </span>
      <div className={styles.popupBody}>
        <div className={styles.popupTitle}>{toast.message}</div>
      </div>
      <button
        type="button"
        className={styles.popupClose}
        aria-label="Закрыть"
        onClick={() => dismissToast(toast.id)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <span
        className={styles.popupProgress}
        style={{ animationDuration: `${SYSTEM_TOAST_VISIBLE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
        aria-hidden
      />
    </div>
  );
}

/**
 * Системные всплывающие сообщения (ошибки API, «сохранено» и т.д.).
 * Та же сетка, что у push-уведомлений: иконка тона, текст, крестик, полоса автозакрытия.
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
