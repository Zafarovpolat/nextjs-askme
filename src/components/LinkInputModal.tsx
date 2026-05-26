'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

interface LinkInputModalProps {
  isOpen: boolean
  initialValue?: string | null
  onClose: () => void
  onSubmit: (url: string) => void
}

function isValidHttpUrl(u: string): boolean {
  const s = u.trim()
  // http/https + домен/поддомен + зона (минимум 2 символа). Допускаем путь/query.
  return /^(https?:\/\/)([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(s)
}

export default function LinkInputModal({
  isOpen,
  initialValue,
  onClose,
  onSubmit,
}: LinkInputModalProps) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValue((initialValue ?? '').trim())
      setTouched(false)
    }
  }, [isOpen, initialValue])

  const error = useMemo(() => {
    if (!touched) return null
    if (!value.trim()) return 'Введите ссылку'
    if (!isValidHttpUrl(value)) return 'Некорректная ссылка. Пример: https://example.com'
    return null
  }, [touched, value])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

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

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const onOk = useCallback(() => {
    setTouched(true)
    const v = value.trim()
    if (!v) return
    if (!isValidHttpUrl(v)) return
    onSubmit(v)
    onClose()
  }, [value, onSubmit, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick} />
      <div className="modal modal--small modal--active" id="modal__link_input">
        <button className="modal__close" onClick={onClose}>
          <svg width="16" height="16">
            <use xlinkHref="#close"></use>
          </svg>
        </button>
        <div className="modal__content">
          <p className="modal__title">Добавить ссылку</p>
          <div className="login_input">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (!touched) setTouched(true)
              }}
              placeholder="https://example.com"
              autoFocus
            />
          </div>
          {error ? <div className="form_link_modal_error">{error}</div> : null}
          <div className="login_content_actions" style={{ justifyContent: 'flex-start', gap: 10, flexDirection: 'row' }}>
            <button type="button" className="m_btn category_btn" onClick={onOk}>
              Добавить
            </button>
            <button type="button" className="m_btn category_btn" style={{ background: '#EAEBF6', color: '#1F2A3B' }} onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

