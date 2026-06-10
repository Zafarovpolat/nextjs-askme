"use client";

import Link from "next/link";
import { Fragment, type MouseEvent } from "react";
import UserAvatar from "@/components/UserAvatar";
import { formatTimeAgo } from "@/lib/time-ago";
import { formatCompactCount, voteCountTitle } from "@/lib/format-compact-count";
import { useVoteAnswer } from "@/hooks/useVoteAnswer";
import { useFavoriteAnswer } from "@/hooks/useFavoriteAnswer";
import type { QuestionPageAnswer } from "@/types";
import TextWithLinks from "@/components/TextWithLinks";
import BodyAttachments from "@/components/BodyAttachments";
import {
  displayPremiumBadge,
  displayUserName,
  displayUserSubtitle,
} from "@/lib/ai-user-display";
import type { AnswerAnchorRef } from "@/lib/question-answer-tree";
import { buildAnswerAnchorHash } from "@/lib/question-answer-tree";

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
  /** Прямой ответ на вопрос (для якоря #answer-{root}-coment-{id}) */
  rootAnswerId?: number;
  onShareClick?: (e: MouseEvent<HTMLButtonElement>, anchor: AnswerAnchorRef) => void;
  onLoadMoreComments?: (parentAnswerId: number) => void;
  commentsLoadingMore?: Record<number, boolean>;
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
  rootAnswerId,
  onShareClick,
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

  const anchorRef: AnswerAnchorRef =
    rootAnswerId != null && answer.id !== rootAnswerId
      ? { targetId: answer.id, rootAnswerId }
      : { targetId: answer.id };

  const isNegative = (dislikes_count ?? 0) > (likes_count ?? 0);
  const parentUser = answer.parent_user;
  const isAuthorPremium = Boolean(
    answer.user.premium_is_active ?? answer.user.is_premium,
  );
  const premiumText = displayPremiumBadge(answer.user) ?? "Премиум";
  const rankLabel = displayUserSubtitle(answer.user) || "Участник";

  return (
    <div
      id={`answer-${answer.id}`}
      className={`main_question_block ${isBest ? "best_answer_block" : ""} ${isNested ? "secondary_question_block" : ""} ${isNegative ? "blocked_question_block" : ""} ${isAuthorPremium ? "premium-question" : ""}`}
      style={
        isNested
          ? { width: "calc(100% - 40px)", marginLeft: "40px" }
          : undefined
      }
      data-nested={isNested ? "true" : undefined}
    >
      {/* п.29 — исправлена вложенность: div > Link:inline вместо Link > div */}
      <div className="question_list_item-info">
        <div className="question_list_item_left">
          <div style={{ position: "relative", display: "inline-block" }}>
            <Link
              href={`/profile/${answer.user.id}`}
              style={{ display: "inline-block" }}
            >
              <UserAvatar
                src={answer.user.avatar_url}
                src2x={answer.user.avatar_url_2x}
                alt={displayUserName(answer.user)}
                size={40}
                premium={
                  answer.user.premium_is_active ??
                  answer.user.is_premium ??
                  false
                }
                premiumText={premiumText}
              />
            </Link>
          </div>
          <div className="answer_author_container question_list_item_left__user_meta">
            <div className="answer_author_info">
              <Link
                href={`/profile/${answer.user.id}`}
                className="main_text"
                title={displayUserName(answer.user)}
              >
                {displayUserName(answer.user)}
              </Link>
              {parentUser && (
                <>
                  <span className="reply_text">в ответ</span>
                  <Link
                    href={`/profile/${parentUser.id}`}
                    className="reply_to_text"
                    title={parentUser.full_name}
                  >
                    {parentUser.full_name}
                  </Link>
                </>
              )}
            </div>
            <div className="quest_user_title">
              <p>{rankLabel}</p>
            </div>
            <span>{formatTimeAgo(answer.created_at)}</span>
          </div>
          <div className="quest_user_title">
            <p>{rankLabel}</p>
          </div>
        </div>
        {!isBest && !isNested && canSelectBestAnswer && onSetBestAnswer ? (
          <div className="question_list_item_right">
            <button
              type="button"
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
        {isBest ? (
          <div className="question_list_item_right">
            <button
              type="button"
              className="s_btn s_btn_icon btn_star_answer_active btn_star_tooltip"
              disabled
              aria-label="Лучший ответ"
            >
              <svg width="15" height="15">
                <use xlinkHref="#star-best"></use>
              </svg>
              <span className="star_tooltip_text">Лучший ответ</span>
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
        <div className="main_question_block_text-body">
          {isNested && parentUser && (
            <span style={{ color: "#6069ff", marginRight: "5px" }}>
              {parentUser.full_name},
            </span>
          )}
          <TextWithLinks text={answer.text} />
        </div>
        <BodyAttachments
          files={answer.files}
          videos={answer.videos}
          links={answer.links}
        />
      </div>

      <div className="main_question_block_actions">
        <div className="main_question_block_actions_left">
          {allowAnswerComments ? (
            <button
              type="button"
              className="s_btn s_btn_active s_btn--answer"
              onClick={() => {
                onStartReplyToAnswer?.(answer.id, answer.user.full_name);
                onScrollToAnswer();
              }}
            >
              Ответить
            </button>
          ) : null}
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
              <span className="vote_count" title={voteCountTitle(likes_count)}>
                {formatCompactCount(likes_count)}
              </span>
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
              <span className="vote_count" title={voteCountTitle(dislikes_count)}>
                {formatCompactCount(dislikes_count)}
              </span>
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
          {/* п.26 — копирование ссылки с якорем */}
          <button
            className="s_btn s_btn_icon btn_action_outline"
            title="Скопировать ссылку"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}${buildAnswerAnchorHash(anchorRef)}`;
              navigator.clipboard.writeText(url).catch(() => {});
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 486.465 486.465"
              fill="currentColor"
            >
              <path d="M453.323,39.655l-16.564-14.656C418.729,9.021,395.521,0.22,371.405,0.22c-28.223,0-55.118,12.079-73.791,33.143L250.207,86.86c-6.105,6.876-9.164,15.722-8.608,24.901c0.557,9.166,4.642,17.576,11.518,23.673l4.438,3.94c6.299,5.594,14.416,8.673,22.842,8.673l2.054-0.059c9.166-0.551,17.582-4.637,23.699-11.523l47.418-53.503c8.342-9.416,24.169-10.362,33.601-2.026l16.558,14.688c4.748,4.203,7.57,10.021,7.955,16.384c0.386,6.358-1.722,12.465-5.937,17.208L302.042,246.198c-6.982,7.887-19.377,10.164-28.734,5.342c-14.577-7.519-33.58-3.93-44.392,8.256l-0.813,0.926c-7.573,8.518-10.727,19.838-8.674,31.104c2.074,11.198,9.047,20.801,19.153,26.09c13.986,7.311,29.763,11.33,45.621,11.33h0.012c28.21,0,55.117-12.238,73.8-33.308l103.691-117.046C497.746,138.226,494.004,75.731,453.323,39.655z" />
              <path d="M228.873,347.458c-13.669-12.103-36.426-10.743-48.574,2.938l-47.396,53.487c-8.342,9.412-24.159,10.387-33.58,2.043l-16.576-14.705c-4.747-4.207-7.57-10.025-7.955-16.383c-0.387-6.348,1.722-12.453,5.935-17.196l103.692-116.974c6.876-7.765,19.047-10.111,28.297-5.566c15.121,7.448,34.359,3.818,46.05-9.416c7.433-8.374,10.555-19.496,8.586-30.463c-1.956-11.031-8.747-20.389-18.618-25.666c-14.201-7.604-30.274-11.624-46.466-11.624c-28.223,0-55.118,12.084-73.791,33.151L24.772,308.038c-36.062,40.666-32.308,103.082,8.361,139.143l16.564,14.482c18.021,15.979,41.229,24.582,65.345,24.582c0.011,0,0,0,0.011,0c28.223,0,55.129-11.889,73.812-32.957l47.388-53.379c6.116-6.887,9.176-15.691,8.618-24.819c-0.533-9.068-4.736-17.694-11.538-23.706L228.873,347.458z" />
            </svg>
          </button>
          <button
            type="button"
            className="s_btn s_btn_icon btn_action_outline"
            title="Поделиться"
            onClick={(e) => onShareClick?.(e, anchorRef)}
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

type SharedAnswerProps = Omit<
  AnswerBlockProps,
  "answer" | "isBest" | "isNested"
>;

/** Как в макете: один ответ — одна карточка; комментарии к ответу — отдельные карточки ниже со сдвигом */
export function AnswerWithReplies({
  answer,
  isNested = false,
  isBestRoot = false,
  rootAnswerId: rootAnswerIdProp,
  allowAnswerComments = true,
  onLoadMoreComments,
  commentsLoadingMore,
  ...shared
}: SharedAnswerProps & {
  answer: QuestionPageAnswer;
  isNested?: boolean;
  isBestRoot?: boolean;
  rootAnswerId?: number;
}) {
  const rootAnswerId = rootAnswerIdProp ?? answer.id;
  const loadedComments = answer.answers?.length ?? 0;
  const totalComments = answer.answers_count ?? 0;
  const hasMoreComments =
    allowAnswerComments &&
    totalComments > loadedComments &&
    onLoadMoreComments != null;
  const commentsLoading = Boolean(commentsLoadingMore?.[answer.id]);

  return (
    <Fragment>
      <AnswerBlock
        {...shared}
        answer={answer}
        isNested={isNested}
        isBest={isBestRoot}
        rootAnswerId={rootAnswerId}
      />
      {answer.answers?.map((child) => (
        <AnswerWithReplies
          key={child.id}
          {...shared}
          answer={child}
          isNested
          isBestRoot={false}
          rootAnswerId={rootAnswerId}
        />
      ))}
      {hasMoreComments ? (
        <div
          className="show_more_btn_wrapper answer-comments-load-more"
          style={{ marginLeft: isNested ? 40 : 0 }}
        >
          <button
            className="show_more_btn"
            type="button"
            onClick={() => onLoadMoreComments?.(answer.id)}
            disabled={commentsLoading}
          >
            <svg width="22" height="22">
              <use xlinkHref="#sync"></use>
            </svg>
            <span>{commentsLoading ? "Загрузка..." : "Загрузить еще"}</span>
          </button>
        </div>
      ) : null}
    </Fragment>
  );
}
