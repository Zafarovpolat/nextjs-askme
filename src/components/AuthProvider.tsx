'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const pathname = usePathname()

  useEffect(() => {
    // /auth/callback сам вызывает loginWithToken — не гоняем параллельный /me до установки токена.
    if (pathname === '/auth/callback') return
    fetchMe()
  }, [fetchMe, pathname])

  return <>{children}</>
}
