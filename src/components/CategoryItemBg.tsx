"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

interface CategoryItemBgProps {
  children: ReactNode;
  className?: string;
}

/**
 * Обёртка для .subject_item в .categories_list
 *
 * Измеряем реальные offsetWidth + offsetHeight контейнера.
 * Notch (вырез под иконку) рисуется с ФИКСИРОВАННЫМ отступом в пикселях
 * от правого края — не в процентах от ширины. Так иконка (right: -16px)
 * всегда попадает в вырез независимо от ширины карточки.
 */
export default function CategoryItemBg({
  children,
  className = "",
}: CategoryItemBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "-");
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [darkMode, setDarkMode] = useState(false);

  // Следим за темой через body.dark_mode
  useEffect(() => {
    const checkDark = () =>
      setDarkMode(document.body.classList.contains("dark_mode"));
    checkDark();
    const mo = new MutationObserver(checkDark);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // useLayoutEffect — синхронно до paint, нет флеша
  // offsetWidth/offsetHeight = полные размеры с паддингом (что SVG покрывает)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) setDims({ w, h });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dims;

  // ─── SVG path ──────────────────────────────────────────────────────
  const r  = 22;        // радиус скруглений (пиксели, фиксировано)
  const nr = 9.84974;   // bezier-аппроксимация для r=22

  // ns — масштаб выреза
  const ns = 1.1;

  // Отступы notch от ПРАВОГО КРАЯ — фиксированные пиксели (не % от ширины).
  // Благодаря этому при любой ширине карточки notch всегда в одном месте
  // и иконка (right: -16px) всегда попадает в вырез.
  const n = {
    start: 87.941 * ns,  // начало выреза по x
    c1a:   79.039 * ns,
    c1b:   71.014 * ns,
    c1e:   67.612 * ns,
    c2a:   59.126 * ns,
    c2b:   55.723 * ns,
    c2c:   47.698 * ns,
    c2e:   38.796 * ns,
  };

  const notchY     = 49.6955 * ns;
  const cornerEndY = notchY + r;

  const path =
    w > 0 && h > 0
      ? [
          `M0 ${r}`,
          `C0 ${nr} ${nr} 0 ${r} 0`,
          // notch-старт: w минус фиксированный пиксельный отступ
          `L${w - n.start} 0`,
          `C${w - n.c1a} 0 ${w - n.c1b} ${5.36458 * ns} ${w - n.c1e} ${13.5905 * ns}`,
          `L${w - n.c2a} ${34.1051 * ns}`,
          `C${w - n.c2b} ${42.331 * ns} ${w - n.c2c} ${notchY} ${w - n.c2e} ${notchY}`,
          // правый верхний угол
          `H${w - r}`,
          `C${w - nr} ${notchY} ${w} ${notchY + nr} ${w} ${cornerEndY}`,
          // правая сторона (тянется)
          `V${h - r}`,
          // правый нижний угол
          `C${w} ${h - nr} ${w - nr} ${h} ${w - r} ${h}`,
          // нижняя сторона
          `H${r}`,
          // левый нижний угол
          `C${nr} ${h} 0 ${h - nr} 0 ${h - r}`,
          // левая сторона
          `V${r}Z`,
        ].join(" ")
      : "";

  const gradId    = `catGrad${uid}`;
  const gradStart = darkMode ? "rgba(50,54,118,1)"  : "rgba(255,255,255,1)";
  const gradEnd   = darkMode ? "rgba(30,33,80,0.7)" : "rgba(255,255,255,0.5)";

  return (
    <div ref={containerRef} className={`subject_item ${className}`}>
      {w > 0 && h > 0 && (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${w} ${h}`}
          fill="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <path d={path} fill={`url(#${gradId})`} />
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop stopColor={gradStart} />
              <stop offset="1" stopColor={gradEnd} />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Контент поверх SVG */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
