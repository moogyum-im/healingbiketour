import Link from 'next/link'
import TourCard from '@/components/tours/TourCard'
import type { Tour } from '@/types'

interface FeaturedToursProps {
  tours: Tour[]
}

export default function FeaturedTours({ tours }: FeaturedToursProps) {
  return (
    <section className="py-16 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Guided Tours</p>
            <h2 className="text-3xl font-black text-zinc-900">투어 예약하기</h2>
            <p className="mt-2 text-zinc-500">전문 가이드와 함께하는 한강 자전거 투어</p>
          </div>
          <Link
            href="/tours"
            className="hidden sm:block text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            전체 투어 보기 →
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
            전체 투어 보기
          </Link>
        </div>
      </div>
    </section>
  )
}
