"use client";

import { create } from "zustand";

export type MeFavoritesData = {
  favorite_question_ids: number[];
  favorite_answer_ids: number[];
  subscribed_user_ids: number[];
  subscribed_question_ids: number[];
};

type FavoritesState = {
  favoriteQuestionIds: Set<number>;
  favoriteAnswerIds: Set<number>;
  subscribedUserIds: Set<number>;
  subscribedQuestionIds: Set<number>;
  setFromMe: (data: MeFavoritesData) => void;
  setQuestionFavorited: (questionId: number, favorited: boolean) => void;
  setAnswerFavorited: (answerId: number, favorited: boolean) => void;
  clear: () => void;
};

const emptySet = new Set<number>();

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favoriteQuestionIds: emptySet,
  favoriteAnswerIds: emptySet,
  subscribedUserIds: emptySet,
  subscribedQuestionIds: emptySet,

  setFromMe: (data) =>
    set({
      favoriteQuestionIds: new Set(data.favorite_question_ids ?? []),
      favoriteAnswerIds: new Set(data.favorite_answer_ids ?? []),
      subscribedUserIds: new Set(data.subscribed_user_ids ?? []),
      subscribedQuestionIds: new Set(data.subscribed_question_ids ?? []),
    }),

  setQuestionFavorited: (questionId, favorited) =>
    set((state) => {
      const next = new Set(state.favoriteQuestionIds);
      if (favorited) {
        next.add(questionId);
      } else {
        next.delete(questionId);
      }
      return { favoriteQuestionIds: next };
    }),

  setAnswerFavorited: (answerId, favorited) =>
    set((state) => {
      const next = new Set(state.favoriteAnswerIds);
      if (favorited) {
        next.add(answerId);
      } else {
        next.delete(answerId);
      }
      return { favoriteAnswerIds: next };
    }),

  clear: () =>
    set({
      favoriteQuestionIds: emptySet,
      favoriteAnswerIds: emptySet,
      subscribedUserIds: emptySet,
      subscribedQuestionIds: emptySet,
    }),
}));
