'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  getCookieConsent,
  setCookieConsent,
} from '@/lib/cookie-consent'
import { useNavChromeStore } from '@/store/navChromeStore'
import { legalFooterHref, LEGAL_FOOTER_SLUGS } from '@/lib/legal-footer-slugs'

const FADE_MS = 250

export default function CookieConsentBanner() {
  const [ready, setReady] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [settingsMounted, setSettingsMounted] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(true)

  const lockChrome = useNavChromeStore((s) => s.lockChrome)
  const unlockChrome = useNavChromeStore((s) => s.unlockChrome)

  useEffect(() => {
    const existing = getCookieConsent()
    setBannerOpen(existing === null)
    setReady(true)
  }, [])

  const persistAndClose = useCallback((analytics: boolean) => {
    setCookieConsent(analytics)
    setSettingsOpen(false)
    setBannerOpen(false)
  }, [])

  const openSettings = useCallback(() => {
    setAnalyticsOn(true)
    setSettingsOpen(true)
  }, [])

  useEffect(() => {
    if (settingsOpen) {
      setSettingsMounted(true)
      lockChrome()
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSettingsVisible(true))
      })
      document.body.style.overflow = 'hidden'
      return () => {
        cancelAnimationFrame(raf)
        document.body.style.overflow = ''
      }
    }

    setSettingsVisible(false)
    unlockChrome()
    const timer = window.setTimeout(() => setSettingsMounted(false), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [settingsOpen, lockChrome, unlockChrome])

  useEffect(() => {
    return () => {
      unlockChrome()
      document.body.style.overflow = ''
    }
  }, [unlockChrome])

  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [settingsOpen])

  if (!ready || (!bannerOpen && !settingsMounted)) return null

  return (
    <>
      {bannerOpen && (
        <div className="cookie-banner" role="dialog" aria-label="Согласие на cookie">
          <div className="cookie-banner__inner">
            <p className="cookie-banner__text">
              Мы используем cookie и аналогичные технологии для обеспечения работы сайта, анализа
              посещаемости и улучшения сервиса. Подробнее — в{' '}
              <Link href={legalFooterHref(LEGAL_FOOTER_SLUGS.cookies)}>
                Согласии на обработку файлов cookie
              </Link>
              .
            </p>
            <div className="cookie-banner__actions">
              <button
                type="button"
                className="m_btn category_btn cookie-banner__accept"
                onClick={() => persistAndClose(true)}
              >
                Принять все
              </button>
              <button
                type="button"
                className="cookie-banner__decline"
                onClick={() => persistAndClose(false)}
              >
                Отклонить
              </button>
              <button type="button" className="cookie-banner__link-btn" onClick={openSettings}>
                Настроить
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsMounted &&
        createPortal(
          <>
            <div
              className={`modal-overlay modal-overlay--cookie${settingsVisible ? ' is-visible' : ''}`}
              onClick={() => setSettingsOpen(false)}
            />
            <div
              className={`modal modal--small modal--cookie${settingsVisible ? ' is-visible' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-settings-title"
            >
              <button
                type="button"
                className="modal__close"
                onClick={() => setSettingsOpen(false)}
                aria-label="Закрыть"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M10.64 8.00051L15.5898 3.0507C16.1367 2.50379 16.1367 1.61712 15.5898 1.07108L14.9299 0.411203C14.3829 -0.135871 13.4962 -0.135871 12.9502 0.411203L8.00051 5.36085L3.0507 0.410177C2.50379 -0.136726 1.61712 -0.136726 1.07108 0.410177L0.410177 1.07005C-0.136726 1.61712 -0.136726 2.50379 0.410177 3.04984L5.36085 8.00051L0.411203 12.9502C-0.135871 13.4972 -0.135871 14.3839 0.411203 14.9299L1.07108 15.5898C1.61798 16.1367 2.50465 16.1367 3.0507 15.5898L8.00051 10.64L12.9502 15.5898C13.4972 16.1367 14.3839 16.1367 14.9299 15.5898L15.5898 14.9299C16.1367 14.3829 16.1367 13.4962 15.5898 12.9502L10.64 8.00051Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <h2 id="cookie-settings-title" className="cookie-settings__title">
                Настроить
              </h2>

              <div className="cookie-settings__list">
                <label className="cookie-settings__row cookie-settings__row--locked">
                  <span className="cookie-switch cookie-switch--on cookie-switch--disabled" aria-hidden>
                    <span className="cookie-switch__thumb" />
                  </span>
                  <input
                    type="checkbox"
                    className="visually-hidden"
                    checked
                    disabled
                    readOnly
                    tabIndex={-1}
                  />
                  <span className="cookie-settings__copy">
                    <span className="cookie-settings__name">Технически необходимые</span>
                    <span className="cookie-settings__desc">
                      Обеспечивают вход в аккаунт, безопасность и сохранение настроек оформления.
                      Без них сайт не работает.
                    </span>
                  </span>
                </label>

                <label className="cookie-settings__row">
                  <span
                    className={`cookie-switch${analyticsOn ? ' cookie-switch--on' : ''}`}
                    aria-hidden
                  >
                    <span className="cookie-switch__thumb" />
                  </span>
                  <input
                    type="checkbox"
                    className="visually-hidden"
                    checked={analyticsOn}
                    onChange={(e) => setAnalyticsOn(e.target.checked)}
                  />
                  <span className="cookie-settings__copy">
                    <span className="cookie-settings__name">Аналитические</span>
                    <span className="cookie-settings__desc">
                      Яндекс.Метрика. Помогает анализировать посещаемость и улучшать сервис. Включается
                      только с вашего согласия.
                    </span>
                  </span>
                </label>
              </div>

              <button
                type="button"
                className="m_btn category_btn cookie-settings__save"
                onClick={() => persistAndClose(analyticsOn)}
              >
                Сохранить выбор
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  )
}
