"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { useAuthStore } from "@/store/authStore";
import { showSystemToast } from "@/store/systemToastStore";

export type VoteValue = 1 | -1;

/**
 * Хук для голосования (лайк/дизлайк) на ответе.
 */
export function useVoteAnswer(
  questionId: number,
  answerId: number,
  initialState: {
    likes_count?: number;
    dislikes_count?: number;
    votes_score?: number;
    user_vote?: VoteValue | null;
  }
) {
  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const [state, setState] = useState({
    likes_count: initialState.likes_count ?? 0,
    dislikes_count: initialState.dislikes_count ?? 0,
    votes_score: initialState.votes_score ?? 0,
    user_vote: (initialState.user_vote ?? null) as VoteValue | null,
  });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setState({
      likes_count: initialState.likes_count ?? 0,
      dislikes_count: initialState.dislikes_count ?? 0,
      votes_score: initialState.votes_score ?? 0,
      user_vote: (initialState.user_vote ?? null) as VoteValue | null,
    });
  }, [
    initialState.likes_count,
    initialState.dislikes_count,
    initialState.votes_score,
    initialState.user_vote,
  ]);

  const vote = useCallback(
    async (voteValue: VoteValue) => {
      if (!isAuthorized) {
        router.push("/login");
        return null;
      }

      setPending(true);
      try {
        const data = await api.post<{
          likes_count: number;
          dislikes_count: number;
          votes_score: number;
          user_vote: VoteValue;
        }>(`v1/questions/${questionId}/answers/${answerId}/vote`, {
          vote: voteValue,
        });

        setState({
          likes_count: data.likes_count,
          dislikes_count: data.dislikes_count,
          votes_score: data.votes_score,
          user_vote: data.user_vote,
        });
        return data;
      } catch (err) {
        showSystemToast(getApiErrorMessage(err), "error");
        return null;
      } finally {
        setPending(false);
      }
    },
    [questionId, answerId, isAuthorized, router]
  );

  return {
    ...state,
    vote,
    pending,
  };
}
