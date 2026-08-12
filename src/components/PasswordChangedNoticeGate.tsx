'use client'

import { useSearchParams } from 'next/navigation'
import PasswordChangedNotice from '@/components/PasswordChangedNotice'

/** Показывает блок после успешной активации (?password_changed=1). */
export default function PasswordChangedNoticeGate() {
  const searchParams = useSearchParams()
  if (searchParams.get('password_changed') !== '1') return null
  return <PasswordChangedNotice />
}
