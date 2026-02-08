import './globals.css'
import type { Metadata } from 'next'
import SvgSprites from '@/components/SvgSprites'

export const metadata: Metadata = {
  title: 'AskMe - Q&A Platform',
  description: 'Вопросы и ответы на все темы',
  icons: {
    icon: [
      { url: '/images/favicon/cropped-android-chrome-512x512-1-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon/cropped-android-chrome-512x512-1-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: {
      url: '/images/favicon/cropped-android-chrome-512x512-1-180x180.png',
      sizes: '180x180',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="stylesheet" href="/fonts/nunito/stylesheet.css" />
      </head>
      <body className="loaded">
        {children}
        <SvgSprites />
      </body>
    </html>
  )
}
