'use client'

import { useState } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'
import { showSystemToast } from '@/store/systemToastStore'
import EmailSentModal from '@/components/EmailSentModal'

export default function EmailVerifyBanner() {
  const isAuthorized = useAuthStore((s) => s.isAuthorized === 1)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentModalOpen, setSentModalOpen] = useState(false)

  const needsVerify =
    isAuthorized &&
    !isLoading &&
    !!user &&
    user.requires_email_verification === true

  const showBanner = needsVerify && !dismissed

  if (!needsVerify && !sentModalOpen) return null

  const handleResend = async () => {
    if (sending) return
    setSending(true)
    try {
      await api.post('v1/auth/email/resend')
      setDismissed(true)
      setSentModalOpen(true)
    } catch (err: unknown) {
      const e = err as Error & { message?: string }
      showSystemToast(e.message || 'Не удалось отправить письмо', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {showBanner && (
        <div className="email-verify-banner" role="status">
          <div className="email-verify-banner__inner">
            <div className="email-verify-banner__content">
              <span className="email-verify-banner__icon-slot" aria-hidden>
                <svg className="email-verify-banner__icon" width="14" height="12">
                  <use xlinkHref="/sprites.svg#login-mail" />
                </svg>
              </span>
              <span className="email-verify-banner__text">
                Подтвердите email чтобы пользоваться сервисом
              </span>{' '}
              <button
                type="button"
                className="email-verify-banner__resend"
                onClick={handleResend}
                disabled={sending}
              >
                {sending ? 'Отправка…' : 'Отправить письмо повторно'}
              </button>
            </div>
            <button
              type="button"
              className="email-verify-banner__close"
              onClick={() => setDismissed(true)}
              aria-label="Скрыть"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M10.64 8.00051L15.5898 3.0507C16.1367 2.50379 16.1367 1.61712 15.5898 1.07108L14.9299 0.411203C14.3829 -0.135871 13.4962 -0.135871 12.9502 0.411203L8.00051 5.36085L3.0507 0.410177C2.50379 -0.136726 1.61712 -0.136726 1.07108 0.410177L0.410177 1.07005C-0.136726 1.61712 -0.136726 2.50379 0.410177 3.04984L5.36085 8.00051L0.411203 12.9502C-0.135871 13.4972 -0.135871 14.3839 0.411203 14.9299L1.07108 15.5898C1.61798 16.1367 2.50465 16.1367 3.0507 15.5898L8.00051 10.64L12.9502 15.5898C13.4972 16.1367 14.3839 16.1367 14.9299 15.5898L15.5898 14.9299C16.1367 14.3829 16.1367 13.4962 15.5898 12.9502L10.64 8.00051Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <EmailSentModal isOpen={sentModalOpen} onClose={() => setSentModalOpen(false)} />
    </>
  )
}
