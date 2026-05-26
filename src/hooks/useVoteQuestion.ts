"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { useAuthStore } from "@/store/authStore";
import { showSystemToast } from "@/store/systemToastStore";

export type VoteValue = 1 | -1;

export interface VoteQuestionState {
  likes_count: number;
  dislikes_count: number;
  votes_score: number;
  user_vote: VoteValue | null;
}

export interface VoteQuestionResult {
  likes_count: number;
  dislikes_count: number;
  votes_score: number;
  user_vote: VoteValue;
}

/**
 * Хук для голосования (лайк/дизлайк) на вопросе.
 * Убрать голос нельзя, можно только сменить лайк↔дизлайк.
 */
export function useVoteQuestion(
  questionId: number,
  initialState: {
    likes_count?: number;
    dislikes_count?: number;
    votes_score?: number;
    user_vote?: VoteValue | null;
  }
) {
  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const [state, setState] = useState<VoteQuestionState>({
    likes_count: initialState.likes_count ?? 0,
    dislikes_count: initialState.dislikes_count ?? 0,
    votes_score: initialState.votes_score ?? 0,
    user_vote: initialState.user_vote ?? null,
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
    async (voteValue: VoteValue): Promise<VoteQuestionResult | null> => {
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
        }>(`v1/questions/${questionId}/vote`, { vote: voteValue });

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
    [questionId, isAuthorized, router]
  );

  return {
    likes_count: state.likes_count,
    dislikes_count: state.dislikes_count,
    votes_score: state.votes_score,
    user_vote: state.user_vote,
    vote,
    pending,
  };
}
