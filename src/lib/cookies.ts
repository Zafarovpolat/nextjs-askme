import Cookies from 'js-cookie'
import { AUTH_TOKEN_COOKIE_KEY } from '@/lib/auth-constants'

const TOKEN_KEY = AUTH_TOKEN_COOKIE_KEY

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
