import type { Metadata } from 'next'
import { withPageUrl } from '@/lib/page-seo'
import { Suspense } from 'react'
import EmailConfirmClient from './EmailConfirmClient'
import '@/styles/email-verified.css'

export const metadata: Metadata = withPageUrl('/settings/email-confirm', {
  title: 'Подтверждение смены E-mail — otvetai',
  robots: { index: false, follow: false },
})

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={null}>
      <EmailConfirmClient />
    </Suspense>
  )
}
