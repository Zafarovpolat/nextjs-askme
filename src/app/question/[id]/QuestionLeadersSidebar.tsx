"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time-ago";
import { api } from "@/lib/api-client";
import UserAvatar from "@/components/UserAvatar";
import type { SimilarQuestionsPage } from "@/types";

/**
 * Правый сайдбар «Вопросы лидеры» — вопросы с выбранным лучшим ответом (API similar, filter=solved).
 */
const QuestionLeadersSidebar = forwardRef<
  HTMLDivElement,
  { questionId: number }
>(function QuestionLeadersSidebar({ questionId }, ref) {
  const [items, setItems] = useState<SimilarQuestionsPage["questions"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      page: "1",
      per_page: "6",
      filter: "solved",
    });
    api
      .get<SimilarQuestionsPage>(
        `v1/questions/${questionId}/similar?${params.toString()}`
      )
      .then((data) => {
        if (!cancelled) {
          const list = (data.questions ?? []).filter((q) => q.id !== questionId);
          setItems(list.slice(0, 5));
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  return (
    <div className="question_right_list" ref={ref}>
      <div className="blocks_title">
        <h2>Вопросы лидеры</h2>
      </div>
      {loading ? (
        <p className="secondary_text" style={{ padding: "12px 0" }}>
          Загрузка…
        </p>
      ) : items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "12px 0" }}>
          Пока нет других решённых вопросов в подборке
        </p>
      ) : (
        items.map((q) => {
          const authorPremium =
            q.author.premium_is_active ?? q.author.is_premium ?? false;
          const authorPremiumText = q.author.premium_is_permanent
            ? "Постоянный"
            : q.author.premium_package_name?.trim() || "Премиум";
          return (
          <Link href={`/question/${q.id}`} key={q.id}>
            <div
              className="question_list_item question_leader_card"
              style={{ cursor: "pointer" }}
            >
              <div className="question_list_item_left">
                <UserAvatar
                  src={q.author.avatar_url}
                  src2x={q.author.avatar_url_2x}
                  alt={q.author.full_name}
                  premium={authorPremium}
                  premiumText={authorPremiumText}
                />
                <div className="question_list_item_left__user_meta">
                  <p className="main_text" title={q.author.full_name}>
                    {q.author.full_name}
                  </p>
                  <span>{formatTimeAgo(q.created_at)}</span>
                </div>
              </div>
              <div className="question_text">
                <p title={q.title}>
                  {q.title}
                </p>
              </div>
            </div>
          </Link>
        );
        })
      )}
    </div>
  );
});

export default QuestionLeadersSidebar;
