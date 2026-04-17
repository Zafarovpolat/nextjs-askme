/**
 * Дублирует `App\Support\UserPointsConfig` и пороги уровней из `UserController::getNextLevelThreshold`.
 * Менять вместе с PHP.
 */

export const LEVEL_BALL_THRESHOLDS = [
  0, 250, 500, 1000, 2500, 5000, 20000, 50000, 100000,
] as const;

export const ANSWER_REWARD_STUDENT_LEVEL_MAX = 1;
export const ANSWER_REWARD_STUDENT = 2;
export const LOW_KPD_ANSWERS_STUB = 99999;

export function getNextLevelThreshold(balls: number): number | null {
  const b = Math.max(0, balls);
  for (const t of LEVEL_BALL_THRESHOLDS) {
    if (b < t) {
      return t;
    }
  }
  return null;
}

export function getBallsToNextLevel(balls: number): number | null {
  const next = getNextLevelThreshold(balls);
  if (next === null) {
    return null;
  }
  return Math.max(0, next - Math.max(0, balls));
}

/** Доля пути от предыдущего порога к следующему (0…100), для слайдера «до следующего уровня по баллам». */
export function getLevelSegmentProgressPercent(balls: number): number {
  const b = Math.max(0, balls);
  const thresholds = LEVEL_BALL_THRESHOLDS as readonly number[];
  let prev: number = thresholds[0];
  for (let i = 1; i < thresholds.length; i++) {
    const next = thresholds[i];
    if (b < next) {
      const span = next - prev;
      if (span <= 0) {
        return 0;
      }
      return Math.max(0, Math.min(100, ((b - prev) / span) * 100));
    }
    prev = next;
  }
  return 100;
}

export function answerRewardExpertByKpd(kpd: number): number {
  if (kpd < 0.02) {
    return 0;
  }
  if (kpd < 0.04) {
    return 1;
  }
  if (kpd < 0.12) {
    return 2;
  }
  if (kpd < 0.18) {
    return 3;
  }
  if (kpd < 0.3) {
    return 4;
  }
  return 5;
}

/** Баллы за новый корневой ответ (не комментарий), как в `UserPointsConfig::answerRewardForNewTopLevelAnswer`. */
export function answerRewardForNewTopLevelAnswer(level: number, kpd: number): number {
  if (level <= ANSWER_REWARD_STUDENT_LEVEL_MAX) {
    return ANSWER_REWARD_STUDENT;
  }
  return answerRewardExpertByKpd(kpd);
}
