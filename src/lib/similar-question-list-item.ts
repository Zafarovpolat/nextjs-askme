import type { QuestionListItem } from "@/components/QuestionListCard";
import type { SimilarQuestionItem } from "@/types";

export function toSimilarQuestionListItem(q: SimilarQuestionItem): QuestionListItem {
  return {
    id: q.id,
    title: q.title,
    created_at: q.created_at,
    answers_count: q.answers_count,
    likes_count: q.likes_count,
    is_premium: q.is_premium,
    author: {
      id: q.author.id,
      full_name: q.author.full_name,
      avatar_url: q.author.avatar_url,
      avatar_url_2x: q.author.avatar_url_2x,
      balls: q.author.balls,
      is_premium: q.author.is_premium,
      premium_is_active: q.author.premium_is_active,
      premium_is_permanent: q.author.premium_is_permanent,
      premium_package_name: q.author.premium_package_name,
    },
    latest_likers: q.latest_likers.map((u) => ({
      id: u.id,
      avatar_url: u.avatar_url,
      avatar_url_2x: u.avatar_url_2x,
    })),
  };
}
