import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Footer from '@/components/layout/Footer'
import EmailVerifiedClient from './EmailVerifiedClient'
import '@/styles/email-verified.css'

export const metadata: Metadata = {
  title: 'E-mail подтверждён — Otvetai',
  robots: { index: false, follow: false },
}

export default function EmailVerifiedPage() {
  return (
    <div className="page-layout-sticky-footer">
      <div className="container" style={{ flex: 1 }}>
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Подтверждение E-mail</span>
        </div>
        <Suspense fallback={null}>
          <EmailVerifiedClient />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
