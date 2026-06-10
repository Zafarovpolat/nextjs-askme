"use client";

import Link from "next/link";
import QuestionLikerAvatars, { type LikerUser } from "@/components/QuestionLikerAvatars";
import { compactCountTitle, formatCompactCountPlus } from "@/lib/format-compact-count";

export type MostDiscussedQuestion = {
  id: number;
  title: string;
  likes_count: number;
  latest_likers?: LikerUser[];
};

const DEFAULT_AVATAR = "/images/icons/avatar.svg";

export default function MostDiscussedListItem({
  question,
}: {
  question: MostDiscussedQuestion;
}) {
  const likers = question.latest_likers ?? [];
  const firstLiker = likers[0];

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    window.location.href = `/question/${question.id}`;
  };

  return (
    <div
      className="question_list_item"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="question_list_item_left">
        {firstLiker?.id ? (
          <Link
            href={`/profile/${firstLiker.id}`}
            className="question_list_item_avatar_link"
            title="Профиль пользователя"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={firstLiker.avatar_url || DEFAULT_AVATAR}
              srcSet={
                firstLiker.avatar_url_2x
                  ? `${firstLiker.avatar_url || DEFAULT_AVATAR} 1x, ${firstLiker.avatar_url_2x} 2x`
                  : undefined
              }
              alt=""
            />
          </Link>
        ) : (
          <img src={firstLiker?.avatar_url || DEFAULT_AVATAR} alt="" />
        )}
        <div className="question_list_item_left__user_meta question_list_item_title_link">
          <div className="main_text question_title_clamp" title={question.title}>{question.title}</div>
        </div>
      </div>
      <QuestionLikerAvatars
        likers={likers}
        countLabel={formatCompactCountPlus(question.likes_count)}
        countTitle={compactCountTitle(question.likes_count)}
        usePlainImg
      />
    </div>
  );
}
