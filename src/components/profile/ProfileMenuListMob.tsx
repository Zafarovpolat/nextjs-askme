"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const ITEM_SIZE = 50;
const GAP = 10;
const ITEM_COUNT = 6;
const ONE_ROW_WIDTH = ITEM_COUNT * ITEM_SIZE + (ITEM_COUNT - 1) * GAP;

type ProfileMenuListMobProps = {
  children: ReactNode;
};

export default function ProfileMenuListMob({ children }: ProfileMenuListMobProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [twoRows, setTwoRows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const style = getComputedStyle(el);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = el.clientWidth - padX;
      setTwoRows(available < ONE_ROW_WIDTH);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`profile_menu_list_mob tabs_list_m${twoRows ? " profile_menu_list_mob--two-rows" : ""}`}
    >
      {children}
    </div>
  );
}
