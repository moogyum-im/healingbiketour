import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/my/', '/auth/', '/api/'],
    },
    sitemap: 'https://healingbiketour.kr/sitemap.xml',
  }
}
