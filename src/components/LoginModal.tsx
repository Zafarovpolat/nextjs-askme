'use client'

import { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import SocialAuthButtons from '@/components/SocialAuthButtons'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'
import { HydrationSafeInput } from '@/components/HydrationSafeInput'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !forgotPasswordOpen) onClose()
  }, [onClose, forgotPasswordOpen])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    if (!isOpen) {
      setForgotPasswordOpen(false)
      setShowPassword(false)
    }
  }, [isOpen])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !forgotPasswordOpen) onClose()
  }, [onClose, forgotPasswordOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="modal-overlay"
        onClick={handleOverlayClick}
      />

      <div className="modal modal--small modal--active" id="modal__login">
        <button className="modal__close" onClick={onClose}>
          <svg width="16" height="16">
            <use xlinkHref="/sprites.svg#close"></use>
          </svg>
        </button>
        <div className="modal__content">
          <div className="login-form__title">
            Упс вам нужно войти в аккаунт
          </div>

          <form
            className="login_block_content login_form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="14" height="12" aria-hidden>
                <use xlinkHref="/sprites.svg#login-mail" />
              </svg>
              <HydrationSafeInput
                type="email"
                name="email"
                placeholder="Ваша почта"
                required
              />
            </div>
            <div className="login_input login_input_icon login_input_password">
              <svg className="login_input_svg login_input_svg--accent" width="12" height="15" aria-hidden>
                <use xlinkHref="/sprites.svg#login-lock" />
              </svg>
              <HydrationSafeInput
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Ваш пароль"
                required
              />
              <button
                type="button"
                className="login_password_toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                <svg width="20" height="14" aria-hidden>
                  <use xlinkHref={showPassword ? '/sprites.svg#login-eye' : '/sprites.svg#login-eye-off'} />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="login_forgot_link"
              onClick={() => setForgotPasswordOpen(true)}
            >
              Забыли пароль?
            </button>
            <div className="login_content_actions">
              <div className="login_content_actions_btns">
                <button className="m_btn category_btn" type="submit">
                  Войти в аккаунт
                </button>
                <Link href="/signup" className="m_btn category_btn" onClick={onClose}>
                  Регистрация
                </Link>
              </div>
              <div className="login_socials">
                <p>Войти через<br />социальные сети</p>
                <SocialAuthButtons />
              </div>
            </div>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </>
  )
}
