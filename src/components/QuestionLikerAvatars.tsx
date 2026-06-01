import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

export type LikerUser = {
  id?: number;
  avatar_url?: string | null;
  avatar_url_2x?: string | null;
};

const DEFAULT_AVATAR = "/images/icons/avatar.svg";

type QuestionLikerAvatarsProps = {
  likers: LikerUser[];
  countLabel: string;
  /** 30 — стопка справа; без UserAvatar — plain img (tops block) */
  avatarSize?: number;
  usePlainImg?: boolean;
};

export default function QuestionLikerAvatars({
  likers,
  countLabel,
  avatarSize = 30,
  usePlainImg = false,
}: QuestionLikerAvatarsProps) {
  return (
    <div className="question_list_item_users">
      {likers.slice(0, 3).map((user, index) => {
        const avatar = usePlainImg ? (
          <img
            src={user.avatar_url || DEFAULT_AVATAR}
            srcSet={
              user.avatar_url_2x
                ? `${user.avatar_url || DEFAULT_AVATAR} 1x, ${user.avatar_url_2x} 2x`
                : undefined
            }
            alt=""
          />
        ) : (
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
            title="Профиль пользователя"
            onClick={(event) => event.stopPropagation()}
          >
            {avatar}
          </Link>
        );
      })}
      <p className="main_text">{countLabel}</p>
    </div>
  );
}
