"use client";

import Link from "next/link";
import { Fragment } from "react";
import { formatTimeAgo } from "@/lib/time-ago";
import { useVoteAnswer } from "@/hooks/useVoteAnswer";
import { useFavoriteAnswer } from "@/hooks/useFavoriteAnswer";
import type { QuestionPageAnswer } from "@/types";

export interface AnswerBlockProps {
  answer: QuestionPageAnswer;
  questionId: number;
  questionTitle: string;
  isBest?: boolean;
  isNested?: boolean;
  canSelectBestAnswer?: boolean;
  onSetBestAnswer?: (id: number) => void;
  pendingBestAnswer?: boolean;
  onComplaint: (answerId: number) => void;
  onScrollToAnswer: () => void;
  /** Ответ на этот комментарий: скролл к форме и выбор parent_id */
  onStartReplyToAnswer?: (answerId: number, userFullName: string) => void;
  allowAnswerComments?: boolean;
  answerVotes?: Record<number, 1 | -1>;
}

export default function AnswerBlock({
  answer,
  questionId,
  questionTitle,
  isBest = false,
  isNested = false,
  canSelectBestAnswer = false,
  onSetBestAnswer,
  pendingBestAnswer = false,
  onComplaint,
  onScrollToAnswer,
  onStartReplyToAnswer,
  allowAnswerComments = true,
  answerVotes = {},
}: AnswerBlockProps) {
  const answerVote = answerVotes[answer.id] ?? null;
  const {
    likes_count,
    dislikes_count,
    user_vote,
    vote,
    pending: votePending,
  } = useVoteAnswer(questionId, answer.id, {
    likes_count: answer.likes_count ?? 0,
    dislikes_count: answer.dislikes_count ?? 0,
    votes_score: answer.votes_score ?? 0,
    user_vote: answerVote,
  });

  const { toggleFavorite, isFavorited, isPending } = useFavoriteAnswer();

  const isNegative = (dislikes_count ?? 0) > (likes_count ?? 0);
  const parentUser = answer.parent_user;
  const levelLabel = answer.user.level_name ?? "Участник";

  return (
    <div
      className={`main_question_block ${isBest ? "best_answer_block" : ""} ${isNested ? "secondary_question_block" : ""} ${isNegative ? "answer_negative_rating" : ""}`}
      style={
        isNested
          ? { width: "calc(100% - 40px)", marginLeft: "40px" }
          : undefined
      }
    >
      <div className="question_list_item-info">
        <div className="question_list_item_left">
          <Link href={`/profile/${answer.user.id}`}>
            <img
              src={answer.user.avatar_url || "/images/icons/avatar.svg"}
              alt=""
            />
          </Link>
          <div className="answer_author_container">
            <div className="answer_author_info">
              <Link href={`/profile/${answer.user.id}`} className="main_text">
                {answer.user.full_name}
              </Link>
              {parentUser && (
                <>
                  <span className="reply_text">в ответ</span>
                  <Link
                    href={`/profile/${parentUser.id}`}
                    className="reply_to_text"
                  >
                    {parentUser.full_name}
                  </Link>
                </>
              )}
            </div>
            <div className="quest_user_title">
              <p>{levelLabel}</p>
            </div>
            <span>{formatTimeAgo(answer.created_at)}</span>
          </div>
          <div className="quest_user_title">
            <p>{levelLabel}</p>
          </div>
        </div>
        {!isBest && !isNested && canSelectBestAnswer && onSetBestAnswer ? (
          <div className="question_list_item_right">
            <button
              className="s_btn s_btn_icon btn_star_answer btn_star_tooltip"
              onClick={() => onSetBestAnswer(answer.id)}
              disabled={pendingBestAnswer}
              title="Выбрать как лучший ответ"
            >
              <svg width="15" height="15">
                <use xlinkHref="#star-best"></use>
              </svg>
              <span className="star_tooltip_text">
                Выбрать как лучший ответ
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {isBest && (
        <div className="main_question_block_title mobile_only_title">
          <h1>{questionTitle}</h1>
        </div>
      )}

      <div className="main_question_block_text">
        <p>
          {isNested && parentUser && (
            <span style={{ color: "#6069ff", marginRight: "5px" }}>
              {parentUser.full_name},
            </span>
          )}
          {answer.text}
        </p>
      </div>

      <div className="main_question_block_actions">
        <div className="main_question_block_actions_left">
          <button
            type="button"
            className="s_btn s_btn_active s_btn--answer"
            disabled={!allowAnswerComments}
            title={
              allowAnswerComments
                ? undefined
                : "Комментарии к ответам отключены автором вопроса"
            }
            onClick={() => {
              if (allowAnswerComments) {
                onStartReplyToAnswer?.(answer.id, answer.user.full_name);
              }
              onScrollToAnswer();
            }}
          >
            Ответить
          </button>
          <div className="question_vote_container">
            <button
              className={`vote_btn like_btn ${user_vote === 1 ? "vote_btn--active" : ""}`}
              title="Мне нравится"
              onClick={() => vote(1)}
              disabled={votePending}
            >
              <svg width="18" height="18">
                <use xlinkHref="#thumb-up"></use>
              </svg>
              <span className="vote_count">{likes_count}</span>
            </button>
            <button
              className={`vote_btn dislike_btn ${user_vote === -1 ? "vote_btn--active" : ""}`}
              title="Мне не нравится"
              onClick={() => vote(-1)}
              disabled={votePending}
            >
              <svg width="18" height="18">
                <use xlinkHref="#thumb-down"></use>
              </svg>
              <span className="vote_count">{dislikes_count}</span>
            </button>
          </div>
        </div>
        <div className="main_question_block_actions_right">
          <button
            className="s_btn s_btn_icon btn_action_outline"
            title="Пожаловаться"
            onClick={() => onComplaint(answer.id)}
          >
            Пожаловаться
          </button>
          <button
            className={`s_btn s_btn_icon btn_action_outline btn-like ${isFavorited(answer.id) ? "btn-like--active" : ""}`}
            title="Мне нравится"
            onClick={() => toggleFavorite(answer.id)}
            disabled={isPending(answer.id)}
          >
            <svg width="14" height="12">
              <use xlinkHref="#like"></use>
            </svg>
          </button>
          <button
            className="s_btn s_btn_icon btn_action_outline"
            title="Поделиться"
          >
            <svg width="14" height="14">
              <use xlinkHref="#share"></use>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

type SharedAnswerProps = Omit<AnswerBlockProps, "answer" | "isBest" | "isNested">;

/** Как в макете: один ответ — одна карточка; комментарии к ответу — отдельные карточки ниже со сдвигом */
export function AnswerWithReplies({
  answer,
  isNested = false,
  isBestRoot = false,
  ...shared
}: SharedAnswerProps & {
  answer: QuestionPageAnswer;
  isNested?: boolean;
  isBestRoot?: boolean;
}) {
  return (
    <Fragment>
      <AnswerBlock
        {...shared}
        answer={answer}
        isNested={isNested}
        isBest={isBestRoot}
      />
      {answer.answers?.map((child) => (
        <AnswerWithReplies
          key={child.id}
          {...shared}
          answer={child}
          isNested
          isBestRoot={false}
        />
      ))}
    </Fragment>
  );
}
