"use client";

/** Один контур щита 49×17 в пользовательских координатах; режем по вертикали двумя viewBox, не дублируя геометрию костылями translate. */
const PREMIUM_SHIELD_PATH =
  "M45.9141 0.5C47.6509 0.50023 48.4901 2.62786 47.2207 3.81348C47.1855 3.84635 47.1526 3.88194 47.123 3.91992L43.8467 8.12695C43.7476 8.2542 43.6934 8.411 43.6934 8.57227C43.6934 8.73353 43.7477 8.8903 43.8467 9.01758L47.1162 13.2168C47.1473 13.2567 47.1827 13.2937 47.2207 13.3271C48.4745 14.4313 47.6932 16.5 46.0225 16.5H2.9375C1.28066 16.4997 0.506513 14.4485 1.75 13.3535C1.79989 13.3096 1.84435 13.259 1.88184 13.2041L4.7373 9.02441C4.81984 8.9036 4.86422 8.76057 4.86426 8.61426C4.86426 8.43791 4.79981 8.26739 4.68359 8.13477L0.925781 3.85449L0.90918 3.83496L0.894531 3.81445C-0.0957061 2.42675 0.896675 0.5 2.60156 0.5H45.9141Z";

const SHIELD_W = 49;
const SHIELD_H = 17;
const MID_X = SHIELD_W / 2;

type StretchablePremiumBadgeProps = {
  text: string;
  className?: string;
};

/**
 * Левый и правый «флажок» — один path, разные viewBox (левое / правое окно по X).
 * Между ними — div-прямоугольник; ширина ряда = ширине текста.
 */
export default function StretchablePremiumBadge({
  text,
  className = "",
}: StretchablePremiumBadgeProps) {
  return (
    <div className={`premium-badge-stretch ${className}`.trim()}>
      <div className="premium-badge-stretch__graphics" aria-hidden>
        <svg
          className="premium-badge-stretch__wing premium-badge-stretch__wing--left"
          viewBox={`0 0 ${MID_X} ${SHIELD_H}`}
          width={MID_X}
          height={SHIELD_H}
          focusable="false"
        >
          <path d={PREMIUM_SHIELD_PATH} fill="white" stroke="#6069FF" />
        </svg>
        <div className="premium-badge-stretch__middle" />
        <svg
          className="premium-badge-stretch__wing premium-badge-stretch__wing--right"
          viewBox={`${MID_X} 0 ${MID_X} ${SHIELD_H}`}
          width={MID_X}
          height={SHIELD_H}
          focusable="false"
        >
          <path d={PREMIUM_SHIELD_PATH} fill="white" stroke="#6069FF" />
        </svg>
      </div>
      <span className="premium-badge-stretch__label">{text}</span>
    </div>
  );
}
