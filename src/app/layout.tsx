import './globals.css'
import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import SvgSprites from '@/components/SvgSprites'
import AuthProvider from '@/components/AuthProvider'
import ThemeSync from '@/components/ThemeSync'
import { ExternalLinkProvider } from '@/components/ExternalLinkProvider'
import NotificationRealtimeProvider from '@/components/NotificationRealtimeProvider'
import SiteHeader from '@/components/layout/SiteHeader'
import SystemToastStack from '@/components/SystemToastStack'
import CookieConsentBanner from '@/components/cookie-consent/CookieConsentBanner'
import YandexMetrica from '@/components/cookie-consent/YandexMetrica'
import {
  COLOR_THEME_COOKIE,
  DEFAULT_COLOR_THEME,
  RESOLVED_THEME_COOKIE,
  isColorThemePreference,
  resolveColorTheme,
} from '@/lib/color-theme'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://otvetai.ru'
const SITE_NAME = 'Ответы АЙ'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e7e9f6' },
    { media: '(prefers-color-scheme: dark)', color: '#23265b' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — вопросы и ответы`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Задавай вопросы и получай ответы от других пользователей. Сотни тысяч вопросов по школьным предметам, математике, физике, химии и другим темам.',
  keywords: ['вопросы и ответы', 'помощь с уроками', 'домашнее задание', 'школа', 'математика', 'физика', 'химия'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — вопросы и ответы`,
    description: 'Задавай вопросы и получай ответы от других пользователей. Сотни тысяч вопросов по школьным предметам.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — платформа вопросов и ответов`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — вопросы и ответы`,
    description: 'Задавай вопросы и получай ответы от других пользователей.',
    images: ['/images/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/images/favicon/cropped-android-chrome-512x512-1-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon/cropped-android-chrome-512x512-1-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/images/favicon/cropped-android-chrome-512x512-1-180x180.png', sizes: '180x180' },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Платформа вопросов и ответов — задавай вопросы и получай ответы от других пользователей.',
  inLanguage: 'ru',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const preferenceCookie = cookies().get(COLOR_THEME_COOKIE)?.value
  const resolvedCookie = cookies().get(RESOLVED_THEME_COOKIE)?.value

  const preference = isColorThemePreference(preferenceCookie)
    ? preferenceCookie
    : DEFAULT_COLOR_THEME

  const resolved =
    resolvedCookie === 'dark' || resolvedCookie === 'light'
      ? resolvedCookie
      : resolveColorTheme(preference)

  const bodyClass = resolved === 'dark' ? 'loaded dark_mode' : 'loaded'

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Preload критического шрифта для ускорения FCP */}
        <link
          rel="preload"
          href="/fonts/nunito/nunito-cyrillic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/nunito/nunito-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/fonts/nunito/stylesheet.css" />
        {/* JSON-LD структурированные данные для поисковых систем */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={bodyClass} suppressHydrationWarning>
        <AuthProvider>
          <ThemeSync />
          <NotificationRealtimeProvider />
          <ExternalLinkProvider>
            <SiteHeader />
            {children}
          </ExternalLinkProvider>
        </AuthProvider>
        <SystemToastStack />
        <CookieConsentBanner />
        <YandexMetrica />
        <SvgSprites />
      </body>
    </html>
  )
}
