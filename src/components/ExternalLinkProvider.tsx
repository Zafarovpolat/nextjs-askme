'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { isExternalHref } from '@/lib/external-link'

type Ctx = {
  openExternalLink: (url: string) => void
  /** Клик по <a href>: внешний URL — модалка, иначе — обычный переход */
  onNavigateClick: (e: React.MouseEvent, href: string) => void
}

const ExternalLinkContext = createContext<Ctx | null>(null)

export function useExternalLink(): Ctx {
  const ctx = useContext(ExternalLinkContext)
  if (!ctx) {
    throw new Error('useExternalLink: провайдер не подключён (layout).')
  }
  return ctx
}

export function ExternalLinkProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<string | null>(null)

  const openExternalLink = useCallback((url: string) => {
    setTarget(url)
  }, [])

  const close = useCallback(() => setTarget(null), [])

  const confirm = useCallback(() => {
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer')
    }
    setTarget(null)
  }, [target])

  const onNavigateClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (!isExternalHref(href)) {
        return
      }
      e.preventDefault()
      openExternalLink(href)
    },
    [openExternalLink]
  )

  useEffect(() => {
    if (!target) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [target, close])

  const value: Ctx = { openExternalLink, onNavigateClick }

  return (
    <ExternalLinkContext.Provider value={value}>
      {children}
      {target ? (
        <div
          className="vip-purchase-modal-overlay"
          onClick={close}
          role="presentation"
        >
          <div
            className="vip-purchase-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-labelledby="ext-link-modal-title"
          >
            <button
              type="button"
              className="vip-purchase-modal-close"
              onClick={close}
              aria-label="Закрыть"
            >
              <svg width="16" height="16" aria-hidden>
                <use xlinkHref="/sprites.svg#close" />
              </svg>
            </button>
            <div className="vip-purchase-modal-icon" aria-hidden>
              <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.7 70H20.3C14 70 10.5 70 7.7 68.6C4.9 67.2 2.8 65.1 1.75 62.65C0 59.5 0 56 0 49.7V27.3C0 21 0 17.5 1.4 14.7C2.8 11.9 4.9 9.8 7.35 8.75C10.5 7 14 7 20.3 7H28C30.1 7 31.5 8.4 31.5 10.5C31.5 12.6 30.1 14 28 14H20.3C15.05 14 12.25 14 10.85 14.7C9.45 15.4 8.4 16.45 7.7 17.85C7 19.25 7 22.05 7 27.3V49.7C7 54.95 7 57.75 7.7 59.15C8.4 60.55 9.45 61.6 10.85 62.3C12.25 63 15.05 63 20.3 63H42.7C47.95 63 50.75 63 52.15 62.3C53.55 61.6 54.6 60.55 55.3 59.15C56 57.75 56 54.95 56 49.7V42C56 39.9 57.4 38.5 59.5 38.5C61.6 38.5 63 39.9 63 42V49.7C63 56 63 59.5 61.6 62.3C60.2 65.1 58.1 67.2 55.65 68.25C52.5 70 49 70 42.7 70ZM38.5 35C37.45 35 36.75 34.65 36.05 33.95C34.65 32.55 34.65 30.45 36.05 29.05L58.1 7H45.5C43.4 7 42 5.6 42 3.5C42 1.4 43.4 0 45.5 0H66.5C66.85 0 67.55 0 67.9 0.35C68.6 0.7 70 2.45 70 3.5V24.5C70 26.6 68.6 28 66.5 28C64.4 28 63 26.6 63 24.5V11.9L40.95 33.95C40.25 34.65 39.55 35 38.5 35Z"
                  fill="#5E68FF"
                />
              </svg>
            </div>
            <h3 id="ext-link-modal-title" className="vip-purchase-modal-title">
              Переход по ссылке
            </h3>
            <p className="vip-purchase-modal-text">
              Вы собираетесь перейти по ссылке, которая ведёт за пределы сервиса otvetai. Убедитесь, что ссылка безопасна.
            </p>
            <p className="vip-purchase-modal-link" style={{ wordBreak: 'break-all', maxWidth: '100%' }}>
              {target}
            </p>
            <button
              type="button"
              className="vip-purchase-modal-button vip-purchase-modal-button--multiline"
              onClick={confirm}
            >
              Да, я понимаю уровень доверия к этой ссылке.
            </button>
          </div>
        </div>
      ) : null}
    </ExternalLinkContext.Provider>
  )
}
