import Cookies from 'js-cookie'

const THEME_KEY = 'otvetai_theme'

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location?.protocol === 'https:',
  expires: 365,
}

export type Theme = 'light' | 'dark'

export function getTheme(): Theme | undefined {
  const v = Cookies.get(THEME_KEY)
  return v === 'dark' || v === 'light' ? v : undefined
}

export function setTheme(theme: Theme): void {
  Cookies.set(THEME_KEY, theme, COOKIE_OPTIONS)
}
