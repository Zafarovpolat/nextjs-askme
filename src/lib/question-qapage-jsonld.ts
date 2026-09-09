import { displayUserName } from "@/lib/ai-user-display";
import { htmlToPlainText } from "@/lib/html-plain-text";
import { absolutePageUrl } from "@/lib/page-seo";
import type { QuestionPageAnswer, QuestionPageData, QuestionPageUser } from "@/types";

const TEXT_MAX = 8000;
const ANSWERS_IN_SCHEMA_MAX = 40;

function toIsoDate(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function clipText(raw: string): string {
  if (raw.length <= TEXT_MAX) return raw;
  return `${raw.slice(0, TEXT_MAX - 1).trimEnd()}…`;
}

function personNode(user: QuestionPageUser | undefined) {
  if (!user) return undefined;
  const name = displayUserName(user) || "Пользователь";
  const node: Record<string, string> = {
    "@type": "Person",
    name,
  };
  if (user.id) {
    node.url = absolutePageUrl(`/profile/${user.id}`);
  }
  return node;
}

function answerNode(answer: QuestionPageAnswer, questionPath: string) {
  const text = clipText(htmlToPlainText(answer.text));
  const node: Record<string, unknown> = {
    "@type": "Answer",
    text: text || " ",
    url: `${absolutePageUrl(questionPath)}#answer-${answer.id}`,
    upvoteCount: Math.max(0, Number(answer.likes_count) || 0),
  };
  const created = toIsoDate(answer.created_at);
  if (created) node.dateCreated = created;
  const author = personNode(answer.user);
  if (author) node.author = author;
  return node;
}

/**
 * QAPage / Question / Answer для страницы вопроса.
 * Без прямых ответов разметка не отдаётся: Google требует acceptedAnswer или suggestedAnswer.
 */
export function buildQuestionQaPageJsonLd(
  question: QuestionPageData,
): Record<string, unknown> | null {
  const questionPath = `/question/${question.id}`;
  const best = question.best_answer ?? null;
  const topLevel = (question.answers ?? []).filter((a) => a?.id);
  const byId = new Map<number, QuestionPageAnswer>();
  if (best?.id) byId.set(best.id, best);
  for (const a of topLevel) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }

  if (byId.size === 0) return null;

  const suggested: QuestionPageAnswer[] = [];
  for (const a of byId.values()) {
    if (best?.id && a.id === best.id) continue;
    suggested.push(a);
    if (suggested.length >= ANSWERS_IN_SCHEMA_MAX) break;
  }

  const name = question.title?.trim() || "Вопрос";
  const text = clipText(htmlToPlainText(question.description) || name);
  const mainEntity: Record<string, unknown> = {
    "@type": "Question",
    name,
    text,
    url: absolutePageUrl(questionPath),
    answerCount: Math.max(byId.size, Number(question.answers_count) || 0),
    upvoteCount: Math.max(0, Number(question.likes_count) || 0),
  };

  const created = toIsoDate(question.created_at);
  if (created) mainEntity.dateCreated = created;
  const author = personNode(question.author);
  if (author) mainEntity.author = author;

  if (best?.id) {
    mainEntity.acceptedAnswer = answerNode(best, questionPath);
  }
  if (suggested.length === 1) {
    mainEntity.suggestedAnswer = answerNode(suggested[0], questionPath);
  } else if (suggested.length > 1) {
    mainEntity.suggestedAnswer = suggested.map((a) => answerNode(a, questionPath));
  }

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity,
  };
}
