import Link from 'next/link'
import Image from 'next/image'
import { Award, Clock, Route, Star } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import type { Tour } from '@/types'
import { formatPrice } from '@/utils/format'

function formatDurationLocale(hours: number, isKo: boolean) {
  if (isKo) {
    if (hours < 1) return `${Math.round(hours * 60)}분`
    if (hours === Math.floor(hours)) return `${hours}시간`
    return `${Math.floor(hours)}시간 ${Math.round((hours % 1) * 60)}분`
  }
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours === Math.floor(hours)) return `${hours} hrs`
  return `${Math.floor(hours)} hrs ${Math.round((hours % 1) * 60)} min`
}

const TOUR_TITLE_MAP: Record<string, string> = {
  'hangang-healing-tour': 'hangang',
  'ara-waterway-tour': 'ara',
  'haengju-fortress-tour': 'haengju',
  'chuncheon-lakeside-tour': 'chuncheon',
  'olympic-park-tour': 'olympic',
  'peace-nuri-1': 'peacenuri',
  'national-cycling-route': 'national',
  'imjingak-tour': 'imjingak',
}

export default async function HeroSection({ tours }: { tours: Tour[] }) {
  const t = await getTranslations('hero')
  const tNav = await getTranslations('nav')
  const locale = await getLocale()
  const isKo = locale === 'ko'

  return (
    <section className="relative min-h-[700px] flex items-center bg-zinc-950 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/메인-사진.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-lg">

          {/* 배지 */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 backdrop-blur-sm">
            <Award className="h-3.5 w-3.5" />
            <span>{t('badge')}</span>
          </div>

          {/* 헤드라인 */}
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            {t('title1')}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {t('title2')}
            </span>
          </h1>

          {/* 투어 상품 목록 */}
          <div className="mt-8 flex flex-col gap-2.5">
            {tours.slice(0, 4).map((tour) => {
              const navKey = TOUR_TITLE_MAP[tour.slug]
              const displayTitle = navKey ? tNav(navKey) : tour.title
              return (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-zinc-900 p-3 shadow-lg transition-all hover:border-emerald-500/60 hover:bg-zinc-800"
                >
                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={tour.thumbnail_url}
                      alt={displayTitle}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-emerald-300 transition-colors">
                      {displayTitle}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDurationLocale(tour.duration_hours, isKo)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        {tour.distance_km}km
                      </span>
                      {tour.review_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {tour.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-emerald-400">{formatPrice(tour.price_krw)}</p>
                    <p className="mt-0.5 text-[10px] text-white/40">{isKo ? '1인' : 'per person'}</p>
                  </div>
                </Link>
              )
            })}

            <Link
              href="/tours"
              className="mt-1 rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-500"
            >
              {tNav('all_tours')}
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
