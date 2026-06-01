"use client";

import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import QuestionLikerAvatars from "@/components/QuestionLikerAvatars";
import { formatTimeAgo } from "@/lib/time-ago";
import { displayPremiumBadge, displayUserName } from "@/lib/ai-user-display";

export type QuestionListAuthor = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
  avatar_url_2x?: string | null;
  balls?: number;
  is_premium?: boolean;
  premium_is_active?: boolean;
  premium_is_permanent?: boolean;
  premium_package_name?: string | null;
  is_ai?: boolean;
  ai_provider_name?: string | null;
  ai_model_short?: string | null;
  ai_rank_label?: string | null;
};

export type QuestionListItem = {
  id: number;
  title: string;
  created_at: string;
  answers_count: number;
  likes_count: number;
  is_premium?: boolean;
  author: QuestionListAuthor;
  latest_likers: { id: number; avatar_url?: string | null; avatar_url_2x?: string | null }[];
};

type QuestionListCardProps = {
  question: QuestionListItem;
  isFavorited: (questionId: number) => boolean;
  isPending: (questionId: number) => boolean;
  onToggleFavorite: (questionId: number) => void;
  onShare: (e: React.MouseEvent<HTMLButtonElement>, title: string, id: number) => void;
};

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

export default function QuestionListCard({
  question,
  isFavorited,
  isPending,
  onToggleFavorite,
  onShare,
}: QuestionListCardProps) {
  const authorPremium =
    question.author.premium_is_active ??
    question.author.is_premium ??
    false;
  const authorPremiumText = displayPremiumBadge(question.author) ?? "Премиум";
  const authorName = displayUserName(question.author);

  /* п.25 — вся карточка кликабельна */
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Не переходим если клик по кнопке, ссылке или интерактивному элементу
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("svg")) return;
    window.location.href = `/question/${question.id}`;
  };

  return (
    <div
      className={`question_list_item ${question.is_premium ? "premium-question" : ""}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="question_item_top_data">
        <div className="question_item_top_data_left">
          <Link
            href={`/profile/${question.author.id}`}
            className="question_list_item_avatar_link"
            title="Профиль пользователя"
            onClick={(event) => event.stopPropagation()}
          >
            <UserAvatar
              src={question.author.avatar_url}
              src2x={question.author.avatar_url_2x}
              alt={authorName}
              premium={authorPremium}
              premiumText={authorPremiumText}
              size={40}
            />
          </Link>
          <div className="question_list_item_left__user_meta">
            <Link
              href={`/profile/${question.author.id}`}
              className="main_text"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={(event) => event.stopPropagation()}
            >
              {authorName}
            </Link>
            <span>{numWord(question.author.balls ?? 0, ["балл", "балла", "баллов"])}</span>
          </div>
        </div>
        <div className="question_item_top_data_right">
          <button
            title="Мне нравится"
            className={`s_btn s_btn_icon btn-like ${isFavorited(question.id) ? "btn-like--active" : ""}`}
            onClick={() => onToggleFavorite(question.id)}
            disabled={isPending(question.id)}
            type="button"
          >
            <svg width="13.714355" height="12.000000">
              <use xlinkHref="#like"></use>
            </svg>
          </button>
          <button
            className="s_btn s_btn_icon share-this"
            title="Поделиться"
            onClick={(e) => onShare(e, question.title, question.id)}
            type="button"
          >
            <svg width="14" height="14.000000">
              <use xlinkHref="#share"></use>
            </svg>
          </button>
        </div>
      </div>

      <div className="question_list_item_left">
        <Link
          href={`/profile/${question.author.id}`}
          className="question_list_item_avatar_link"
          title="Профиль пользователя"
          onClick={(event) => event.stopPropagation()}
        >
          <UserAvatar
            src={question.author.avatar_url}
            src2x={question.author.avatar_url_2x}
            alt={authorName}
            premium={authorPremium}
            premiumText={authorPremiumText}
            size={40}
          />
        </Link>
        <Link
          href={`/question/${question.id}`}
          className="question_list_item_left__user_meta question_list_item_title_link"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="main_text">{question.title}</p>
          <span>{formatTimeAgo(question.created_at)}</span>
        </Link>
      </div>

      <div className="question_list_item_right">
        <QuestionLikerAvatars
          likers={question.latest_likers ?? []}
          countLabel={`+${question.answers_count}`}
        />
        <div className="question_list_item_right_actions">
          <button
            title="Мне нравится"
            className={`s_btn s_btn_icon btn-like ${isFavorited(question.id) ? "btn-like--active" : ""}`}
            onClick={() => onToggleFavorite(question.id)}
            disabled={isPending(question.id)}
            type="button"
          >
            <svg width="13.714355" height="12.000000">
              <use xlinkHref="#like"></use>
            </svg>
          </button>
          <button
            className="s_btn s_btn_icon share-this"
            title="Поделиться"
            onClick={(e) => onShare(e, question.title, question.id)}
            type="button"
          >
            <svg width="14" height="14.000000">
              <use xlinkHref="#share"></use>
            </svg>
          </button>
          <Link href={`/question/${question.id}`} className="s_btn">
            Посмотреть
          </Link>
          <Link href={`/question/${question.id}#answer`} className="s_btn s_btn_active">
            Ответить
          </Link>
        </div>
      </div>
    </div>
  );
}
