import { Suspense } from 'react'
import TourCard from '@/components/tours/TourCard'
import TourFilters from '@/components/tours/TourFilters'
import { getToursWithOverrides } from '@/lib/tours'
import { localizeTour } from '@/lib/tour-i18n'
import type { TourCategory, TourDifficulty } from '@/types'
import { getCategoryLabel } from '@/utils/format'
import AdminAddTourButton from '@/components/tours/AdminAddTourButton'
import { getLocale, getTranslations } from 'next-intl/server'

interface ToursPageProps {
  searchParams: Promise<{
    category?: TourCategory
    difficulty?: TourDifficulty
    search?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export const metadata = {
  title: '전체 투어',
  description: '서울 및 전국의 다양한 자전거 투어를 만나보세요.',
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams
  const { category, difficulty, search, minPrice, maxPrice } = params
  const locale = await getLocale()
  const t = await getTranslations('toursPage')

  // 필터 적용
  const allTours = (await getToursWithOverrides()).map((tour) => localizeTour(tour, locale))
  let filtered = allTours.filter((t) => t.is_active)

  if (category) filtered = filtered.filter((t) => t.category === category)
  if (difficulty) filtered = filtered.filter((t) => t.difficulty === difficulty)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    )
  }
  if (minPrice) filtered = filtered.filter((t) => t.price_krw >= Number(minPrice))
  if (maxPrice) filtered = filtered.filter((t) => t.price_krw <= Number(maxPrice))

  const pageTitle = category
    ? t('category_tours', { category: getCategoryLabel(category) })
    : t('all_tours')

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Page Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{pageTitle}</h1>
              <p className="mt-1 text-zinc-500">
                <span className="font-semibold text-emerald-600">{t('count', { count: filtered.length })}</span>
              </p>
            </div>
            <AdminAddTourButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <Suspense>
              <TourFilters currentParams={params} />
            </Suspense>
          </aside>

          {/* Tour Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🚴</span>
                <h3 className="text-lg font-semibold text-zinc-700">{t('no_results_title')}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {t('no_results_desc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
