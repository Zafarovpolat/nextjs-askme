"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-message";
import { useAuthStore } from "@/store/authStore";
import { showSystemToast } from "@/store/systemToastStore";
import { useFavoritesStore } from "@/store/favoritesStore";

/**
 * Хук для добавления/удаления ответа в избранное.
 */
export function useFavoriteAnswer() {
  const router = useRouter();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const favoriteAnswerIds = useFavoritesStore((s) => s.favoriteAnswerIds);
  const setAnswerFavorited = useFavoritesStore((s) => s.setAnswerFavorited);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const toggleFavorite = useCallback(
    async (answerId: number) => {
      if (!isAuthorized) {
        router.push("/login");
        return null;
      }

      setPendingId(answerId);
      try {
        const data = await api.post<{
          answer_id: number;
          favorited: boolean;
          message: string;
        }>(`v1/answers/${answerId}/favorite/toggle`);
        const favorited = data.favorited;
        setAnswerFavorited(answerId, favorited);
        return { favorited };
      } catch (err) {
        showSystemToast(getApiErrorMessage(err), "error");
        return null;
      } finally {
        setPendingId((prev) => (prev === answerId ? null : prev));
      }
    },
    [isAuthorized, router, setAnswerFavorited]
  );

  const isFavorited = useCallback(
    (answerId: number) => favoriteAnswerIds.has(answerId),
    [favoriteAnswerIds]
  );

  const isPending = useCallback(
    (answerId: number) => pendingId === answerId,
    [pendingId]
  );

  return { toggleFavorite, isFavorited, isPending };
}
