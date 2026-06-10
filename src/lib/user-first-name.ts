export const USER_FIRST_NAME_MAX_LENGTH = 32;

const USER_FIRST_NAME_CHAR_PATTERN = /^[a-zA-Zа-яА-ЯёЁ0-9 ]$/u;
const USER_FIRST_NAME_VALUE_PATTERN = /^[a-zA-Zа-яА-ЯёЁ0-9 ]+$/u;

export function sanitizeUserFirstNameInput(value: string): string {
  const chars = Array.from(value).filter((ch) => USER_FIRST_NAME_CHAR_PATTERN.test(ch));
  return chars.join("").slice(0, USER_FIRST_NAME_MAX_LENGTH);
}

export function validateUserFirstName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Введите имя.";
  }
  if (trimmed.length > USER_FIRST_NAME_MAX_LENGTH) {
    return `Имя не должно быть длиннее ${USER_FIRST_NAME_MAX_LENGTH} символов.`;
  }
  if (!USER_FIRST_NAME_VALUE_PATTERN.test(trimmed)) {
    return "Имя может содержать только латинские и кириллические буквы, цифры и пробелы.";
  }
  return null;
}
