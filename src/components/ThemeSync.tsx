'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  DEFAULT_COLOR_THEME,
  readColorThemeFromUserSettings,
  type ColorThemePreference,
} from '@/lib/color-theme'
import {
  getColorThemePreference,
  persistThemePreference,
} from '@/lib/theme-cookie'

const AUTO_CHECK_MS = 60_000

export default function ThemeSync() {
  const user = useAuthStore((s) => s.user)
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const isLoading = useAuthStore((s) => s.isLoading)
  const profileSyncedRef = useRef(false)

  useEffect(() => {
    if (isLoading) return

    if (isAuthorized && user) {
      if (!profileSyncedRef.current) {
        profileSyncedRef.current = true
        const fromProfile = readColorThemeFromUserSettings(user.settings)
        persistThemePreference(fromProfile)
      }
      return
    }

    profileSyncedRef.current = false
    const preference = getColorThemePreference() ?? DEFAULT_COLOR_THEME
    persistThemePreference(preference)
  }, [isLoading, isAuthorized, user])

  useEffect(() => {
    if (isLoading) return

    const preference: ColorThemePreference = isAuthorized && user
      ? readColorThemeFromUserSettings(user.settings)
      : getColorThemePreference() ?? DEFAULT_COLOR_THEME

    if (preference !== 'auto') return

    const tick = () => {
      const activePreference: ColorThemePreference = isAuthorized && user
        ? readColorThemeFromUserSettings(user.settings)
        : getColorThemePreference() ?? DEFAULT_COLOR_THEME

      if (activePreference !== 'auto') return
      persistThemePreference('auto')
    }

    const id = window.setInterval(tick, AUTO_CHECK_MS)
    return () => window.clearInterval(id)
  }, [isLoading, isAuthorized, user?.settings, user?.id])

  return null
}
