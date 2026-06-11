export const PLAIN_TEXT_SPAM_MESSAGE = "Текст содержит недопустимые символы.";

const DISALLOWED_RE = /[\p{M}\p{Cf}\p{Co}\p{Cn}]/u;

export function containsSpamUnicode(value: string): boolean {
  return DISALLOWED_RE.test(value);
}

/** Убирает комбинируемые/невидимые символы при вводе. */
export function sanitizePlainTextInput(value: string): string {
  return Array.from(value)
    .filter((ch) => !DISALLOWED_RE.test(ch))
    .join("");
}
