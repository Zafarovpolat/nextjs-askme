"use client";

import { useVoteQuestion } from "@/hooks/useVoteQuestion";
import { formatCompactCount, voteCountTitle } from "@/lib/format-compact-count";

type Props = {
  questionId: number;
  likesCount: number;
  dislikesCount: number;
  userVote: 1 | -1 | null;
};

/**
 * Лайк/дизлайк по вопросу в списке (профиль и т.п.) — те же счётчики и активное состояние, что на странице вопроса.
 */
export default function SearchResultQuestionVotes({
  questionId,
  likesCount,
  dislikesCount,
  userVote,
}: Props) {
  const { likes_count, dislikes_count, user_vote, vote, pending } = useVoteQuestion(questionId, {
    likes_count: likesCount,
    dislikes_count: dislikesCount,
    user_vote: userVote,
  });

  return (
    <div className="search-result-votes" style={{ marginTop: "10px" }}>
      <div className="question_vote_container">
        <button
          type="button"
          className={`vote_btn like_btn ${user_vote === 1 ? "vote_btn--active" : ""}`}
          title="Мне нравится"
          onClick={() => vote(1)}
          disabled={pending}
        >
          <svg width="18" height="18">
            <use xlinkHref="/sprites.svg#thumb-up"></use>
          </svg>
          <span className="vote_count" title={voteCountTitle(likes_count)}>
            {formatCompactCount(likes_count)}
          </span>
        </button>
        <button
          type="button"
          className={`vote_btn dislike_btn ${user_vote === -1 ? "vote_btn--active" : ""}`}
          title="Мне не нравится"
          onClick={() => vote(-1)}
          disabled={pending}
        >
          <svg width="18" height="18">
            <use xlinkHref="/sprites.svg#thumb-down"></use>
          </svg>
          <span className="vote_count" title={voteCountTitle(dislikes_count)}>
            {formatCompactCount(dislikes_count)}
          </span>
        </button>
      </div>
    </div>
  );
}
