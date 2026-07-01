import { api } from '@/lib/api-client'
import {
  mergeUserSettingsColorTheme,
  type ColorThemePreference,
} from '@/lib/color-theme'
import { useAuthStore } from '@/store/authStore'

export async function saveAuthorizedUserColorTheme(
  colorTheme: ColorThemePreference,
): Promise<void> {
  const { user, patchUser } = useAuthStore.getState()
  if (!user) return

  const settings = mergeUserSettingsColorTheme(user.settings, colorTheme)
  await api.put('v1/me/settings', { settings })
  patchUser({ settings })
}
