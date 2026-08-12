import type { Metadata } from 'next'
import { Suspense } from 'react'
import EmailConfirmClient from './EmailConfirmClient'
import '@/styles/email-verified.css'

export const metadata: Metadata = {
  title: 'Подтверждение смены E-mail — Otvetai',
  robots: { index: false, follow: false },
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={null}>
      <EmailConfirmClient />
    </Suspense>
  )
}
