"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import VipPlansGrid from "@/components/profile/VipPlansGrid";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { showSystemToast } from "@/store/systemToastStore";
import type { SubscriptionPackage } from "@/types";

type BuyVipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** После успешной оплаты и активации подписки */
  onSuccess?: () => void | Promise<void>;
};

type WaitPhase = "plans" | "waiting" | "success" | "failed";

const POLL_MS = 2500;
const MAX_POLL_MS = 15 * 60 * 1000;

export default function BuyVipModal({ isOpen, onClose, onSuccess }: BuyVipModalProps) {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<WaitPhase>("plans");
  const [waitingHint, setWaitingHint] = useState("Ожидаем подтверждение оплаты…");
  const [blockedCheckoutUrl, setBlockedCheckoutUrl] = useState<string | null>(null);
  const pollStartedAtRef = useRef(0);
  const paymentWindowRef = useRef<Window | null>(null);
  const abortedRef = useRef(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ packages: SubscriptionPackage[] }>("v1/subscription-packages");
      setPackages(data.packages ?? []);
    } catch {
      setPackages([]);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      abortedRef.current = true;
      setPhase("plans");
      setCheckoutLoadingId(null);
      setWaitingHint("Ожидаем подтверждение оплаты…");
      setBlockedCheckoutUrl(null);
      return;
    }
    abortedRef.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const { style: htmlStyle } = document.documentElement;
    const { style: bodyStyle } = document.body;

    htmlStyle.overflow = "hidden";
    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = "100%";

    return () => {
      htmlStyle.overflow = "";
      bodyStyle.overflow = "";
      bodyStyle.position = "";
      bodyStyle.top = "";
      bodyStyle.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || loaded || loading) return;
    void fetchPackages();
  }, [fetchPackages, isOpen, loaded, loading]);

  const pollPayment = useCallback(
    async (paymentId: number) => {
      pollStartedAtRef.current = Date.now();
      setPhase("waiting");
      setWaitingHint("Оплата открыта в новой вкладке. После оплаты вернитесь сюда — статус обновится автоматически.");

      while (!abortedRef.current) {
        if (Date.now() - pollStartedAtRef.current > MAX_POLL_MS) {
          setPhase("failed");
          setWaitingHint("Время ожидания истекло. Если вы уже оплатили — обновите страницу или зайдите в кабинет.");
          showSystemToast("Не удалось дождаться подтверждения оплаты. Проверьте статус в личном кабинете.", "error");
          return;
        }

        try {
          const data = await api.get<{
            payment: { status: string };
          }>(`v1/premium-subscriptions/payments/${paymentId}`);
          const status = data.payment?.status;

          if (status === "succeeded") {
            setPhase("success");
            setWaitingHint("Оплата прошла успешно. VIP активирован.");
            showSystemToast("VIP успешно активирован", "success");
            try {
              await onSuccess?.();
            } catch {
              /* ignore */
            }
            return;
          }

          if (status === "failed" || status === "canceled") {
            setPhase("failed");
            setWaitingHint("Оплата не завершена или отменена. Можно выбрать пакет снова.");
            showSystemToast("Оплата не завершена", "error");
            return;
          }
        } catch {
          // сеть/временная ошибка — продолжаем опрос
        }

        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    },
    [onSuccess],
  );

  const handlePurchase = useCallback(
    async (packageId: number) => {
      setCheckoutLoadingId(packageId);
      setBlockedCheckoutUrl(null);
      try {
        const data = await api.post<{
          payment: { id: number; confirmation_url?: string | null };
        }>("v1/premium-subscriptions/checkout", {
          package_id: packageId,
        });
        const confirmationUrl = data.payment?.confirmation_url;
        const paymentId = data.payment?.id;
        if (!confirmationUrl || !paymentId) {
          showSystemToast("Не удалось получить ссылку на оплату. Попробуйте позже.", "error");
          return;
        }

        const win = window.open(confirmationUrl, "_blank", "noopener,noreferrer");
        paymentWindowRef.current = win;
        if (!win) {
          setPhase("waiting");
          setWaitingHint(
            "Не удалось открыть вкладку оплаты (блокировка всплывающих окон). Нажмите кнопку ниже.",
          );
          // сохраняем URL для кнопки через state
          setBlockedCheckoutUrl(confirmationUrl);
          void pollPayment(paymentId);
          return;
        }

        void pollPayment(paymentId);
      } catch (err) {
        showSystemToast(getApiErrorMessage(err), "error");
      } finally {
        setCheckoutLoadingId(null);
      }
    },
    [pollPayment],
  );

  const handleClose = useCallback(() => {
    abortedRef.current = true;
    onClose();
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="vip-purchase-modal-overlay gift-vip-modal-overlay" onClick={handleClose}>
      <div
        className="vip-purchase-modal gift-vip-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-vip-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="vip-purchase-modal-close gift-vip-modal__close"
          aria-label="Закрыть"
          onClick={handleClose}
        >
          ×
        </button>

        <div className="gift-vip-modal__header">
          <h3 id="buy-vip-modal-title" className="vip-purchase-modal-title gift-vip-modal__title">
            Купить VIP
          </h3>
          {phase === "plans" ? (
            <>
              <p className="vip-purchase-modal-text gift-vip-modal__subtitle secondary_text">
                VIP — это особые знаки отличия на проекте, выделение ответов и
                вопросов в общих списках, в два раза больше баллов за каждый
                ответ и увеличение ежедневного лимита вопросов до 100,
                возможность скрыть списки вопросов и ответов в своем личном
                кабинете, а также отключение рекламы!
              </p>
              <p className="vip-purchase-modal-text gift-vip-modal__subtitle secondary_text" style={{ marginTop: 12 }}>
                Премиум сейчас не активен.
              </p>
            </>
          ) : (
            <p className="vip-purchase-modal-text gift-vip-modal__subtitle">
              {waitingHint}
            </p>
          )}
        </div>

        <div className="gift-vip-modal__body">
          {phase === "plans" ? (
            <VipPlansGrid
              packages={packages}
              loading={loading}
              checkoutLoadingId={checkoutLoadingId}
              onPurchase={(packageId) => void handlePurchase(packageId)}
              buyButtonLabel="Купить"
              loadingCheckoutLabel="Создание счёта…"
            />
          ) : (
            <div className="buy-vip-modal__status" style={{ textAlign: "center", padding: "32px 12px" }}>
              {phase === "waiting" ? (
                <>
                  <p className="secondary_text" style={{ marginBottom: 16 }}>
                    Ждём оплату…
                  </p>
                  {blockedCheckoutUrl ? (
                    <a
                      className="vip_buy_btn_card"
                      href={blockedCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", textDecoration: "none" }}
                    >
                      Открыть оплату
                    </a>
                  ) : null}
                </>
              ) : null}
              {phase === "success" ? (
                <>
                  <p className="main_text" style={{ marginBottom: 16, fontWeight: 700 }}>
                    Готово
                  </p>
                  <button type="button" className="vip_buy_btn_card" onClick={handleClose}>
                    Продолжить
                  </button>
                </>
              ) : null}
              {phase === "failed" ? (
                <button
                  type="button"
                  className="vip_buy_btn_card"
                  onClick={() => {
                    setPhase("plans");
                    setWaitingHint("Ожидаем подтверждение оплаты…");
                  }}
                >
                  Выбрать пакет снова
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
