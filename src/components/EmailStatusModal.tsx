'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavChromeStore } from '@/store/navChromeStore'

export type EmailStatusModalVariant =
  /** Письмо отправлено на текущую (уже привязанную) почту */
  | 'sent-to-current'
  /** Почта привязана, но ещё не подтверждена — можно переотправить письмо */
  | 'bound-unconfirmed'
  /** Почта привязана и подтверждена */
  | 'bound-confirmed'

interface EmailStatusModalProps {
  isOpen: boolean
  variant: EmailStatusModalVariant
  email?: string | null
  resending?: boolean
  onResend?: () => void
  onClose: () => void
}

const FADE_MS = 250

const TITLES: Record<EmailStatusModalVariant, string> = {
  'sent-to-current': 'Мы отправили письмо\nс подтверждением на вашу\nтекущую почту.',
  'bound-unconfirmed': 'Почта привязана,\nно не подтверждена',
  'bound-confirmed': 'Почта привязана\nи подтверждена',
}

export default function EmailStatusModal({
  isOpen,
  variant,
  email,
  resending = false,
  onResend,
  onClose,
}: EmailStatusModalProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [portalReady, setPortalReady] = useState(false)

  const lockChrome = useNavChromeStore((s) => s.lockChrome)
  const unlockChrome = useNavChromeStore((s) => s.unlockChrome)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      lockChrome()
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        cancelAnimationFrame(raf)
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }

    setVisible(false)
    unlockChrome()
    const timer = window.setTimeout(() => setMounted(false), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [isOpen, handleKeyDown, lockChrome, unlockChrome])

  useEffect(() => {
    return () => {
      unlockChrome()
      document.body.style.overflow = ''
    }
  }, [unlockChrome])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  if (!portalReady || !mounted) return null

  const showEmail = variant !== 'sent-to-current' && !!email
  const showResend = variant === 'bound-unconfirmed' && !!onResend

  return createPortal(
    <>
      <div
        className={`modal-overlay modal-overlay--email-status${visible ? ' is-visible' : ''}`}
        onClick={handleOverlayClick}
      />
      <div
        className={`modal modal--small modal--email-status${visible ? ' is-visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-status-title"
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M10.64 8.00051L15.5898 3.0507C16.1367 2.50379 16.1367 1.61712 15.5898 1.07108L14.9299 0.411203C14.3829 -0.135871 13.4962 -0.135871 12.9502 0.411203L8.00051 5.36085L3.0507 0.410177C2.50379 -0.136726 1.61712 -0.136726 1.07108 0.410177L0.410177 1.07005C-0.136726 1.61712 -0.136726 2.50379 0.410177 3.04984L5.36085 8.00051L0.411203 12.9502C-0.135871 13.4972 -0.135871 14.3839 0.411203 14.9299L1.07108 15.5898C1.61798 16.1367 2.50465 16.1367 3.0507 15.5898L8.00051 10.64L12.9502 15.5898C13.4972 16.1367 14.3839 16.1367 14.9299 15.5898L15.5898 14.9299C16.1367 14.3829 16.1367 13.4962 15.5898 12.9502L10.64 8.00051Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="email-status-modal">
          <h2 id="email-status-title" className="email-status-modal__title">
            {TITLES[variant]}
          </h2>

          {showEmail && (
            <p className="email-status-modal__email">
              <svg width="14" height="12" aria-hidden>
                <use xlinkHref="#login-mail" />
              </svg>
              <span>{email}</span>
            </p>
          )}

          {showResend && (
            <button
              type="button"
              className="m_btn category_btn email-status-modal__resend"
              onClick={onResend}
              disabled={resending}
            >
              {resending ? 'Отправка…' : 'Отправить письмо повторно'}
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
