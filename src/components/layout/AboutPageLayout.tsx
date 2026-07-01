"use client";

import type { ReactNode } from "react";
import AboutSidebarTabs from "@/components/about/AboutSidebarTabs";
import { usePageStickySidebars } from "@/hooks/usePageStickySidebars";

type AboutPageLayoutProps = {
  children: ReactNode;
};

export default function AboutPageLayout({ children }: AboutPageLayoutProps) {
  const { wrapperRef, leftSidebarRef, rightSidebarRef } = usePageStickySidebars();

  return (
    <div className="question_wrapper container about-page-wrapper" ref={wrapperRef}>
      <div className="question_left_list" ref={leftSidebarRef}>
        <AboutSidebarTabs />
      </div>

      <div className="questions_page_list">{children}</div>

      <div className="question_right_list" ref={rightSidebarRef}>
        <div className="vip_status_block">
          <div className="vip_icon">
            <img src="/images/vip.svg" alt="VIP" />
          </div>
          <p className="vip_gift_text">Подарить</p>
          <h3 className="vip_title">VIP статус</h3>
          <button type="button" className="vip_button">
            ПОДАРИТЬ
          </button>
        </div>
      </div>
    </div>
  );
}
