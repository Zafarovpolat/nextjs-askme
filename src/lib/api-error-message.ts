/** Сообщение для пользователя из ответа API (422 message / errors / сеть). */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  const e = err as { message?: string; errors?: Record<string, string[]> };
  if (e.errors) {
    const lists = Object.values(e.errors);
    const firstArr = lists.find((a) => Array.isArray(a) && a.length > 0) as
      | string[]
      | undefined;
    const first = firstArr?.[0]?.trim();
    if (first) return first;
  }
  const msg = e.message?.trim();
  if (msg) return msg;
  return "Произошла ошибка. Попробуйте ещё раз.";
}
