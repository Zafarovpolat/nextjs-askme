import Link from "next/link";
import QuestionLikerAvatars, { type LikerUser } from "@/components/QuestionLikerAvatars";
import UserAvatar from "@/components/UserAvatar";
import { compactCountTitle, formatCompactCountPlus } from "@/lib/format-compact-count";
import { profileLinkLabel } from "@/lib/a11y-labels";

export type MostDiscussedQuestion = {
  id: number;
  title: string;
  answers_count: number;
  likes_count?: number;
  latest_likers?: LikerUser[];
};

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
            title={profileLinkLabel(firstLiker.full_name)}
            aria-label={profileLinkLabel(firstLiker.full_name)}
          >
            <UserAvatar
              src={firstLiker.avatar_url}
              src2x={firstLiker.avatar_url_2x}
              alt=""
              size={40}
            />
          </Link>
        ) : (
          <UserAvatar
            src={firstLiker?.avatar_url}
            src2x={firstLiker?.avatar_url_2x}
            alt=""
            size={40}
          />
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
        countLabel={formatCompactCountPlus(question.answers_count)}
        countTitle={compactCountTitle(question.answers_count)}
      />
    </div>
  );
}
