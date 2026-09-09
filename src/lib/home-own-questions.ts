import type { QuestionListItem } from "@/components/QuestionListCard";

const STORAGE_KEY = "otvetai_home_own_questions";
const MAX_ITEMS = 20;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readHomeOwnQuestions(): QuestionListItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is QuestionListItem =>
        Boolean(item) && typeof item === "object" && typeof (item as QuestionListItem).id === "number",
    );
  } catch {
    return [];
  }
}

export function rememberHomeOwnQuestion(card: QuestionListItem): void {
  if (!canUseStorage()) return;
  const rest = readHomeOwnQuestions().filter((item) => item.id !== card.id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([card, ...rest].slice(0, MAX_ITEMS)));
}
