/**
 * Склонение: 1 минута, 2 минуты, 5 минут.
 */
function numWord(value: number, words: [string, string, string]): string {
  const abs = Math.abs(value)
  const cases = [2, 0, 1, 1, 1, 2]
  const index = abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)]
  return `${value} ${words[index]}`
}

/**
 * Формат "X минут/часов/дней/недель/лет назад".
 * Ступени: минуты → часы → дни → недели → месяцы → годы.
 */
export function formatTimeAgo(dateIso: string): string {
  const now = Date.now()
  const date = new Date(dateIso).getTime()
  const diffMs = now - date
  if (diffMs < 0) return 'только что'

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return numWord(diffMin, ['минуту', 'минуты', 'минут']) + ' назад'
  if (diffHour < 24) return numWord(diffHour, ['час', 'часа', 'часов']) + ' назад'
  if (diffDay < 7) return numWord(diffDay, ['день', 'дня', 'дней']) + ' назад'
  if (diffWeek < 4) return numWord(diffWeek, ['неделю', 'недели', 'недель']) + ' назад'
  if (diffMonth < 12) return numWord(diffMonth, ['месяц', 'месяца', 'месяцев']) + ' назад'
  return numWord(diffYear, ['год', 'года', 'лет']) + ' назад'
}
