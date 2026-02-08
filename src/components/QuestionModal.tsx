'use client'

import { useEffect, useCallback } from 'react'

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuestionModal({ isOpen, onClose }: QuestionModalProps) {
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
      <div className="modal modal--medium modal--active" id="modal__question">
        <button className="modal__close" onClick={onClose}>
          <svg width="16" height="16">
            <use xlinkHref="#close"></use>
          </svg>
        </button>
        <div className="modal__content">
          <div className="modal__image">
            <img src="/images/question.png" alt="" />
          </div>
          <p className="modal__description">
            Для публикации вопроса мы предложим вам зарегистрироваться на Ответах. Так вы не пропустите ни одного ответа на вопрос.
          </p>
        </div>
      </div>
    </>
  )
}
