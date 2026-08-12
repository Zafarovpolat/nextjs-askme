'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'

export const LOGIN_ACTIVATE_ERROR_KEY = 'login_password_activate_error'

interface LoginPasswordActivateProps {
  onError: (message: string | null) => void
}

/** Защита от двойного вызова (React Strict Mode). */
const activatingTokens = new Set<string>()

/**
 * Читает ?token= из URL и активирует сброс пароля через API.
 * Успех → /login?password_changed=1
 */
export default function LoginPasswordActivate({ onError }: LoginPasswordActivateProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const started = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token || started.current) return
    if (activatingTokens.has(token)) return

    started.current = true
    activatingTokens.add(token)

    ;(async () => {
      try {
        await api.post('v1/auth/password/activate', { token })
        try {
          sessionStorage.removeItem(LOGIN_ACTIVATE_ERROR_KEY)
        } catch {
          /* ignore */
        }
        onError(null)
        router.replace('/login?password_changed=1')
      } catch (err: unknown) {
        const e = err as Error & { message?: string }
        const message = e.message || 'Ссылка недействительна или устарела.'
        try {
          sessionStorage.setItem(LOGIN_ACTIVATE_ERROR_KEY, message)
        } catch {
          /* ignore */
        }
        onError(message)
        router.replace('/login')
      } finally {
        activatingTokens.delete(token)
      }
    })()
  }, [searchParams, router, onError])

  return null
}
