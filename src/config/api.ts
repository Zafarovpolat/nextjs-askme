const base = process.env.NEXT_PUBLIC_API_URL ?? ''

export function getApiUrl(): string {
  return base
}

/** Путь без ведущего слэша: например "v1/auth/login" */
export function getApiFullUrl(path: string): string {
  const url = base.replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return p ? `${url}/${p}` : url
}
