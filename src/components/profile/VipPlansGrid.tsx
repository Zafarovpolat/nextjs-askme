"use client";

import { CheckIcon } from "@/components/AboutIcons";
import SubscriptionPackageIcon from "@/components/profile/SubscriptionPackageIcon";
import { getAdvancedAnswerLabel } from "@/lib/vip-plan-labels";
import type { SubscriptionPackage } from "@/types";

type VipPlansGridProps = {
  packages: SubscriptionPackage[];
  loading?: boolean;
  checkoutLoadingId?: number | null;
  onPurchase: (packageId: number) => void;
  buyButtonLabel?: string;
  loadingCheckoutLabel?: string;
};

export default function VipPlansGrid({
  packages,
  loading = false,
  checkoutLoadingId = null,
  onPurchase,
  buyButtonLabel = "Купить",
  loadingCheckoutLabel = "Создание счёта…",
}: VipPlansGridProps) {
  if (loading && packages.length === 0) {
    return (
      <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
        Загрузка…
      </p>
    );
  }

  if (packages.length === 0) {
    return (
      <p className="secondary_text" style={{ textAlign: "center", padding: "40px 0" }}>
        Пакеты пока не добавлены
      </p>
    );
  }

  return (
    <div className="vip_plans_grid">
      {packages.map((packageItem) => (
        <div className="vip_plan_card" key={packageItem.id}>
          {packageItem.is_recommended ? <div className="vip_recommended_badge">Рекомендуем</div> : null}
          <div className="vip_plan_icon">
            <SubscriptionPackageIcon iconKey={packageItem.icon_key} />
          </div>
          <h3 className="vip_plan_title">{packageItem.name}</h3>
          <div className="vip_plan_price_container">
            <span className="vip_plan_price_label">Цена</span>
            <span className="vip_plan_price_value">
              {packageItem.monthly_price.toLocaleString("ru-RU")} ₽/Мес
            </span>
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
            onClick={() => onPurchase(packageItem.id)}
            disabled={checkoutLoadingId === packageItem.id}
          >
            {checkoutLoadingId === packageItem.id ? loadingCheckoutLabel : buyButtonLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
