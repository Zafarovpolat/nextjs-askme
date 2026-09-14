import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { profileLinkLabel } from "@/lib/a11y-labels";

export type LikerUser = {
  id?: number;
  full_name?: string | null;
  avatar_url?: string | null;
  avatar_url_2x?: string | null;
};

type QuestionLikerAvatarsProps = {
  likers: LikerUser[];
  countLabel: string;
  countTitle?: string;
  avatarSize?: number;
};

export default function QuestionLikerAvatars({
  likers,
  countLabel,
  countTitle,
  avatarSize = 30,
}: QuestionLikerAvatarsProps) {
  return (
    <div className="question_list_item_users">
      {likers.slice(0, 3).map((user, index) => {
        const avatar = (
          <UserAvatar
            src={user.avatar_url}
            src2x={user.avatar_url_2x}
            alt=""
            size={avatarSize}
          />
        );

        if (!user.id) {
          return (
            <span key={`liker-${index}`} className="question_list_item_users__avatar-link">
              {avatar}
            </span>
          );
        }

        return (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="question_list_item_users__avatar-link"
            title={profileLinkLabel(user.full_name)}
            aria-label={profileLinkLabel(user.full_name)}
            onClick={(event) => event.stopPropagation()}
          >
            {avatar}
          </Link>
        );
      })}
      <p className="main_text" title={countTitle}>
        {countLabel}
      </p>
    </div>
  );
}
