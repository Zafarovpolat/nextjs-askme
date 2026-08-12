'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { HydrationSafeInput } from '@/components/HydrationSafeInput'
import { useNavChromeStore } from '@/store/navChromeStore'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const FADE_MS = 250

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  const lockChrome = useNavChromeStore((s) => s.lockChrome)
  const unlockChrome = useNavChromeStore((s) => s.unlockChrome)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setSent(false)
      setError(null)
      setLoading(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const value = email.trim()
    if (!value) {
      setError('Введите email.')
      return
    }

    setLoading(true)
    try {
      await api.post('v1/auth/password/forgot', { email: value })
      setSent(true)
    } catch (err: unknown) {
      const ex = err as Error & { errors?: Record<string, string[]> }
      setError(ex.errors?.email?.[0] ?? ex.message ?? 'Не удалось отправить письмо')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <div
        className={`modal-overlay modal-overlay--forgot${visible ? ' is-visible' : ''}`}
        onClick={handleOverlayClick}
      />
      <div
        className={`modal modal--small modal--forgot${visible ? ' is-visible' : ''}`}
        id="modal__forgot-password"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
          <svg width="16" height="16">
            <use xlinkHref="#close" />
          </svg>
        </button>

        <form className="forgot-password-modal" onSubmit={handleSubmit}>
          <h2 id="forgot-password-title" className="forgot-password-modal__title">
            Восстановить пароль
          </h2>

          <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="14" height="12">
                <use xlinkHref="#login-mail" />
              </svg>
            <HydrationSafeInput
              type="email"
              name="email"
              placeholder="Введите E-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <p className="forgot-password-modal__hint">
            {sent
              ? 'Если такой email существует, на него будет отправлено письмо с новым паролем и ссылкой для его активации'
              : 'Ссылка будет отправлена на почту'}
          </p>

          {error && <p className="forgot-password-modal__error">{error}</p>}

          <div className="forgot-password-modal__actions">
            <button className="m_btn category_btn" type="submit" disabled={loading}>
              {loading ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
