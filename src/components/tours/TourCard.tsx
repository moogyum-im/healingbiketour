import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Route, Lock } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import type { Tour } from '@/types'
import { formatPrice, formatDistance } from '@/utils/format'
import { cn } from '@/utils/cn'

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

interface TourCardProps {
  tour: Tour
  className?: string
}

const difficultyColor: Record<string, string> = {
  easy:     'bg-emerald-500/90',
  moderate: 'bg-amber-500/90',
  hard:     'bg-red-500/90',
}

const TOUR_NAV_MAP: Record<string, string> = {
  'hangang-healing-tour': 'hangang',
  'ara-waterway-tour': 'ara',
  'haengju-fortress-tour': 'haengju',
  'chuncheon-lakeside-tour': 'chuncheon',
  'olympic-park-tour': 'olympic',
  'peace-nuri-1': 'peacenuri',
  'national-cycling-route': 'national',
  'imjingak-tour': 'imjingak',
}

export default async function TourCard({ tour, className }: TourCardProps) {
  const t = await getTranslations('tourDetail')
  const tNav = await getTranslations('nav')
  const locale = await getLocale()
  const isKo = locale === 'ko'

  const navKey = TOUR_NAV_MAP[tour.slug]
  const displayTitle = navKey ? tNav(navKey) : tour.title
  const displayDesc = navKey ? tNav(`${navKey}_desc`) : tour.short_description

  if (!tour.is_active) {
    return (
      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-2xl shadow-md h-72',
          className
        )}
      >
        <Image
          src={tour.thumbnail_url}
          alt={displayTitle}
          fill
          className="object-cover grayscale"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-white">
            <Lock className="h-8 w-8" />
            <span className="text-sm font-black tracking-widest uppercase">Coming Soon</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-base font-bold text-white/60">{displayTitle}</h3>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl shadow-md h-72 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      {/* 배경 이미지 */}
      <Image
        src={tour.thumbnail_url}
        alt={displayTitle}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

      {/* 상단 배지 */}
      <div className="relative flex items-center justify-between p-4">
        <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {t(`category_${tour.category}`)}
        </span>
        {tour.review_count > 0 ? (
          <span className="flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{tour.rating.toFixed(1)}</span>
            <span className="text-white/70">({tour.review_count})</span>
          </span>
        ) : (
          <span className="rounded-lg bg-emerald-500/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
            NEW
          </span>
        )}
      </div>

      {/* 하단 텍스트 */}
      <div className="relative mt-auto p-4">
        <div className="mb-2">
          <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold text-white', difficultyColor[tour.difficulty] ?? 'bg-zinc-500/80')}>
            {t(`difficulty_${tour.difficulty}`)}
          </span>
        </div>

        <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
          {displayTitle}
        </h3>
        <p className="mt-0.5 text-xs text-white/70 line-clamp-1">{displayDesc}</p>

        <div className="mt-2.5 flex items-end justify-between">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDurationLocale(tour.duration_hours, isKo)}
            </span>
            <span className="flex items-center gap-1">
              <Route className="h-3 w-3" />
              {formatDistance(tour.distance_km)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50">{t('per_person')}</p>
            <p className="text-base font-black text-white">{formatPrice(tour.price_krw)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
