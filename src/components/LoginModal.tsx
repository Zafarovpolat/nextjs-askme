'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // Закрытие по Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

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

  // Клик по оверлею
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Оверлей */}
      <div
        className="modal-overlay"
        onClick={handleOverlayClick}
      />

      {/* Модалка */}
      <div className="modal modal--small modal--active" id="modal__login">
        <button className="modal__close" onClick={onClose}>
          <svg width="16" height="16">
            <use xlinkHref="#close"></use>
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
              <svg className="login_input_svg" width="13" height="14">
                <use xlinkHref="#login-user"></use>
              </svg>
              <input
                type="text"
                name="login"
                placeholder="Ваш логин"
                required
              />
            </div>
            <div className="login_input login_input_icon">
              <svg className="login_input_svg" width="11" height="14">
                <use xlinkHref="#login-lock"></use>
              </svg>
              <input
                type="password"
                name="password"
                placeholder="Ваш пароль"
                required
              />
            </div>
            <div className="login_content_actions">
              <button className="m_btn category_btn" type="submit">
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
