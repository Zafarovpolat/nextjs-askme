"use client";

import type { ChangeEvent, MutableRefObject, ReactNode } from "react";
import StretchablePremiumBadge from "@/components/profile/StretchablePremiumBadge";
import { avatarImgProps } from "@/lib/avatar-srcset";

export type ProfileHeaderVariant = "cabinet" | "public";

type ProfileHeaderBlockProps = {
  variant: ProfileHeaderVariant;
  premium: boolean;
  premiumBadgeText: string;
  displayName: string;
  /** Ранг/уровень, который показываем в стандартном блоке (как у пользователей). */
  rankLabel?: string;
  registeredInService: string;
  avatarUrl: string;
  /** URL @2x с API — для чёткого аватара на Retina */
  avatarUrl2x?: string | null;
  ballsDisplay: string;
  ballsTitle?: string;
  kpdPercentDisplay: string;
  editableAvatar?: boolean;
  avatarInputRef?: MutableRefObject<HTMLInputElement | null>;
  onAvatarPick?: (e: ChangeEvent<HTMLInputElement>) => void;
  avatarUploading?: boolean;
  actionTitle?: string;
  /** Только для variant="cabinet": блок внутри user_profile_block под основным контентом (например мобильное меню). */
  cabinetFooter?: ReactNode;
};

function ProfileHeaderStats({
  ballsDisplay,
  ballsTitle,
  kpdPercentDisplay,
}: {
  ballsDisplay: string;
  ballsTitle?: string;
  kpdPercentDisplay: string;
}) {
  return (
    <div className="user_public_stats">
      <div className="stat_item">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div className="stat_value" title={ballsTitle}>{ballsDisplay}</div>
            <div className="stat_label">Балл</div>
          </div>
        </div>
      </div>
      <div className="stats_divider" />
      <div className="stat_item">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <svg width="30" height="19" viewBox="0 0 30 19" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div className="stat_value">{kpdPercentDisplay}</div>
            <div className="stat_label">
              КПД
              {/* п.33 — подсказка для КПД */}
              <div className="kpd_tooltip_icon" data-tooltip="КПД (коэффициент полезного действия) — показывает, какая доля ваших ответов была отмечена как лучший ответ. Чем выше КПД, тем больше баллов вы получаете за каждый ответ.">?</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileHeaderBlock({
  variant,
  premium,
  premiumBadgeText,
  displayName,
  rankLabel = "",
  registeredInService,
  avatarUrl,
  avatarUrl2x,
  ballsDisplay,
  ballsTitle,
  kpdPercentDisplay,
  editableAvatar = false,
  avatarInputRef,
  onAvatarPick,
  avatarUploading = false,
  actionTitle = "Редактировать аватар",
  cabinetFooter,
}: ProfileHeaderBlockProps) {
  const { src: profileImgSrc, srcSet: profileImgSrcSet } = avatarImgProps(
    avatarUrl,
    avatarUrl2x,
  );
  const contentInner = (
    <div className="user_profile_block_content_profile">
      <div className="user_profile_img">
        <img
          className="user_profile_image"
          src={profileImgSrc}
          srcSet={profileImgSrcSet}
          alt=""
        />
        {editableAvatar ? (
          <>
            <button
              className="user_profile_img_action"
              title={actionTitle}
              type="button"
              disabled={avatarUploading}
              onClick={() => avatarInputRef?.current?.click()}
            >
              <svg width="11" height="11">
                <use xlinkHref="#pencil-edit"></use>
              </svg>
            </button>
            <input
              ref={(node) => {
                if (avatarInputRef) {
                  avatarInputRef.current = node;
                }
              }}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={onAvatarPick}
            />
          </>
        ) : null}
        {premium ? (
          <StretchablePremiumBadge text={premiumBadgeText} className="premium-badge user_profile_img_badge" />
        ) : null}
      </div>
      <div className="user_profile_block_content_profile_desc">
        <h4 className="profile-display-name" title={displayName}>
          {displayName}
        </h4>
        {rankLabel ? (
          <div className="quest_user_title" style={{ display: "inline-block" }}>
            <p style={{ margin: 0 }}>{rankLabel}</p>
          </div>
        ) : null}
        <p>В сервисе {registeredInService}</p>
      </div>
    </div>
  );

  const stats = (
    <ProfileHeaderStats
      ballsDisplay={ballsDisplay}
      ballsTitle={ballsTitle}
      kpdPercentDisplay={kpdPercentDisplay}
    />
  );

  const contentWrapStyle =
    variant === "public" ? ({ justifyContent: "space-between", padding: 0 } as const) : undefined;

  const mainContent = (
    <div className="user_profile_block_content" style={contentWrapStyle}>
      {contentInner}
      {stats}
    </div>
  );

  if (variant === "public") {
    return (
      <div
        className={`main_question_block main_question_block_item profile_question_block${
          premium ? " premium-profile premium-user" : ""
        }`}
        style={{ marginTop: 0, marginBottom: "8px" }}
      >
        <div className="main_question_bg_wrapper">
          <div className="main_question_block_top_bg">
            <img src="/images/top-leader-bg.svg" className="top_bg_light" alt="" />
            <img src="/images/top-leader-bg-d-2.svg" className="top_bg_dark" alt="" />
            <img src="/images/blues-rect.svg" className="top_bg_rect top_bg_rect_light" alt="" />
            <img src="/images/blues-rect-dark.svg" className="top_bg_rect top_bg_rect_dark" alt="" />
          </div>
        </div>
        {mainContent}
      </div>
    );
  }

  return (
    <div className={`user_profile_block ${premium ? "premium-profile" : ""}`}>
      <img
        className="user_profile_block_bg"
        src={premium ? "/images/userprofilepremium.svg" : "/images/user-profile-bg.svg"}
        alt=""
      />
      {!premium ? <img className="user_profile_block_bg_dark" src="/images/user-profile-bg-d.svg" alt="" /> : null}
      <img
        className="user_profile_block_rect"
        src={premium ? "/images/blues-rect-dark.svg" : "/images/main-rect.svg"}
        alt=""
      />
      {mainContent}
      {cabinetFooter ?? null}
    </div>
  );
}
