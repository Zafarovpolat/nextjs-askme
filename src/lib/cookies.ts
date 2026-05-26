import Cookies from 'js-cookie'
import { AUTH_TOKEN_COOKIE_KEY } from '@/lib/auth-constants'

const TOKEN_KEY = AUTH_TOKEN_COOKIE_KEY
export const NOTIFICATION_POPUPS_COOKIE_KEY = 'notification_popups_enabled'

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location?.protocol === 'https:',
  expires: 30, // дней
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS)
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY, { path: '/' })
}

export function getNotificationPopupsEnabled(): boolean {
  return Cookies.get(NOTIFICATION_POPUPS_COOKIE_KEY) === '1'
}

export function setNotificationPopupsEnabled(enabled: boolean): void {
  Cookies.set(NOTIFICATION_POPUPS_COOKIE_KEY, enabled ? '1' : '0', COOKIE_OPTIONS)
}
