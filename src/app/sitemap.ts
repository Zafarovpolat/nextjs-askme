import type { MetadataRoute } from 'next'
import { mockCategories } from '@/data/mock-categories'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://otvetai.ru'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Статичные страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/leaders`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/ask`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Страницы категорий
  const categoryPages: MetadataRoute.Sitemap = mockCategories.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}
