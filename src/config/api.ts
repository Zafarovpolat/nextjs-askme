const base = process.env.NEXT_PUBLIC_API_URL ?? ''

export function getApiUrl(): string {
  return base
}

/** Корень Laravel без суффикса `/api` (для OAuth на web-маршрутах `/auth/...`). */
export function getBackendBaseUrl(): string {
  const url = base.replace(/\/$/, '')
  return url.replace(/\/api\/?$/, '')
}

/** Абсолютный URL к Laravel web (не JSON API), путь без ведущего слэша: `auth/social/vkontakte` */
export function getOAuthFullUrl(path: string): string {
  const root = getBackendBaseUrl().replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return p ? `${root}/${p}` : root
}

/** Путь без ведущего слэша: например "v1/auth/login" */
export function getApiFullUrl(path: string): string {
  const url = base.replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return p ? `${url}/${p}` : url
}
