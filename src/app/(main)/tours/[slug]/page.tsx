import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import {
  Clock,
  Route,
  Users,
  Star,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'
import { mockTours } from '@/lib/mock-data'
import { fetchTourBySlug, } from '@/lib/tours'
import { localizeTour } from '@/lib/tour-i18n'
import Badge from '@/components/ui/Badge'
import BookingWidget from '@/components/tours/BookingWidget'
import TourLegalSection from '@/components/tours/TourLegalSection'
import RouteSection from '@/components/tours/RouteSection'
import AraRouteSection from '@/components/tours/AraRouteSection'
import HaengjuRouteSection from '@/components/tours/HaengjuRouteSection'
import PeaceNuriRouteSection from '@/components/tours/PeaceNuriRouteSection'
import ChuncheonRouteSection from '@/components/tours/ChuncheonRouteSection'
import NationalRouteSection from '@/components/tours/NationalRouteSection'
import OlympicRouteSection from '@/components/tours/OlympicRouteSection'
import YangsuRouteSection from '@/components/tours/YangsuRouteSection'
import SeoulForestRouteSection from '@/components/tours/SeoulForestRouteSection'
import CheonggyecheonRouteSection from '@/components/tours/CheonggyecheonRouteSection'
import BoramaeParkRouteSection from '@/components/tours/BoramaeParkRouteSection'
import DrinkingWarning from '@/components/ui/DrinkingWarning'
import TourAdminEditor from '@/components/admin/TourAdminEditor'
import ReviewsPreview from '@/components/tours/ReviewsPreview'
import { createClient } from '@/lib/supabase/server'
import {
  formatPrice,
  formatDuration,
  formatDistance,
} from '@/utils/format'
import type { Metadata } from 'next'
import type { Tour as TourType } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return mockTours.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const mock = mockTours.find((t) => t.slug === slug)
  if (mock) return { title: mock.title, description: mock.short_description }

  // DB 전용 투어
  const supabase = await createClient()
  const { data } = await supabase.from('tours').select('title, short_description').eq('slug', slug).maybeSingle()
  if (!data) return {}
  return { title: data.title, description: data.short_description }
}

const difficultyVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  moderate: 'warning',
  hard: 'danger',
}

function buildTour(dbTour: Record<string, unknown>, base?: TourType): TourType {
  return {
    id:               dbTour.id as string,
    slug:             dbTour.slug as string,
    title:            dbTour.title as string,
    title_en:         (dbTour.title_en as string | null) ?? base?.title_en,
    description:      dbTour.description as string,
    short_description: dbTour.short_description as string,
    category:         (dbTour.category as TourType['category']) ?? base?.category ?? 'city',
    difficulty:       (dbTour.difficulty as TourType['difficulty']) ?? base?.difficulty ?? 'easy',
    duration_hours:   Number(dbTour.duration_hours),
    distance_km:      Number(dbTour.distance_km),
    max_participants: dbTour.max_participants as number,
    price_krw:        dbTour.price_krw as number,
    price_usd:        (dbTour.price_usd as number | null) ?? base?.price_usd,
    thumbnail_url:    (dbTour.thumbnail_url as string | null) ?? base?.thumbnail_url ?? '',
    images:           base?.images ?? [],
    meeting_point:    dbTour.meeting_point as string,
    highlights:       (dbTour.highlights as string[] | null) ?? base?.highlights ?? [],
    includes:         (dbTour.includes as string[] | null) ?? base?.includes ?? [],
    excludes:         (dbTour.excludes as string[] | null) ?? base?.excludes ?? [],
    requirements:     (dbTour.requirements as string[] | null) ?? base?.requirements ?? [],
    options:          (dbTour.options as TourType['options']) ?? base?.options,
    rating:           base?.rating ?? 0,
    review_count:     base?.review_count ?? 0,
    is_active:        dbTour.is_active as boolean,
    created_at:       dbTour.created_at as string,
    updated_at:       dbTour.updated_at as string,
  }
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params
  const mockTour = mockTours.find((t) => t.slug === slug)

  const supabase = await createClient()
  const dbTour = await fetchTourBySlug(slug)

  // mock에도 DB에도 없으면 404
  if (!dbTour && !mockTour) notFound()

  // 비활성 투어 404
  if (dbTour?.is_active === false) notFound()

  const rawTour: TourType = dbTour
    ? buildTour(dbTour as Record<string, unknown>, mockTour)
    : mockTour!

  const locale = await getLocale()
  const tour = localizeTour(rawTour, locale)
  const t = await getTranslations('tourDetail')

  // DB tour의 실제 UUID (리뷰 조회에 사용)
  const tourDbId = dbTour?.id ?? mockTour!.id

  // 실제 리뷰 통계 조회
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('rating')
    .eq('tour_id', tourDbId)
  const reviewTotal = reviewStats?.length ?? 0
  const reviewAvg = reviewTotal > 0
    ? reviewStats!.reduce((s, r) => s + r.rating, 0) / reviewTotal
    : 0

  return (
    <div className="bg-white">
      {/* Hero Image */}
      <div className="relative h-[50vh] sm:h-[60vh] max-h-[640px] bg-zinc-200">
        {tour.thumbnail_url && <>
          <Image
            src={tour.thumbnail_url}
            alt={tour.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </>}
        <div className="absolute bottom-4 left-4">
          <Link
            href="/tours"
            className="flex items-center gap-1 rounded-lg bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('back_to_list')}
          </Link>
        </div>
        {/* 관리자 전용 인라인 편집 도구 */}
        <TourAdminEditor
          slug={tour.slug}
          currentThumbnail={tour.thumbnail_url}
          currentTitle={tour.title}
          currentDescription={tour.description}
          currentHighlights={tour.highlights}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="info">{t(`category_${tour.category}`)}</Badge>
              <Badge variant={difficultyVariant[tour.difficulty]}>
                {t(`difficulty_${tour.difficulty}`)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{tour.title}</h1>
            {tour.title_en && (
              <p className="mt-1 text-sm text-zinc-400">{tour.title_en}</p>
            )}

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              {reviewTotal > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(reviewAvg) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-zinc-900 ml-1">{reviewAvg.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-zinc-500">{t('review_count', { count: reviewTotal })}</span>
                </>
              ) : (
                <span className="text-sm text-zinc-400">{t('no_reviews')}</span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock, label: t('duration'), value: formatDuration(tour.duration_hours) },
                { icon: Route, label: t('distance'), value: formatDistance(tour.distance_km) },
                { icon: Users, label: t('min_participants'), value: t('people', { n: tour.max_participants }) },
                { icon: MapPin, label: t('meeting_point'), value: tour.meeting_point },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-zinc-200 p-3">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 line-clamp-2">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-3">{t('intro')}</h2>
              <p className="text-zinc-600 leading-relaxed">{tour.description}</p>
            </section>

            {/* Route Map */}
            {tour.slug === 'hangang-healing-tour' && <RouteSection />}
            {tour.slug === 'ara-waterway-tour' && <AraRouteSection />}
            {tour.slug === 'haengju-fortress-tour' && <HaengjuRouteSection />}
            {tour.slug === 'peace-nuri-1' && <PeaceNuriRouteSection />}
            {tour.slug === 'chuncheon-lakeside-tour' && <ChuncheonRouteSection />}
            {tour.slug === 'national-cycling-route' && <NationalRouteSection />}
            {tour.slug === 'olympic-park-tour' && <OlympicRouteSection />}
            {tour.slug === 'yangsu-tour' && <YangsuRouteSection />}
            {tour.slug === 'seoul-forest-tour' && <SeoulForestRouteSection />}
            {tour.slug === 'cheonggyecheon-tour' && <CheonggyecheonRouteSection />}
            {tour.slug === 'boramae-park-tour' && <BoramaeParkRouteSection />}

            {/* Highlights */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-3">{t('highlights')}</h2>
              <ul className="space-y-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-zinc-600">
                    <span className="mt-0.5 text-emerald-500">✦</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Tour Options */}
            {tour.options && tour.options.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-bold text-zinc-900 mb-3">{t('course_options')}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {tour.options.map((option) => (
                    <div
                      key={option.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <p className="font-bold text-zinc-900 mb-1">{option.label}</p>
                      {option.description && (
                        <p className="text-sm text-zinc-500 mb-2">{option.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        {option.duration_hours && <span>{t('approx_hours', { n: option.duration_hours })}</span>}
                        <span className="font-semibold text-emerald-700">
                          {option.flat_fee_krw
                            ? t('transport_fee', { price: `${option.flat_fee_krw.toLocaleString()}원` })
                            : t('no_extra_fee')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Includes / Excludes */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">{t('includes_excludes')}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-2">
                    <CheckCircle className="h-4 w-4" /> {t('included')}
                  </h3>
                  <ul className="space-y-1.5">
                    {tour.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-zinc-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 mb-2">
                    <XCircle className="h-4 w-4" /> {t('excluded')}
                  </h3>
                  <ul className="space-y-1.5">
                    {tour.excludes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-zinc-600">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-3">{t('requirements')}</h2>
              <ul className="space-y-2 mb-5">
                {tour.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-zinc-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    {req}
                  </li>
                ))}
              </ul>
              <DrinkingWarning />
            </section>

            {/* Reviews */}
            <ReviewsPreview tourId={tourDbId} slug={slug} />

            {/* Legal & Notices */}
            <TourLegalSection />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="sticky top-24">
              <BookingWidget tour={tour} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
