import type { Tour } from '@/types'
import { tourTranslations } from './tour-translations'

export function localizeTour(tour: Tour, locale: string): Tour {
  if (locale === 'ko' || !locale) return tour

  // Check inline translations on the tour object first (DB-stored), then fall back to static file
  const inlineT = tour.translations?.[locale]
  const staticT = tourTranslations[tour.slug]?.[locale]
  const t = { ...staticT, ...inlineT } // inline overrides static

  if (!t || Object.keys(t).length === 0) return tour

  return {
    ...tour,
    title:             t.title             ?? tour.title,
    short_description: t.short_description ?? tour.short_description,
    description:       t.description       ?? tour.description,
    highlights:        t.highlights        ?? tour.highlights,
    includes:          t.includes          ?? tour.includes,
    excludes:          t.excludes          ?? tour.excludes,
    requirements:      t.requirements      ?? tour.requirements,
    meeting_point:     t.meeting_point     ?? tour.meeting_point,
  }
}
