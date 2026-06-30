import { useRef } from "react";
import { useBidirectionalStickySidebar } from "@/hooks/useBidirectionalStickySidebar";

/** Refs для `.question_wrapper` + левого/правого сайдбара с липким скроллом (как на странице вопроса). */
export function usePageStickySidebars() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  useBidirectionalStickySidebar(wrapperRef, leftSidebarRef);
  useBidirectionalStickySidebar(wrapperRef, rightSidebarRef);

  return { wrapperRef, leftSidebarRef, rightSidebarRef };
}
