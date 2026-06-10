function formatCompactUnit(num: number): string {
  if (num >= 100) {
    return String(Math.round(num));
  }

  const rounded = Math.round(num * 10) / 10;
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return rounded.toFixed(1).replace(/\.0$/, "");
}

function pluralIndex(value: number): 0 | 1 | 2 {
  const abs = Math.abs(Math.trunc(value));
  const cases = [2, 0, 1, 1, 1, 2] as const;
  return abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
}

/** 900 → «900», 9000 → «9тыс», 9_000_000 → «9млн» */
export function formatCompactCount(value: number): string {
  const n = Math.trunc(value);
  if (!Number.isFinite(n) || n <= 0) {
    return "0";
  }

  if (n < 1000) {
    return String(n);
  }

  if (n < 1_000_000) {
    return `${formatCompactUnit(n / 1000)}тыс`;
  }

  if (n < 1_000_000_000) {
    return `${formatCompactUnit(n / 1_000_000)}млн`;
  }

  return `${formatCompactUnit(n / 1_000_000_000)}млрд`;
}

/** «+9тыс» для счётчиков лайков/ответов в карточках */
export function formatCompactCountPlus(value: number): string {
  const n = Math.trunc(value);
  if (!Number.isFinite(n) || n <= 0) {
    return "+0";
  }

  return `+${formatCompactCount(n)}`;
}

/** «1250 баллов» → «1.3тыс баллов»; до 999 — обычное склонение */
export function formatCompactNumWord(
  value: number,
  words: [string, string, string],
): string {
  const n = Math.trunc(value);
  if (!Number.isFinite(n) || n <= 0) {
    return `0 ${words[2]}`;
  }

  if (n < 1000) {
    return `${n} ${words[pluralIndex(n)]}`;
  }

  return `${formatCompactCount(n)} ${words[2]}`;
}

/** Полное число для title, если отображение сокращено. */
export function compactCountTitle(value: number): string | undefined {
  const n = Math.trunc(value);
  if (!Number.isFinite(n) || n <= 0) {
    return undefined;
  }

  const compact = formatCompactCount(n);
  const full = String(n);
  return compact !== full ? full : undefined;
}

/** @deprecated используйте compactCountTitle */
export const voteCountTitle = compactCountTitle;
