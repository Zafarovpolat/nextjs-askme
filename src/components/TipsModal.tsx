'use client'

import { useEffect, useCallback } from 'react'

interface TipsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TipsModal({ isOpen, onClose }: TipsModalProps) {
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
      <div className="modal modal--medium modal--active" id="modal__tips">
        <button className="modal__close" onClick={onClose}>
          <svg width="16" height="16">
            <use xlinkHref="#close"></use>
          </svg>
        </button>
        <div className="modal__content">
          <div className="modal__image">
            <img src="/images/tips.png" alt="" />
          </div>
          <p className="modal__title">Советы</p>
          <p className="modal__info">
            Фразы &quot;Есть вопрос&quot;, &quot;Нужна помощь&quot;, &quot;Смотри внутри&quot; и&nbsp;т.&nbsp;д. лишь занимают полезное место.
          </p>
          <p className="modal__info">
            Старайтесь формулировать вопросы максимально четко и понятно. Чем понятнее будет ваш вопрос, &nbsp;тем более конкретные ответы вы получите.
          </p>
        </div>
      </div>
    </>
  )
}
