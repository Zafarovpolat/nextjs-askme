'use client'

import { useEffect } from 'react'

interface VipPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
}

export default function VipPurchaseModal({ isOpen, onClose, planName }: VipPurchaseModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="vip-purchase-modal-overlay" onClick={onClose}>
      <div className="vip-purchase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vip-purchase-modal-icon">
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.7 70H20.3C14 70 10.5 70 7.7 68.6C4.9 67.2 2.8 65.1 1.75 62.65C0 59.5 0 56 0 49.7V27.3C0 21 3.12924e-07 17.5 1.4 14.7C2.8 11.9 4.9 9.8 7.35 8.75C10.5 7 14 7 20.3 7H28C30.1 7 31.5 8.4 31.5 10.5C31.5 12.6 30.1 14 28 14H20.3C15.05 14 12.25 14 10.85 14.7C9.45 15.4 8.4 16.45 7.7 17.85C7 19.25 7 22.05 7 27.3V49.7C7 54.95 7 57.75 7.7 59.15C8.4 60.55 9.45 61.6 10.85 62.3C12.25 63 15.05 63 20.3 63H42.7C47.95 63 50.75 63 52.15 62.3C53.55 61.6 54.6 60.55 55.3 59.15C56 57.75 56 54.95 56 49.7V42C56 39.9 57.4 38.5 59.5 38.5C61.6 38.5 63 39.9 63 42V49.7C63 56 63 59.5 61.6 62.3C60.2 65.1 58.1 67.2 55.65 68.25C52.5 70 49 70 42.7 70ZM38.5 35C37.45 35 36.75 34.65 36.05 33.95C34.65 32.55 34.65 30.45 36.05 29.05L58.1 7H45.5C43.4 7 42 5.6 42 3.5C42 1.4 43.4 0 45.5 0H66.5C66.85 0 67.55 -3.39001e-07 67.9 0.35C68.25 0.35 68.6 0.7 68.95 1.05C69.3 1.4 69.65 1.75 69.65 2.1C70 2.45 70 3.15 70 3.5V24.5C70 26.6 68.6 28 66.5 28C64.4 28 63 26.6 63 24.5V11.9L40.95 33.95C40.25 34.65 39.55 35 38.5 35Z" fill="#5E68FF"/>
          </svg>
        </div>

        <h3 className="vip-purchase-modal-title">Переход по ссылке</h3>

        <p className="vip-purchase-modal-text">
          Вы собираетесь перейти по ссылке, которая ведет вне на Ответы.АИ, а на какой-то другой сайт. Убедитесь, что ссылка безопасна. Вот ссылка: <span className="vip-purchase-modal-link"><a href="orionopedia.fandom.com">orionopedia.fandom.com</a></span> Да, я понимаю уровень доверия к этой ссылке
        </p>

        <button className="vip-purchase-modal-button" onClick={onClose}>
          Да, я понимаю уровень доверия к этой ссылке
        </button>
      </div>
    </div>
  )
}
