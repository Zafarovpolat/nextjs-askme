"use client";

import QuestionLikerAvatars, { type LikerUser } from "@/components/QuestionLikerAvatars";
import { compactCountTitle, formatCompactCountPlus } from "@/lib/format-compact-count";

export type PopularTopicItem = {
  id: number;
  name: string;
  slug: string | null;
  parent_slug: string | null;
  parent_icon_key?: string | null;
  total_likes: number;
  latest_likers?: LikerUser[];
};

export default function PopularTopicListItem({ topic }: { topic: PopularTopicItem }) {
  const href =
    topic.parent_slug && topic.slug
      ? `/categories/${topic.parent_slug}/${topic.slug}`
      : "/categories";

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    window.location.href = href;
  };

  return (
    <div
      className="question_list_item"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="question_list_item_left question_list_item_title_link">
        <svg width="24" height="24" className="topic_icon" aria-hidden>
          <use xlinkHref={`#${topic.parent_icon_key || "gaming"}`}></use>
        </svg>
        <div className="question_list_item_left__user_meta">
          <div className="main_text question_title_clamp" title={topic.name}>
            {topic.name}
          </div>
        </div>
      </div>
      <QuestionLikerAvatars
        likers={topic.latest_likers ?? []}
        countLabel={formatCompactCountPlus(topic.total_likes)}
        countTitle={compactCountTitle(topic.total_likes)}
        usePlainImg
      />
    </div>
  );
}
