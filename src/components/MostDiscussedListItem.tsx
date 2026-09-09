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

  return (
    <div className="question_list_item">
      <div className="question_list_item_left">
        {firstLiker?.id ? (
          <Link
            href={`/profile/${firstLiker.id}`}
            className="question_list_item_avatar_link"
            title="Профиль пользователя"
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
        <Link
          href={`/question/${question.id}`}
          className="question_list_item_left__user_meta question_list_item_title_link"
          title={question.title}
        >
          <div className="main_text question_title_clamp" title={question.title}>{question.title}</div>
        </Link>
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
