"use client";

import { useCallback, useEffect, useState } from "react";
import VipPlansGrid from "@/components/profile/VipPlansGrid";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { showSystemToast } from "@/store/systemToastStore";
import type { SubscriptionPackage } from "@/types";

type GiftVipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientId: number;
  recipientName: string;
};

export default function GiftVipModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}: GiftVipModalProps) {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<number | null>(null);

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
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    if (!loaded && !loading) {
      void fetchPackages();
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [fetchPackages, isOpen, loaded, loading]);

  const handlePurchase = useCallback(
    async (packageId: number) => {
      setCheckoutLoadingId(packageId);
      try {
        const data = await api.post<{
          payment: { confirmation_url?: string | null };
        }>("v1/premium-subscriptions/checkout", {
          package_id: packageId,
          gift_recipient_user_id: recipientId,
        });
        const confirmationUrl = data.payment?.confirmation_url;
        if (confirmationUrl && typeof window !== "undefined") {
          window.location.href = confirmationUrl;
          return;
        }
        showSystemToast("Не удалось получить ссылку на оплату. Попробуйте позже.", "error");
      } catch (err) {
        showSystemToast(getApiErrorMessage(err), "error");
      } finally {
        setCheckoutLoadingId(null);
      }
    },
    [recipientId],
  );

  if (!isOpen) return null;

  return (
    <div className="vip-purchase-modal-overlay gift-vip-modal-overlay" onClick={onClose}>
      <div
        className="vip-purchase-modal gift-vip-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-vip-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="vip-purchase-modal-close gift-vip-modal__close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        <div className="gift-vip-modal__body">
          <h3 id="gift-vip-modal-title" className="vip-purchase-modal-title gift-vip-modal__title">
            Подарить VIP
          </h3>
          <p className="vip-purchase-modal-text gift-vip-modal__subtitle">
            Выберите пакет для пользователя <strong>{recipientName}</strong>
          </p>

          <VipPlansGrid
            packages={packages}
            loading={loading}
            checkoutLoadingId={checkoutLoadingId}
            onPurchase={(packageId) => void handlePurchase(packageId)}
            buyButtonLabel="Подарить"
            loadingCheckoutLabel="Создание счёта…"
          />
        </div>
      </div>
    </div>
  );
}
