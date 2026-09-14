/**
 * Единая презентация уведомления для тоста, дропдауна в шапке и страницы /notifications.
 *
 * Бэкенд отдаёт title/hint только для событий от людей. У системных событий заголовок,
 * тип, иконка и баллы выводятся из data.type / data.delta_balls.
 */

import { BALL_WORDS, ruPluralWord } from "@/lib/format-compact-count";

export type NotificationKind =
  | "points"
  | "bonus"
  | "level"
  | "best"
  | "like"
  | "answer"
  | "comment"
  | "premium"
  | "warning"
  | "system";

export type NotificationPresentation = {
  kind: NotificationKind;
  /** Короткий заголовок — есть всегда. */
  title: string;
  /** Подпись под заголовком — только если пришла с бэкенда. */
  hint: string | null;
  /** Текст без дублирующего «Начислено N баллов.», если баллы вынесены в чип. */
  text: string;
  points: number | null;
  pointsLabel: string | null;
  useActorAvatar: boolean;
};

type PresentableNotification = {
  title?: string | null;
  hint?: string | null;
  text: string;
  data?: Record<string, unknown> | null;
  actor?: { id?: number; name?: string; avatar_url?: string | null } | null;
};

const TITLE_MAX = 64;

export function formatPoints(points: number): string {
  const sign = points > 0 ? "+" : "−";
  return `${sign}${Math.abs(points)} ${ruPluralWord(points, BALL_WORDS)}`;
}

function asFiniteInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n !== 0 ? Math.trunc(n) : null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function titleFromText(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0] ?? cleaned;
  const base = firstSentence.replace(/[.!?]+$/, "");
  if (base.length <= TITLE_MAX) return base || "Уведомление";
  return `${base.slice(0, TITLE_MAX - 1).trimEnd()}…`;
}

/**
 * Убирает отдельное предложение «Начислено N баллов.» — оно уходит в чип.
 * Связный текст вроде «За ответ начислено 3 балла» не трогаем.
 */
function stripPointsSentence(text: string): string {
  const stripped = text
    .replace(
      /(?:^|(?<=[.!?]\s))(?:Начислено|Списано|Снято|Возвращено)\s+\d+\s+балл(?:а|ов)?\.?/gu,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
  return stripped || text;
}

function pointsFromText(text: string): number | null {
  const gain = text.match(/(?:Начислено|Возвращено)\s+(\d+)\s+балл/iu);
  if (gain) return Number(gain[1]);
  const loss = text.match(/(?:Списано|Снято)\s+(\d+)\s+балл/iu);
  if (loss) return -Number(loss[1]);
  return null;
}

type KindRule = { kind: NotificationKind; title: string | ((d: Record<string, unknown>) => string) };

const RULES: Record<string, KindRule> = {
  daily_visit: { kind: "bonus", title: "Бонус за визит" },
  registration_bonus: { kind: "bonus", title: "Добро пожаловать!" },
  ask_question: { kind: "points", title: "Вопрос опубликован" },
  unanswered_refund: { kind: "points", title: "Баллы возвращены" },
  vote_best_poll: { kind: "points", title: "Голос учтён" },
  question_vote_participation: { kind: "points", title: "Оценка учтена" },
  question_liked_author_bonus: { kind: "like", title: "Ваш вопрос понравился" },
  level_up: {
    kind: "level",
    title: (d) => {
      const name = str(d.to_level_name);
      return name ? `Новый уровень: ${name}` : "Новый уровень";
    },
  },
  best_answer_awarded: { kind: "best", title: "Ваш ответ признан лучшим" },
  pick_best_answer_bonus: { kind: "best", title: "Лучший ответ выбран" },
  answer_reward: { kind: "best", title: "Награда за ответ" },
  best_answer_revoked: { kind: "system", title: "Статус лучшего ответа снят" },
  best_answer_question_deleted: { kind: "system", title: "Вопрос удалён" },
  answer_created: { kind: "answer", title: "Новый ответ" },
  answer_comment_created: { kind: "comment", title: "Новый комментарий" },
  premium_granted: { kind: "premium", title: "Премиум активирован" },
  premium_payment_succeeded: { kind: "premium", title: "Оплата прошла" },
  premium_gift_received: { kind: "premium", title: "Вам подарили Премиум" },
  premium_gift_sent: { kind: "premium", title: "Подарок отправлен" },
  rule_violation: { kind: "warning", title: "Нарушение правил" },
  auto_moderation_ban: { kind: "warning", title: "Ограничение доступа" },
  penalty: { kind: "warning", title: "Штраф" },
  admin_notification: { kind: "system", title: "Сообщение от администрации" },
  manual_reward: { kind: "points", title: "Начисление от администрации" },
  manual_reward_message: { kind: "system", title: "Сообщение от администрации" },
  manual_notification_score: { kind: "points", title: "Изменение баллов" },
  balls_adjusted_admin: { kind: "points", title: "Изменение баллов" },
  system_tip: { kind: "system", title: "Подсказка" },
};

export function presentNotification(n: PresentableNotification): NotificationPresentation {
  const data = n.data && typeof n.data === "object" ? n.data : {};
  const type = str(data.type);
  const rule = RULES[type];
  const backendTitle = str(n.title);
  const hint = str(n.hint) || null;
  const hasActor = Boolean(n.actor && (n.actor.id || n.actor.name));
  const rawText = (n.text ?? "").trim();

  const points = asFiniteInt(data.delta_balls) ?? pointsFromText(rawText);

  let kind: NotificationKind;
  let title: string;

  if (rule) {
    kind = rule.kind;
    title = typeof rule.title === "function" ? rule.title(data) : rule.title;
    if ((kind === "answer" || kind === "comment") && backendTitle) {
      title = backendTitle;
    }
  } else if (backendTitle) {
    kind = hasActor ? "answer" : points != null ? "points" : "system";
    title = backendTitle;
  } else {
    kind = points != null ? "points" : hasActor ? "answer" : "system";
    title = titleFromText(rawText);
  }

  const useActorAvatar = hasActor && (kind === "answer" || kind === "comment" || kind === "like");
  const text = points != null ? stripPointsSentence(rawText) : rawText;

  return {
    kind,
    title,
    hint,
    text,
    points,
    pointsLabel: points != null ? formatPoints(points) : null,
    useActorAvatar,
  };
}
