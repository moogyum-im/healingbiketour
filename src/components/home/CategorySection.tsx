import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const RENTAL_BIKES = [
  { id: 'meridan', label: 'Cello Meridan', tagKey: 'bike_tag_meridan' as const, price: 40000, img: '/bikes/meridan.png' },
  { id: 'aspen',   label: 'Jaeger Aspen',  tagKey: 'bike_tag_aspen'   as const, price: 50000, img: '/bikes/aspen.png' },
  { id: 'cayin',   label: 'Cello Cayin',   tagKey: 'bike_tag_cayin'   as const, price: 40000, img: '/bikes/cayin.png' },
]

const TOURS = [
  { href: '/tours/hangang-healing-tour',    labelKey: 'tour1_label' as const, descKey: 'tour1_desc' as const, price: 50000,  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { href: '/tours/ara-waterway-tour',       labelKey: 'tour2_label' as const, descKey: 'tour2_desc' as const, price: 60000,  img: '/stop-ara-waterfall.png' },
  { href: '/tours/haengju-fortress-tour',   labelKey: 'tour3_label' as const, descKey: 'tour3_desc' as const, price: 55000,  img: '/stop-haengju-fortress.png' },
  { href: '/tours/olympic-park-tour',       labelKey: 'tour4_label' as const, descKey: 'tour4_desc' as const, price: 88000,  img: '/stop-olympic-park.png' },
  { href: '/tours/chuncheon-lakeside-tour', labelKey: 'tour5_label' as const, descKey: 'tour5_desc' as const, price: 150000, img: '/stop-chuncheon-jaraseom.png' },
]

export default async function CategorySection() {
  const t = await getTranslations('home')

  return (
    <section className="py-20 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 자전거 렌탈 */}
          <div className="flex flex-col rounded-3xl bg-white ring-1 ring-zinc-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bike Rental</p>
                <h3 className="text-xl font-black text-zinc-900">{t('section_rental_title')}</h3>
              </div>
              <Link
                href="/rental"
                className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t('section_rental_view')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-zinc-100">
              {RENTAL_BIKES.map((bike) => (
                <Link
                  key={bike.id}
                  href="/rental"
                  className="group flex items-center gap-4 px-7 py-4 hover:bg-zinc-50 transition-colors"
                >
                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={bike.img}
                      alt={bike.label}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-sm truncate">{bike.label}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{t(bike.tagKey)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-zinc-900">{bike.price.toLocaleString()}원</p>
                      <p className="text-[10px] text-zinc-400">{t('per_24h')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-7 py-5 mt-auto border-t border-zinc-100">
              <Link
                href="/rental"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
              >
                {t('section_rental_book')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* 투어 선택 */}
          <div className="flex flex-col rounded-3xl bg-white ring-1 ring-zinc-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Guided Tours</p>
                <h3 className="text-xl font-black text-zinc-900">{t('section_tours_title')}</h3>
              </div>
              <Link
                href="/tours"
                className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t('section_tours_view')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-zinc-100">
              {TOURS.map((tour) => (
                <Link
                  key={tour.href}
                  href={tour.href}
                  className="group flex items-center gap-4 px-7 py-4 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={tour.img}
                      alt={t(tour.labelKey)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-sm truncate">{t(tour.labelKey)}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{t(tour.descKey)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-emerald-600">{tour.price.toLocaleString()}원~</p>
                      <ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 text-zinc-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-7 py-5 mt-auto border-t border-zinc-100">
              <Link
                href="/tours"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                {t('section_tours_book')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
