export type ColorThemePreference = 'light' | 'dark' | 'auto'
export type ResolvedTheme = 'light' | 'dark'

export const COLOR_THEME_COOKIE = 'otvetai_color_theme'
export const RESOLVED_THEME_COOKIE = 'otvetai_theme'
export const DEFAULT_COLOR_THEME: ColorThemePreference = 'auto'

export function isColorThemePreference(value: unknown): value is ColorThemePreference {
  return value === 'light' || value === 'dark' || value === 'auto'
}

/** Тёмная тема с 21:00 до 06:00 по локальному времени. */
export function resolveColorTheme(
  preference: ColorThemePreference,
  now: Date = new Date(),
): ResolvedTheme {
  if (preference === 'dark') return 'dark'
  if (preference === 'light') return 'light'

  const hour = now.getHours()
  return hour >= 21 || hour < 6 ? 'dark' : 'light'
}

export function readColorThemeFromUserSettings(settings: unknown): ColorThemePreference {
  const site = (settings as { site?: { color_theme?: unknown } } | null | undefined)?.site
  const value = site?.color_theme
  return isColorThemePreference(value) ? value : DEFAULT_COLOR_THEME
}

export function mergeUserSettingsColorTheme(
  settings: unknown,
  colorTheme: ColorThemePreference,
): Record<string, unknown> {
  const current =
    settings && typeof settings === 'object' ? (settings as Record<string, unknown>) : {}
  const site =
    current.site && typeof current.site === 'object'
      ? (current.site as Record<string, unknown>)
      : {}

  return {
    ...current,
    site: {
      ...site,
      color_theme: colorTheme,
    },
  }
}
