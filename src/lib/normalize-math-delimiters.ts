/**
 * Подготовка LaTeX перед react-markdown + remark-math.
 *
 * CommonMark превращает \[ и \( в обычные [ и ( — KaTeX их не видит.
 * Поэтому приводим к $...$ / $$...$$, которые remark-math обрабатывает надёжно.
 */

function looksLikeMath(inner: string): boolean {
  if (/\\[a-zA-Z]+/.test(inner)) return true
  if (/[\^_]/.test(inner)) return true
  if (/\\frac|\\sqrt|\\cdot|\\times|\\leq|\\geq|\\pi|\\lim/.test(inner)) return true
  if (/=/.test(inner) && /[a-zA-Z]/.test(inner) && /^[\s.a-zA-Z0-9+\-*/=(){}|,π'!]+$/.test(inner)) {
    return true
  }
  return false
}

function toInlineMath(inner: string): string {
  return `$${inner.trim()}$`
}

function toDisplayMath(inner: string): string {
  const trimmed = inner.trim()
  if (trimmed.includes('\n')) {
    return `$$\n${trimmed}\n$$`
  }
  return `$$${trimmed}$$`
}

export function normalizeMathDelimiters(text: string): string {
  let result = text

  // Блочные \[ ... \] → $$ ... $$
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner: string) => toDisplayMath(inner))

  // Строковые \( ... \) → $ ... $
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner: string) => toInlineMath(inner))

  // ИИ без бэкслэшей: [ ... ] (не markdown-ссылка)
  result = result.replace(/\[([^\]\n]+)\](?!\()/g, (match, inner: string) => {
    const trimmed = inner.trim()
    if (!trimmed || !looksLikeMath(trimmed)) {
      return match
    }
    return toInlineMath(trimmed)
  })

  // Уже «сломанные» ответы: ( ... \sqrt... ) вместо \( ... \)
  result = result.replace(/\(\s*([^()\n]*\\[a-zA-Z][^()\n]*)\s*\)/g, (match, inner: string) => {
    const trimmed = inner.trim()
    if (!trimmed || !looksLikeMath(trimmed)) {
      return match
    }
    return toInlineMath(trimmed)
  })

  return result
}
