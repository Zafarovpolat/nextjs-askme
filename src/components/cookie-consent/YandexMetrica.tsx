'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import {
  hasAnalyticsConsent,
  subscribeCookieConsent,
} from '@/lib/cookie-consent'

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void
  }
}

/**
 * Подключает Яндекс.Метрику только при согласии на аналитические cookie.
 * ID счётчика: NEXT_PUBLIC_YM_ID
 */
export default function YandexMetrica() {
  const counterId = process.env.NEXT_PUBLIC_YM_ID?.trim()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(hasAnalyticsConsent())
    return subscribeCookieConsent((consent) => {
      setAllowed(consent.analytics)
    })
  }, [])

  useEffect(() => {
    if (!allowed || !counterId || typeof window === 'undefined') return
    if (typeof window.ym === 'function') {
      window.ym(Number(counterId), 'hit', window.location.href)
    }
  }, [allowed, counterId])

  if (!allowed || !counterId) return null

  const id = Number(counterId)
  if (!Number.isFinite(id) || id <= 0) return null

  return (
    <>
      <Script id="yandex-metrica" strategy="afterInteractive">{`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${id}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
`}</Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  )
}
