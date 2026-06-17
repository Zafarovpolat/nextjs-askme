import { useEffect, type RefObject } from "react";

const STICKY_TOP = 100;
const STICKY_BOTTOM = 20;
const DESKTOP_MIN_WIDTH = 1301;

/**
 * Сайдбар едет синхронно со скроллом страницы:
 * вниз — от верха к низу блока, вверх — от низа к верху.
 */
export function useBidirectionalStickySidebar(
  wrapperRef: RefObject<HTMLElement | null>,
  sidebarRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sidebar = sidebarRef.current;
    if (!wrapper || !sidebar) return;

    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    let raf = 0;
    let lastScrollY = window.scrollY;
    let travel: number | null = null;

    const clearStyles = () => {
      sidebar.style.top = "";
      sidebar.style.transform = "";
    };

    const reset = () => {
      travel = null;
      clearStyles();
    };

    const update = () => {
      if (!mq.matches) {
        reset();
        lastScrollY = window.scrollY;
        return;
      }

      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;
      const sidebarHeight = sidebar.offsetHeight;
      const viewHeight = window.innerHeight;
      const topOffset = STICKY_TOP;
      const bottomOffset = STICKY_BOTTOM;
      const maxTop = topOffset;
      const minTop = viewHeight - sidebarHeight - bottomOffset;
      const maxTravel = maxTop - minTop;

      if (sidebarHeight <= viewHeight - topOffset - bottomOffset) {
        clearStyles();
        sidebar.style.top = `${topOffset}px`;
        travel = 0;
        lastScrollY = scrollY;
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();

      if (wrapperRect.top > maxTop) {
        clearStyles();
        sidebar.style.top = `${maxTop}px`;
        travel = 0;
        lastScrollY = scrollY;
        return;
      }

      if (wrapperRect.bottom < viewHeight - bottomOffset) {
        clearStyles();
        sidebar.style.top = `${minTop}px`;
        travel = maxTravel;
        lastScrollY = scrollY;
        return;
      }

      if (travel === null) {
        const wrapperTop = wrapperRect.top + scrollY;
        const scrollPast = scrollY - wrapperTop + topOffset;
        travel = Math.max(0, Math.min(maxTravel, scrollPast));
      }

      if (delta !== 0) {
        travel += delta;
        travel = Math.max(0, Math.min(maxTravel, travel));
      }

      sidebar.style.transform = "";
      sidebar.style.top = `${maxTop - travel}px`;
      lastScrollY = scrollY;
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    const onResize = () => {
      travel = null;
      scheduleUpdate();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(sidebar);
    ro.observe(wrapper);

    mq.addEventListener("change", onResize);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", onResize);

    scheduleUpdate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mq.removeEventListener("change", onResize);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", onResize);
      reset();
    };
  }, [wrapperRef, sidebarRef]);
}
