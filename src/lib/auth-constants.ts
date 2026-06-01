/** Имя cookie с Bearer-токеном (клиент: js-cookie, сервер: `cookies().get`) */
export const AUTH_TOKEN_COOKIE_KEY = 'otvetai_token'

/** Защита от двойного loginWithToken на /auth/callback (Strict Mode, повторный effect). */
let oauthCallbackTokenInFlight: string | null = null

export function shouldSkipOAuthCallback(token: string): boolean {
  return oauthCallbackTokenInFlight === token
}

export function markOAuthCallbackStarted(token: string): void {
  oauthCallbackTokenInFlight = token
}

export function clearOAuthCallbackGuard(): void {
  oauthCallbackTokenInFlight = null
}
