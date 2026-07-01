import Link from 'next/link'
import TourCard from '@/components/tours/TourCard'
import { getTranslations } from 'next-intl/server'
import type { Tour } from '@/types'

interface FeaturedToursProps {
  tours: Tour[]
}

export default async function FeaturedTours({ tours }: FeaturedToursProps) {
  const t = await getTranslations('home')

  return (
    <section className="py-16 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Guided Tours</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('featured_title')}</h2>
            <p className="mt-2 text-zinc-500">{t('featured_subtitle')}</p>
          </div>
          <Link
            href="/tours"
            className="hidden sm:block text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {t('featured_view_all')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            {t('featured_view_all')}
          </Link>
        </div>
      </div>
    </section>
  )
}
