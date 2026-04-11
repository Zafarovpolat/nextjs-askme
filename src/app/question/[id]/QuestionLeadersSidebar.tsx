"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time-ago";
import { api } from "@/lib/api-client";
import type { SimilarQuestionsPage } from "@/types";

/**
 * Правый сайдбар «Вопросы лидеры» — вопросы с выбранным лучшим ответом (API similar, filter=solved).
 */
export default function QuestionLeadersSidebar({
  questionId,
}: {
  questionId: number;
}) {
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
    <div className="question_right_list">
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
        items.map((q) => (
          <Link href={`/question/${q.id}`} key={q.id}>
            <div
              className="question_list_item question_leader_card"
              style={{ cursor: "pointer" }}
            >
              <div className="question_list_item_left">
                <img
                  src={q.author.avatar_url || "/images/icons/avatar.svg"}
                  alt=""
                />
                <div>
                  <p className="main_text">{q.author.full_name}</p>
                  <span>{formatTimeAgo(q.created_at)}</span>
                </div>
              </div>
              <div className="question_text">
                <p>{q.title}</p>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
