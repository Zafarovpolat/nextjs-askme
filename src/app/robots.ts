import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/page-seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/profile/'],
        disallow: [
          '/modals',
          '/login',
          '/signup',
          '/notifications',
          '/settings',
          '/auth',
          '/email-verified',
          '/profile$',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
