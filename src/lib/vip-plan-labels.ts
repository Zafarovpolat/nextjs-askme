export function getAdvancedAnswerLabel(count: number): string {
  if (count === 1) return "На каждый вопрос 1 продвинутый ответ";
  if (count >= 2 && count <= 4) return `На каждый вопрос ${count} продвинутых ответа`;
  return `На каждый вопрос ${count} продвинутых ответов`;
}
