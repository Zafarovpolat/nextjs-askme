import type { AnswerAnchorCommentStep, QuestionPageAnswer } from "@/types";

/** Якорь: прямой ответ или комментарий (с id корневого ответа на вопрос) */
export interface AnswerAnchorRef {
  targetId: number;
  rootAnswerId?: number;
}

export function buildAnswerAnchorHash(ref: AnswerAnchorRef): string {
  if (ref.rootAnswerId != null && ref.targetId !== ref.rootAnswerId) {
    return `#answer-${ref.rootAnswerId}-coment-${ref.targetId}`;
  }
  return `#answer-${ref.targetId}`;
}

export function parseAnswerAnchorHash(hash: string): AnswerAnchorRef | null {
  const commentMatch = hash.match(/^#answer-(\d+)-coment-(\d+)$/i);
  if (commentMatch) {
    const rootAnswerId = Number.parseInt(commentMatch[1], 10);
    const targetId = Number.parseInt(commentMatch[2], 10);
    if (rootAnswerId > 0 && targetId > 0) {
      return { rootAnswerId, targetId };
    }
    return null;
  }

  const answerMatch = hash.match(/^#answer-(\d+)$/);
  if (answerMatch) {
    const targetId = Number.parseInt(answerMatch[1], 10);
    if (targetId > 0) return { targetId };
  }

  return null;
}

export function anchorRefKey(ref: AnswerAnchorRef): string {
  return ref.rootAnswerId != null
    ? `${ref.rootAnswerId}-coment-${ref.targetId}`
    : String(ref.targetId);
}

export function findAnswerInTree(
  answers: QuestionPageAnswer[],
  answerId: number
): QuestionPageAnswer | null {
  for (const answer of answers) {
    if (answer.id === answerId) return answer;
    if (answer.answers?.length) {
      const nested = findAnswerInTree(answer.answers, answerId);
      if (nested) return nested;
    }
  }
  return null;
}

export function ensureRootInAnswersList(
  answers: QuestionPageAnswer[],
  rootId: number,
  bestAnswer?: QuestionPageAnswer | null
): QuestionPageAnswer[] {
  if (findAnswerInTree(answers, rootId)) return answers;
  if (bestAnswer?.id === rootId) {
    const rest = answers.filter((a) => a.id !== rootId);
    return [{ ...bestAnswer, answers: bestAnswer.answers ?? [] }, ...rest];
  }
  return answers;
}

export function mergeChildrenIntoTree(
  answers: QuestionPageAnswer[],
  parentId: number,
  children: QuestionPageAnswer[]
): QuestionPageAnswer[] {
  return answers.map((answer) => {
    if (answer.id === parentId) {
      const existing = answer.answers ?? [];
      const merged = [...existing];
      for (const child of children) {
        if (!merged.some((a) => a.id === child.id)) {
          merged.push(child);
        }
      }
      return { ...answer, answers: merged };
    }
    if (answer.answers?.length) {
      return {
        ...answer,
        answers: mergeChildrenIntoTree(answer.answers, parentId, children),
      };
    }
    return answer;
  });
}

function loadedCommentPages(parent: QuestionPageAnswer | null, perPage: number): number {
  const count = parent?.answers?.length ?? 0;
  if (count === 0) return 0;
  return Math.ceil(count / perPage);
}

export async function loadCommentPagesForStep(
  answers: QuestionPageAnswer[],
  step: AnswerAnchorCommentStep,
  perPage: number,
  fetchPage: (parentId: number, page: number) => Promise<QuestionPageAnswer[]>
): Promise<QuestionPageAnswer[]> {
  let merged = answers;
  if (findAnswerInTree(merged, step.child_id)) return merged;

  const parent = findAnswerInTree(merged, step.parent_id);
  if (!parent) return merged;

  let loadedPages = loadedCommentPages(parent, perPage);

  while (loadedPages < step.page) {
    loadedPages += 1;
    const pageAnswers = await fetchPage(step.parent_id, loadedPages);
    if (pageAnswers.length === 0) break;
    merged = mergeChildrenIntoTree(merged, step.parent_id, pageAnswers);
    if (findAnswerInTree(merged, step.child_id)) return merged;
  }

  return merged;
}

function waitForScrollEnd(timeoutMs = 2500): Promise<void> {
  if ("onscrollend" in window) {
    return new Promise((resolve) => {
      const timer = window.setTimeout(resolve, timeoutMs);
      window.addEventListener(
        "scrollend",
        () => {
          window.clearTimeout(timer);
          resolve();
        },
        { once: true, capture: true }
      );
    });
  }

  return new Promise((resolve) => {
    let lastY = window.scrollY;
    let stableFrames = 0;
    const startedAt = Date.now();

    const tick = () => {
      if (Date.now() - startedAt > timeoutMs) {
        resolve();
        return;
      }

      const y = window.scrollY;
      if (y === lastY) {
        stableFrames += 1;
        if (stableFrames >= 4) {
          resolve();
          return;
        }
      } else {
        stableFrames = 0;
        lastY = y;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

export async function highlightAnswerElement(
  answerId: number,
  durationMs = 500
): Promise<boolean> {
  const el = document.getElementById(`answer-${answerId}`);
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  await waitForScrollEnd();
  el.classList.add("answer-anchor-highlight");
  window.setTimeout(() => {
    el.classList.remove("answer-anchor-highlight");
  }, durationMs);
  return true;
}
