import { displayUserName } from "@/lib/ai-user-display";
import { htmlToPlainText } from "@/lib/html-plain-text";
import { absolutePageUrl } from "@/lib/page-seo";
import type { QuestionPageAnswer, QuestionPageData, QuestionPageUser } from "@/types";

const TEXT_MAX = 8000;
const ANSWERS_IN_SCHEMA_MAX = 40;

/** Контент от обученной модели. Google: без этого свойства ответ считается человеческим. */
const TRAINED_MODEL_SOURCE =
  "https://schema.org/TrainedAlgorithmicMediaDigitalSource";

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

function applyCreatedDates(
  node: Record<string, unknown>,
  raw: string | null | undefined,
) {
  const created = toIsoDate(raw);
  if (!created) return;
  node.dateCreated = created;
  node.datePublished = created;
}

function authorNode(user: QuestionPageUser | undefined) {
  if (!user) return undefined;
  const name = displayUserName(user) || "Пользователь";

  if (user.is_ai) {
    const node: Record<string, string> = {
      "@type": "Organization",
      name,
    };
    const alternate = (user.ai_model_short ?? "").trim();
    if (alternate) node.alternateName = alternate;
    if (user.id) {
      node.url = absolutePageUrl(`/profile/${user.id}`);
    }
    return node;
  }

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
  applyCreatedDates(node, answer.created_at);
  if (answer.user?.is_ai) {
    node.digitalSourceType = TRAINED_MODEL_SOURCE;
  }
  const author = authorNode(answer.user);
  if (author) node.author = author;
  return node;
}

function voteRank(answer: QuestionPageAnswer): number {
  return (Number(answer.votes_score) || 0) * 1_000_000 + (Number(answer.likes_count) || 0);
}

function resolveAcceptedAnswer(
  question: QuestionPageData,
  byId: Map<number, QuestionPageAnswer>,
): QuestionPageAnswer | null {
  const official = question.best_answer ?? null;
  if (official?.id) return official;

  const authorId = question.author?.id;
  const candidates = [...byId.values()].filter(
    (a) => !authorId || a.user?.id !== authorId,
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => voteRank(b) - voteRank(a) || a.id - b.id);
  return candidates[0] ?? null;
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

  const accepted = resolveAcceptedAnswer(question, byId);
  const suggested: QuestionPageAnswer[] = [];
  for (const a of byId.values()) {
    if (accepted?.id && a.id === accepted.id) continue;
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

  applyCreatedDates(mainEntity, question.created_at);
  if (question.author?.is_ai) {
    mainEntity.digitalSourceType = TRAINED_MODEL_SOURCE;
  }
  const author = authorNode(question.author);
  if (author) mainEntity.author = author;

  if (accepted?.id) {
    mainEntity.acceptedAnswer = answerNode(accepted, questionPath);
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
