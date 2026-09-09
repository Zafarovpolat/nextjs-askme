/** Канонический сегмент URL вопроса: только положительное целое без ведущих нулей. */
export function canonicalQuestionIdSegment(raw: string): string | null {
  const match = raw.trim().match(/^(\d+)/);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return String(n);
}
