import { getApiFullUrl } from '@/config/api'
import { getToken } from '@/lib/cookies'

type RequestInitWithBody = RequestInit & { body?: object }

async function request<T>(path: string, init: RequestInitWithBody = {}): Promise<T> {
  const { body, headers: initHeaders, ...rest } = init
  const url = getApiFullUrl(path)
  const token = typeof window !== 'undefined' ? getToken() : undefined
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(initHeaders as Record<string, string>),
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, {
    ...rest,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error((data as { message?: string })?.message || res.statusText) as Error & { status?: number; errors?: Record<string, string[]> }
    err.status = res.status
    err.errors = (data as { errors?: Record<string, string[]> })?.errors
    throw err
  }
  return data as T
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: object, init?: RequestInit) => request<T>(path, { ...init, method: 'POST', body }),
  put: <T>(path: string, body?: object, init?: RequestInit) => request<T>(path, { ...init, method: 'PUT', body }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
}
