"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface QuestionCardBgProps {
  isPremium?: boolean;
}

const DESKTOP_MQ = "(min-width: 601px)";
const SHELF_ANCHOR_RATIO = 0.6;
const SHELF_DECOR_GAP = 80;
const SHELF_CURVE_INSET = 20;

function measureNaturalTextWidth(el: HTMLElement | null | undefined): number {
  if (!el) return 0;
  const prev = el.style.maxWidth;
  el.style.maxWidth = "none";
  const width = el.scrollWidth;
  el.style.maxWidth = prev;
  return width;
}

export default function QuestionCardBg({ isPremium = false }: QuestionCardBgProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const parent = anchorRef.current?.parentElement;
    if (!parent) return;

    const mqDesktop = window.matchMedia(DESKTOP_MQ);

    const measure = () => {
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      const contentW = parent.clientWidth;
      if (w > 0 && h > 0) setDims({ w, h });

      const leftRow = parent.querySelector<HTMLElement>(".question_list_item_left");
      const userMeta = leftRow?.querySelector<HTMLElement>(
        ".question_list_item_left__user_meta:not(.answer_author_container)",
      );
      const rankOutside = leftRow?.querySelector<HTMLElement>(":scope > .quest_user_title");
      const rankInside = userMeta?.querySelector<HTMLElement>(".quest_user_title");
      const avatarEl = leftRow?.querySelector<HTMLElement>(":scope > a, :scope > div");
      const nameEl = userMeta?.querySelector<HTMLElement>(".main_text");

      const avatarW = avatarEl?.offsetWidth ?? 40;
      const rankOutsideW = rankOutside?.offsetWidth ?? 0;
      const rankInsideW = rankInside?.offsetWidth ?? 0;
      const rowGap = leftRow
        ? parseFloat(getComputedStyle(leftRow).gap || "14") || 14
        : 14;
      const nameNaturalW = measureNaturalTextWidth(nameEl);

      let nameMax = 0;
      let metaMax = 0;

      if (mqDesktop.matches) {
        const flexGaps = rowGap * 2;
        const shelfEnd = contentW * SHELF_ANCHOR_RATIO;
        const contentBudget = Math.max(
          avatarW + rankOutsideW + flexGaps + 48,
          shelfEnd - SHELF_CURVE_INSET,
        );

        nameMax = Math.max(48, contentBudget - avatarW - rankOutsideW - flexGaps);
      } else {
        const metaNaturalW = Math.max(nameNaturalW, rankInsideW);
        const naturalContentW = avatarW + rowGap + metaNaturalW;
        const stepStart = Math.min(
          naturalContentW > 0 ? naturalContentW + SHELF_DECOR_GAP : 288,
          contentW * SHELF_ANCHOR_RATIO,
        );
        const contentBudget = Math.max(
          avatarW + rowGap + 48,
          stepStart - SHELF_CURVE_INSET,
        );

        metaMax = Math.max(48, contentBudget - avatarW - rowGap);
        nameMax = metaMax;
      }

      parent.style.setProperty("--mqb-name-max-width", `${nameMax}px`);
      parent.style.setProperty("--mqb-meta-max-width", `${metaMax || nameMax}px`);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(parent);

    const leftRow = parent.querySelector<HTMLElement>(".question_list_item_left");
    if (leftRow) ro.observe(leftRow);

    mqDesktop.addEventListener("change", measure);

    return () => {
      ro.disconnect();
      mqDesktop.removeEventListener("change", measure);
      parent.style.removeProperty("--mqb-name-max-width");
      parent.style.removeProperty("--mqb-meta-max-width");
    };
  }, []);

  const { w, h } = dims;

  const r = 22;
  const nr = 9.84974;
  const stripH = 43;

  const stepStart = w * SHELF_ANCHOR_RATIO;
  const stepEnd = Math.min(stepStart + 48.644, w - r - 4);

  const path =
    w > 0 && h > 0
      ? [
          `M0 ${r}`,
          `C0 ${nr} ${nr} 0 ${r} 0`,
          `L${stepStart} 0`,
          `C${stepStart + 8.35} 0 ${stepStart + 15.981} 4.727 ${stepStart + 19.699} 12.203`,
          `L${stepStart + 28.946} 30.797`,
          `C${stepStart + 32.664} 38.273 ${stepStart + 40.294} ${stripH} ${stepEnd} ${stripH}`,
          `H${w - r}`,
          `C${w - nr} ${stripH} ${w} ${stripH + nr} ${w} ${stripH + r}`,
          `V${h - r}`,
          `C${w} ${h - nr} ${w - nr} ${h} ${w - r} ${h}`,
          `H${r}`,
          `C${nr} ${h} 0 ${h - nr} 0 ${h - r}`,
          `V${r}Z`,
        ].join(" ")
      : "";

  const fill = isPremium ? "var(--mqb-bg, #6069ff)" : "var(--mqb-bg, #fff)";

  return (
    <>
      <span
        ref={anchorRef}
        aria-hidden="true"
        style={{ position: "absolute", pointerEvents: "none", width: 0, height: 0 }}
      />
      {path && (
        <svg
          aria-hidden="true"
          className="question-card-bg-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${w} ${h}`}
          fill="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <path d={path} fill={fill} />
        </svg>
      )}
    </>
  );
}
