import Cookies from 'js-cookie'

/** Решение пользователя по cookie-категориям (отсутствие cookie = баннер ещё не показывали). */
export const COOKIE_CONSENT_KEY = 'cookie_consent'

export type CookieConsent = {
  /** Всегда true — технически необходимые. */
  necessary: true
  /** Яндекс.Метрика и аналогичная аналитика. */
  analytics: boolean
}

type ConsentListener = (consent: CookieConsent) => void

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location?.protocol === 'https:',
  expires: 365,
}

const listeners = new Set<ConsentListener>()

function parseConsent(raw: string | undefined): CookieConsent | null {
  if (!raw) return null
  // Формат: "n1.a1" | "n1.a0"
  const match = /^n1\.a([01])$/.exec(raw.trim())
  if (!match) return null
  return { necessary: true, analytics: match[1] === '1' }
}

function serializeConsent(consent: CookieConsent): string {
  return `n1.a${consent.analytics ? '1' : '0'}`
}

/** null — пользователь ещё не сделал выбор. */
export function getCookieConsent(): CookieConsent | null {
  return parseConsent(Cookies.get(COOKIE_CONSENT_KEY))
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent()?.analytics === true
}

export function setCookieConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = { necessary: true, analytics: !!analytics }
  Cookies.set(COOKIE_CONSENT_KEY, serializeConsent(consent), COOKIE_OPTIONS)
  listeners.forEach((fn) => fn(consent))
  return consent
}

export function subscribeCookieConsent(listener: ConsentListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
