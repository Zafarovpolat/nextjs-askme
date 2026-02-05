import './globals.css'
import type { Metadata } from 'next'
import SvgSprites from '@/components/SvgSprites'

export const metadata: Metadata = {
  title: 'AskMe - Q&A Platform',
  description: 'Вопросы и ответы на все темы',
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
