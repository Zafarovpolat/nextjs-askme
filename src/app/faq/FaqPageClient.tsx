"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import FaqIcon from "@/components/faq/FaqIcon";
import type { FaqCategory } from "@/types/faq-page";
import { usePageStickySidebars } from "@/hooks/usePageStickySidebars";

type Props = {
  categories: FaqCategory[];
};

export default function FaqPageClient({ categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return activeCategory
        ? categories.filter((c) => c.id === activeCategory)
        : categories;
    }
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search, activeCategory, categories]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { wrapperRef, leftSidebarRef, rightSidebarRef } = usePageStickySidebars();

  return (
    <div className="question_wrapper container faq-page-wrapper" ref={wrapperRef}>
      <div className="question_left_list" ref={leftSidebarRef}>
        <div className="faq-sidebar">
          <p className="faq-sidebar-title">Разделы</p>
          <div className="faq-categories">
            <button
              type="button"
              className={`faq-category-btn${activeCategory === null && !search ? " faq-category-btn--active" : ""}`}
              onClick={() => {
                setActiveCategory(null);
                setSearch("");
              }}
            >
              <span className="faq-category-btn__icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </span>
              Все разделы
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`faq-category-btn${activeCategory === cat.id && !search ? " faq-category-btn--active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearch("");
                }}
              >
                <span className="faq-category-btn__icon">
                  <FaqIcon icon={cat.icon} size={18} />
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="questions_page_list">
        <div className="faq-search-wrap">
          <div className="faq-search">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="faq-search-input"
              type="text"
              placeholder="Поиск по вопросам..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveCategory(null);
              }}
            />
          </div>
        </div>

        <div className="faq-content">
          {filteredData.length === 0 ? (
            <div className="faq-no-results">По вашему запросу ничего не найдено</div>
          ) : (
            filteredData.map((cat) => (
              <div key={cat.id} className="faq-section" id={`faq-${cat.id}`}>
                <div className="faq-section-header">
                  <div className="faq-section-icon">
                    <FaqIcon icon={cat.icon} />
                  </div>
                  <h2 className="faq-section-title">{cat.label}</h2>
                  <span className="faq-section-count">
                    {cat.items.length} вопр.
                  </span>
                </div>
                <div className="faq-items">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.id}-${idx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <div
                        key={key}
                        className={`faq-item${isOpen ? " faq-item--open" : ""}`}
                      >
                        <button
                          type="button"
                          className="faq-item-btn"
                          onClick={() => toggleItem(key)}
                          aria-expanded={isOpen}
                        >
                          <span className="faq-item-question">{item.q}</span>
                          <svg
                            className="faq-item-chevron"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        <div className="faq-item-answer">
                          <div className="faq-item-answer-inner">
                            <p>{item.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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

        <div className="faq-contact-block">
          <div className="faq-contact-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="faq-contact-title">Нужна помощь?</p>
          <p className="faq-contact-text">
            Не нашли ответ на свой вопрос? Наша команда поддержки готова помочь.
          </p>
          <Link href="/support" className="faq-contact-btn">
            Написать в поддержку
          </Link>
        </div>
      </div>
    </div>
  );
}
