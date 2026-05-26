"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { useAuthStore } from "@/store/authStore";
import { showSystemToast } from "@/store/systemToastStore";
import { useFavoritesStore } from "@/store/favoritesStore";

type ToggleResult = { favorited: boolean } | null;

/**
 * Глобальный хук для добавления/удаления вопроса в избранное.
 * При клике без авторизации — редирект на /login.
 * Использует favoritesStore (данные из /me) для корректного отображения стиля кнопки.
 */
export function useFavoriteQuestion() {
  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const favoriteQuestionIds = useFavoritesStore((s) => s.favoriteQuestionIds);
  const setQuestionFavorited = useFavoritesStore((s) => s.setQuestionFavorited);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const toggleFavorite = useCallback(
    async (questionId: number): Promise<ToggleResult> => {
      if (!isAuthorized) {
        router.push("/login");
        return null;
      }

      setPendingId(questionId);
      try {
        const data = await api.post<{
          question_id: number;
          favorited: boolean;
          message: string;
        }>(`v1/questions/${questionId}/favorite/toggle`);
        const favorited = data.favorited;
        setQuestionFavorited(questionId, favorited);
        return { favorited };
      } catch (err) {
        showSystemToast(getApiErrorMessage(err), "error");
        return null;
      } finally {
        setPendingId((prev) => (prev === questionId ? null : prev));
      }
    },
    [isAuthorized, router, setQuestionFavorited],
  );

  const isFavorited = useCallback(
    (questionId: number): boolean => {
      return favoriteQuestionIds.has(questionId);
    },
    [favoriteQuestionIds],
  );

  const isPending = useCallback(
    (questionId: number): boolean => {
      return pendingId === questionId;
    },
    [pendingId],
  );

  return {
    toggleFavorite,
    isFavorited,
    isPending,
  };
}
