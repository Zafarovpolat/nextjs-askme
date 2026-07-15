"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time-ago";
import UserAvatar from "@/components/UserAvatar";
import { displayPremiumBadge } from "@/lib/ai-user-display";
import type { SimilarQuestionItem } from "@/types";

/**
 * Правый сайдбар «Премиум вопросы» — данные с SSR (кэш по подкатегории, cron каждые 5 мин).
 */
const PremiumQuestionsSidebar = forwardRef<
  HTMLDivElement,
  { questions: SimilarQuestionItem[] }
>(function PremiumQuestionsSidebar({ questions }, ref) {
  const items = questions ?? [];

  return (
    <div className="question_right_list" ref={ref}>
      <div className="blocks_title">
        <h2>Премиум вопросы</h2>
      </div>
      {items.length === 0 ? (
        <p className="secondary_text" style={{ padding: "12px 0" }}>
          Пока нет премиум-вопросов в подборке
        </p>
      ) : (
        items.map((q) => {
          const author = q.author;
          if (!author) return null;
          const authorPremium =
            author.premium_is_active ?? author.is_premium ?? false;
          const authorPremiumText = displayPremiumBadge(author) ?? "Премиум";
          return (
            <Link href={`/question/${q.id}`} key={q.id}>
              <div
                className="question_list_item question_leader_card"
                style={{ cursor: "pointer" }}
              >
                <div className="question_list_item_left">
                  <UserAvatar
                    src={author.avatar_url}
                    src2x={author.avatar_url_2x}
                    alt={author.full_name}
                    premium={authorPremium}
                    premiumText={authorPremiumText}
                  />
                  <div className="question_list_item_left__user_meta">
                    <p className="main_text" title={author.full_name}>
                      {author.full_name}
                    </p>
                    <span>{formatTimeAgo(q.created_at)}</span>
                  </div>
                </div>
                <div className="question_text">
                  <p title={q.title}>{q.title}</p>
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
});

export default PremiumQuestionsSidebar;
