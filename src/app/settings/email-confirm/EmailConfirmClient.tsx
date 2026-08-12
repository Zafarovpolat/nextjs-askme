'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'
import { EMAIL_CONFIRMED_ERROR_KEY } from '@/components/profile/ProfileSecuritySettings'

/** Защита от двойного вызова (React Strict Mode). */
const confirmingTokens = new Set<string>()

function storeError(message: string) {
  try {
    sessionStorage.setItem(EMAIL_CONFIRMED_ERROR_KEY, message)
  } catch {
    /* ignore */
  }
}

/**
 * Подтверждение смены/привязки почты по ссылке из письма.
 * Ссылка валидна только для залогиненного владельца — бэкенд сверяет user_id токена с сессией.
 */
export default function EmailConfirmClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const isLoading = useAuthStore((s) => s.isLoading)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const started = useRef(false)

  useEffect(() => {
    if (isLoading) return

    const token = searchParams.get('token')

    if (!token) {
      router.replace('/profile?tab=settings')
      return
    }

    if (!isAuthorized) {
      storeError('Войдите в аккаунт и снова перейдите по ссылке из письма.')
      router.replace('/login')
      return
    }

    if (started.current || confirmingTokens.has(token)) return
    started.current = true
    confirmingTokens.add(token)

    ;(async () => {
      try {
        await api.post('v1/me/email/confirm', { token })
        await fetchMe()
        router.replace('/profile?tab=settings&email_confirmed=1')
      } catch (err: unknown) {
        const e = err as Error & { errors?: Record<string, string[]> }
        storeError(
          e.errors?.token?.[0] ||
            e.errors?.email?.[0] ||
            e.message ||
            'Ссылка недействительна или истекла.'
        )
        router.replace('/profile?tab=settings')
      } finally {
        confirmingTokens.delete(token)
      }
    })()
  }, [searchParams, router, isAuthorized, isLoading, fetchMe])

  return (
    <div className="container">
      <div className="email_verified_page">
        <p>Подтверждаем смену почты…</p>
      </div>
    </div>
  )
}
