import Cookies from 'js-cookie'

const TOKEN_KEY = 'otvetai_token'

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
