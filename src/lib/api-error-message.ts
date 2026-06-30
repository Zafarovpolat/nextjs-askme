import { getFormApiErrorMessage } from "@/lib/form-api-error-message";

/** Сообщение для пользователя из ответа API (422 message / errors / сеть). */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  return getFormApiErrorMessage(err, "Произошла ошибка. Попробуйте ещё раз.");
}
