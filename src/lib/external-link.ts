/**
 * Сравнение с origin приложения (NEXT_PUBLIC_SITE_URL или window.location).
 */
export function getAppOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) {
    try {
      return new URL(env).origin
    } catch {
      /* fallthrough */
    }
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'https://otvetai.ru'
}

/**
 * Убрать типичные знаки препинания с конца совпавшей подстроки URL.
 */
export function trimUrlTrailingPunctuation(raw: string): string {
  return raw.replace(/[.,;:!?]+$/, '')
}

const HTTP_URL_RE = /https?:\/\/[^\s<]+/gi

/**
 * Нарезка текста на куски «текст» / «url» (только http(s)).
 */
export function parseHttpUrlsFromText(text: string): Array<
  { type: 'text'; value: string } | { type: 'url'; value: string }
> {
  const parts: Array<
    { type: 'text'; value: string } | { type: 'url'; value: string }
  > = []
  let last = 0
  const re = new RegExp(HTTP_URL_RE.source, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: 'text', value: text.slice(last, m.index) })
    }
    parts.push({ type: 'url', value: trimUrlTrailingPunctuation(m[0]) })
    last = m.index + m[0].length
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) })
  }
  return parts
}

/** Всегда навешивается на внешние ссылки из контента пользователей. */
export const UGC_EXTERNAL_REL = "nofollow ugc noopener noreferrer";

export function ugcExternalAnchorProps(href: string | undefined): {
  rel: string;
  target: "_blank";
} | Record<string, never> {
  if (!href || !isExternalHref(href)) {
    return {};
  }
  return { rel: UGC_EXTERNAL_REL, target: "_blank" };
}

/**
 * true — ссылка ведёт с текущего сайта (включая относительные /mailto/tel).
 * false — открывать через предупреждение о внешнем ресурсе.
 */
export function isExternalHref(href: string): boolean {
  const t = href.trim()
  if (!t) return false
  const low = t.toLowerCase()
  if (
    low.startsWith('mailto:') ||
    low.startsWith('tel:') ||
    low.startsWith('sms:')
  ) {
    return false
  }
  if (low.startsWith('javascript:') || low.startsWith('data:')) {
    return true
  }
  if (t.startsWith('/') && !t.startsWith('//')) {
    return false
  }
  if (t.startsWith('#')) {
    return false
  }
  const app = getAppOrigin()
  try {
    const base =
      typeof window !== 'undefined' ? window.location.origin : app
    const resolved = new URL(t, base)
    if (resolved.protocol === 'javascript:') {
      return true
    }
    return resolved.origin !== app
  } catch {
    return true
  }
}

/** Подпись ссылки как в макете (в основном хост, например www.example.com). */
export function displayUrlLabel(href: string): string {
  try {
    const u = new URL(href.trim(), 'https://placeholder.invalid')
    return u.host || href.slice(0, 80)
  } catch {
    return href.replace(/^https?:\/\//i, '').split('/')[0].slice(0, 80)
  }
}

