"use client";

import StretchablePremiumBadge from "@/components/profile/StretchablePremiumBadge";
import SiteImage from "@/components/SiteImage";
import { avatarImgProps } from "@/lib/avatar-srcset";

type UserAvatarProps = {
  src?: string | null;
  /** URL версии @2x с бэка (v1/me, вопросы, профиль) — для srcSet на Retina */
  src2x?: string | null;
  alt?: string;
  premium?: boolean;
  premiumText?: string | null;
  size?: number;
  className?: string;
  imgClassName?: string;
  /** Шапка / автор вопроса: сразу, без preload в head. */
  eager?: boolean;
};

export default function UserAvatar({
  src,
  src2x,
  alt = "",
  premium = false,
  premiumText,
  size = 51,
  className = "",
  imgClassName = "",
  eager = false,
}: UserAvatarProps) {
  const badgeText = premiumText?.trim() || "Премиум";
  const { src: imgSrc } = avatarImgProps(src, src2x);
  const displaySrc = src2x?.trim() && !src2x.includes("avatar.svg") ? src2x.trim() : imgSrc;

  return (
    <div
      className={`site-user-avatar${premium ? " site-user-avatar--premium" : ""}${className ? ` ${className}` : ""}`.trim()}
      style={{ display: "inline-block", lineHeight: 0 }}
    >
      <SiteImage
        src={displaySrc}
        alt={alt}
        width={size}
        height={size}
        className={imgClassName}
        eager={eager}
        sizes={`${size}px`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          boxSizing: "border-box",
          border: premium ? "2px solid #fff" : "none",
          flexShrink: 0,
          display: "block",
          objectFit: "cover",
        }}
      />
      {premium ? (
        <StretchablePremiumBadge
          text={badgeText}
          className="site-user-avatar__badge"
        />
      ) : null}
    </div>
  );
}
