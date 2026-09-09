"use client";

/** Крылья масштабируются вместе с высотой бейджа (исходный SVG 5.538… × 17). */
const WING_H = 15;
const WING_W = (5.538834951456311 * WING_H) / 17;
const WING_SRC = "/images/premium-badge-wing-left.svg";

export type StretchablePremiumBadgeProps = {
  text: string;
  className?: string;
  "aria-label"?: string;
};

/** Единый премиум-бейдж по всему сайту. */
export default function StretchablePremiumBadge({
  text,
  className = "",
  "aria-label": ariaLabel,
}: StretchablePremiumBadgeProps) {
  return (
    <div
      className={`premium-badge-stretch ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="premium-badge-stretch__graphics" aria-hidden>
        <img
          className="premium-badge-stretch__wing premium-badge-stretch__wing--left"
          src={WING_SRC}
          alt=""
          width={WING_W}
          height={WING_H}
          draggable={false}
        />
        <div className="premium-badge-stretch__middle" />
        <img
          className="premium-badge-stretch__wing premium-badge-stretch__wing--right"
          src={WING_SRC}
          alt=""
          width={WING_W}
          height={WING_H}
          draggable={false}
        />
      </div>
      <span className="premium-badge-stretch__label">{text}</span>
    </div>
  );
}
