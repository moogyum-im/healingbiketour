import { createClient } from '@/lib/supabase/server'
import { mockTours } from '@/lib/mock-data'
import type { Tour } from '@/types'

function dbRowToTour(t: Record<string, unknown>, fallback?: Tour): Tour {
  return {
    id:                String(t.id ?? fallback?.id ?? ''),
    title:             String(t.title ?? fallback?.title ?? ''),
    title_en:          (t.title_en as string | null) ?? fallback?.title_en,
    slug:              String(t.slug ?? fallback?.slug ?? ''),
    description:       String(t.description ?? fallback?.description ?? ''),
    short_description: String(t.short_description ?? fallback?.short_description ?? ''),
    category:          (t.category as Tour['category']) ?? fallback?.category ?? 'city',
    difficulty:        (t.difficulty as Tour['difficulty']) ?? fallback?.difficulty ?? 'easy',
    duration_hours:    Number(t.duration_hours ?? fallback?.duration_hours ?? 0),
    distance_km:       Number(t.distance_km ?? fallback?.distance_km ?? 0),
    max_participants:  Number(t.max_participants ?? fallback?.max_participants ?? 10),
    price_krw:         Number(t.price_krw ?? fallback?.price_krw ?? 0),
    price_usd:         (t.price_usd as number | null) ?? fallback?.price_usd,
    thumbnail_url:     String(t.thumbnail_url ?? fallback?.thumbnail_url ?? ''),
    images:            (t.images as string[] | null) ?? fallback?.images ?? [],
    meeting_point:     String(t.meeting_point ?? fallback?.meeting_point ?? ''),
    meeting_point_lat: (t.meeting_point_lat as number | null) ?? fallback?.meeting_point_lat,
    meeting_point_lng: (t.meeting_point_lng as number | null) ?? fallback?.meeting_point_lng,
    includes:          (t.includes as string[] | null) ?? fallback?.includes ?? [],
    excludes:          (t.excludes as string[] | null) ?? fallback?.excludes ?? [],
    requirements:      (t.requirements as string[] | null) ?? fallback?.requirements ?? [],
    highlights:        (t.highlights as string[] | null) ?? fallback?.highlights ?? [],
    options:           (t.options as Tour['options']) ?? fallback?.options,
    rating:            Number(t.rating ?? fallback?.rating ?? 0),
    review_count:      Number(t.review_count ?? fallback?.review_count ?? 0),
    is_active:         Boolean(t.is_active ?? fallback?.is_active ?? true),
    created_at:        String(t.created_at ?? fallback?.created_at ?? ''),
    updated_at:        String(t.updated_at ?? fallback?.updated_at ?? ''),
  }
}

export async function getToursWithOverrides(): Promise<Tour[]> {
  try {
    const supabase = await createClient()

    const { data: dbTours } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })

    const dbBySlug = Object.fromEntries((dbTours ?? []).map((t) => [t.slug as string, t]))
    const mockSlugs = new Set(mockTours.map((t) => t.slug))

    // mock 투어: DB에 있으면 DB 전체 데이터 사용 (관리자 편집 완전 반영)
    //            DB에 없으면 mock 원본 그대로
    const mergedMock: Tour[] = mockTours.map((tour) => {
      const db = dbBySlug[tour.slug]
      return db ? dbRowToTour(db, tour) : tour
    })

    // DB에만 있는 신규 투어 (mock에 없는 slug)
    const newDbTours: Tour[] = (dbTours ?? [])
      .filter((t) => !mockSlugs.has(t.slug as string))
      .map((t) => dbRowToTour(t))

    return [...mergedMock, ...newDbTours]
  } catch {
    return mockTours
  }
}
