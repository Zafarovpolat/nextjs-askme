import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { fetchMeOnServerCached } from '@/lib/server-me'
import { fetchProfileWidgetsCached } from '@/lib/server-profile-widgets'
import NotificationsPageClient from './NotificationsPageClient'
import { withPageUrl } from '@/lib/page-seo'

export const metadata: Metadata = withPageUrl('/notifications', {
  title: 'Уведомления',
  robots: { index: false, follow: false },
})

export default async function NotificationsPage() {
  const [initialMe, initialWidgets] = await Promise.all([
    fetchMeOnServerCached(),
    fetchProfileWidgetsCached(),
  ])
  if (!initialMe?.user) {
    redirect('/login')
  }
  return <NotificationsPageClient initialMe={initialMe} initialWidgets={initialWidgets} />
}
