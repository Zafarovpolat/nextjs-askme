"use client";

import StretchablePremiumBadge from "@/components/profile/StretchablePremiumBadge";
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
}: UserAvatarProps) {
  const badgeText = premiumText?.trim() || "Премиум";
  const { src: imgSrc, srcSet } = avatarImgProps(src, src2x);

  return (
    <div
      className={`site-user-avatar${premium ? " site-user-avatar--premium" : ""}${className ? ` ${className}` : ""}`.trim()}
      style={{ display: "inline-block", lineHeight: 0 }}
    >
      <img
        src={imgSrc}
        srcSet={srcSet}
        alt={alt}
        className={imgClassName}
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
