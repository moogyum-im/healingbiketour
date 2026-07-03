import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { mockTours } from '@/lib/mock-data'

const BASE_URL = 'https://healingbiketour.kr'

const STATIC_PAGES = [
  { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/tours', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/bikes', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/rental', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/notice', priority: 0.5, changeFrequency: 'weekly' as const },
  { url: '/policy/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/policy/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/policy/refund', priority: 0.3, changeFrequency: 'yearly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  // 투어 상세 페이지 (DB + mock 합산)
  let tourSlugs: string[] = mockTours.map((t) => t.slug as string)

  try {
    const supabase = await createClient()
    const { data: dbTours } = await supabase.from('tours').select('slug')
    if (dbTours) {
      const dbSlugs = dbTours.map((t) => t.slug as string).filter(Boolean)
      const unique = new Set([...tourSlugs, ...dbSlugs])
      tourSlugs = Array.from(unique)
    }
  } catch {
    // DB 연결 실패해도 mock 슬러그로 fallback
  }

  const tourEntries: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${BASE_URL}/tours/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...tourEntries]
}
