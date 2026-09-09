import type { Metadata } from 'next'
import { withPageUrl } from '@/lib/page-seo'
import { Suspense } from 'react'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import EmailVerifiedClient from './EmailVerifiedClient'
import '@/styles/email-verified.css'

export const metadata: Metadata = withPageUrl('/email-verified', {
  title: 'E-mail подтверждён — otvetai',
  robots: { index: false, follow: false },
})

export default function EmailVerifiedPage() {
  return (
    <div className="page-layout-sticky-footer">
      <div className="container" style={{ flex: 1 }}>
        <Breadcrumbs
          items={[
            { name: 'Главная', href: '/' },
            { name: 'Подтверждение E-mail', href: '/email-verified' },
          ]}
        />
        <Suspense fallback={null}>
          <EmailVerifiedClient />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
