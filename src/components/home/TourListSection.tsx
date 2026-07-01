import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Tour } from '@/types'
import TourCard from '@/components/tours/TourCard'

export default async function TourListSection({ tours }: { tours: Tour[] }) {
  const t = await getTranslations()
  const tNav = await getTranslations('nav')

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Bike Tours</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('category.title')}</h2>
            <p className="mt-2 text-zinc-500">{t('category.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tours.slice(0, 3).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-200 px-8 py-3.5 text-sm font-bold text-zinc-700 transition-all hover:border-emerald-500 hover:text-emerald-600"
          >
            {tNav('all_tours')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
