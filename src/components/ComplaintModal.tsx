'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'

interface ComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  /** ID вопроса — жалоба на вопрос */
  questionId?: number
  /** ID ответа — жалоба на ответ (взаимоисключающе с questionId) */
  answerId?: number
}

const TOPIC_OPTIONS = [
  { value: 'spam', label: 'Спам' },
  { value: 'offensive', label: 'Оскорбление' },
  { value: 'inappropriate', label: 'Неприемлемый контент' },
  { value: 'other', label: 'Другое' },
] as const

export default function ComplaintModal({
  isOpen,
  onClose,
  questionId,
  answerId,
}: ComplaintModalProps) {
  const router = useRouter()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const [topicKey, setTopicKey] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setTopicKey('')
      setMessage('')
      setError(null)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isAuthorized) {
        router.push('/login')
        return
      }
      if (!topicKey || !message.trim()) {
        setError('Выберите причину и опишите проблему')
        return
      }
      const hasQuestion = questionId != null
      const hasAnswer = answerId != null
      if (!hasQuestion && !hasAnswer) {
        setError('Не указан объект жалобы')
        return
      }
      if (hasQuestion && hasAnswer) {
        setError('Жалоба должна быть либо на вопрос, либо на ответ')
        return
      }

      setPending(true)
      setError(null)
      try {
        await api.post('v1/complaints', {
          topic_key: topicKey,
          message: message.trim(),
          ...(hasQuestion ? { question_id: questionId } : {}),
          ...(hasAnswer ? { answer_id: answerId } : {}),
        })
        onClose()
      } catch (err: unknown) {
        const e = err as Error & { message?: string; errors?: Record<string, string[]> }
        const msg = e?.message ?? e?.errors?.message?.[0] ?? 'Не удалось отправить жалобу'
        setError(String(msg))
      } finally {
        setPending(false)
      }
    },
    [isAuthorized, router, topicKey, message, questionId, answerId, onClose]
  )

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick} />
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
              onSubmit={handleSubmit}
            >
              <div className="login_input">
                <select
                  className="super-select"
                  value={topicKey}
                  onChange={(e) => setTopicKey(e.target.value)}
                  disabled={pending}
                  required
                >
                  <option value="" disabled>
                    Выберите причину
                  </option>
                  {TOPIC_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="login_input">
                <textarea
                  className="complaint-textarea"
                  placeholder="Опишите проблему"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={pending}
                  required
                />
              </div>
              {error && (
                <p className="complaint-error" style={{ color: 'var(--color-error, #c00)', fontSize: 14, marginBottom: 8 }}>
                  {error}
                </p>
              )}
              <div className="login_content_actions">
                <button
                  className="m_btn category_btn"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? 'Отправка…' : 'Отправить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
