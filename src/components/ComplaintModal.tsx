'use client'

import { useEffect, useCallback } from 'react'

interface ComplaintModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComplaintModal({ isOpen, onClose }: ComplaintModalProps) {
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
      <div className="modal modal--small modal--active" id="modal__complaint">
        <button className="modal__close" onClick={onClose}>
          <svg width="16" height="16">
            <use xlinkHref="#close"></use>
          </svg>
        </button>
        <div className="modal__content">
          <div className="login_block">
            <svg width="457" height="353.5" className="login_block_bg">
              <use xlinkHref="#login-bg"></use>
            </svg>

            <svg className="login_block_rect" width="124.601562" height="42">
              <use xlinkHref="#main-rect"></use>
            </svg>

            <div className="login_block_title">
              <h2>Пожаловаться</h2>
            </div>

            <form
              className="login_block_content"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="login_input">
                <select className="super-select" defaultValue="">
                  <option value="" disabled>Выберите причину</option>
                  <option value="spam">Спам</option>
                  <option value="offensive">Оскорбление</option>
                  <option value="inappropriate">Неприемлемый контент</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div className="login_input">
                <textarea
                  className="complaint-textarea"
                  placeholder="Опишите проблему"
                  rows={5}
                ></textarea>
              </div>
              <div className="login_content_actions">
                <button className="m_btn category_btn" type="submit">
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
