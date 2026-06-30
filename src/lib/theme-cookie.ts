import Cookies from 'js-cookie'
import {
  COLOR_THEME_COOKIE,
  DEFAULT_COLOR_THEME,
  RESOLVED_THEME_COOKIE,
  isColorThemePreference,
  resolveColorTheme,
  type ColorThemePreference,
  type ResolvedTheme,
} from '@/lib/color-theme'

export type Theme = ResolvedTheme

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location?.protocol === 'https:',
  expires: 365,
}

export function getColorThemePreference(): ColorThemePreference | undefined {
  const value = Cookies.get(COLOR_THEME_COOKIE)
  return isColorThemePreference(value) ? value : undefined
}

export function getResolvedTheme(): ResolvedTheme | undefined {
  const value = Cookies.get(RESOLVED_THEME_COOKIE)
  return value === 'dark' || value === 'light' ? value : undefined
}

/** @deprecated используйте getResolvedTheme */
export function getTheme(): Theme | undefined {
  return getResolvedTheme()
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('dark_mode', resolved === 'dark')
}

export function persistThemePreference(
  preference: ColorThemePreference,
  now: Date = new Date(),
): ResolvedTheme {
  const resolved = resolveColorTheme(preference, now)
  Cookies.set(COLOR_THEME_COOKIE, preference, COOKIE_OPTIONS)
  Cookies.set(RESOLVED_THEME_COOKIE, resolved, COOKIE_OPTIONS)
  applyResolvedTheme(resolved)
  return resolved
}

/** Переключение в шапке: явно light ↔ dark (без auto). */
export function toggleExplicitColorTheme(now: Date = new Date()): ColorThemePreference {
  const currentResolved =
    typeof document !== 'undefined' && document.body.classList.contains('dark_mode')
      ? 'dark'
      : 'light'
  const nextPreference: ColorThemePreference = currentResolved === 'dark' ? 'light' : 'dark'
  persistThemePreference(nextPreference, now)
  return nextPreference
}

/** @deprecated используйте persistThemePreference */
export function setTheme(theme: Theme): void {
  persistThemePreference(theme)
}
