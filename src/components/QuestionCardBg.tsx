"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

interface QuestionCardBgProps {
  isPremium?: boolean;
}

export default function QuestionCardBg({ isPremium = false }: QuestionCardBgProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const uid = useId().replace(/:/g, "-");
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [infoWidth, setInfoWidth] = useState(0);

  useLayoutEffect(() => {
    const parent = anchorRef.current?.parentElement;
    if (!parent) return;

    const measure = () => {
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      if (w > 0 && h > 0) setDims({ w, h });

      const info = parent.querySelector<HTMLElement>(".question_list_item-info");
      if (info) setInfoWidth(info.offsetWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dims;

  const r = 22;
  const nr = 9.84974;
  const stripH = 43;

  const gap = 80;
  const stepStartRaw = infoWidth > 0 ? infoWidth + gap : 288;
  const stepStart = Math.min(stepStartRaw, w * 0.6);
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
      {/* anchor всегда в DOM — через него получаем parentElement */}
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
