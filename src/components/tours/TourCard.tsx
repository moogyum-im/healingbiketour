import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Route, Users, Lock } from 'lucide-react'
import type { Tour } from '@/types'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDuration, formatDistance, getCategoryLabel, getDifficultyLabel } from '@/utils/format'
import { cn } from '@/utils/cn'

interface TourCardProps {
  tour: Tour
  className?: string
}

const difficultyVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  moderate: 'warning',
  hard: 'danger',
}

export default function TourCard({ tour, className }: TourCardProps) {
  if (!tour.is_active) {
    return (
      <div
        className={cn(
          'group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm opacity-70',
          className
        )}
      >
        <div className="relative h-52 overflow-hidden bg-zinc-100">
          <Image
            src={tour.thumbnail_url}
            alt={tour.title}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-white">
              <Lock className="h-7 w-7" />
              <span className="text-base font-black tracking-widest uppercase">Coming Soon</span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-bold text-zinc-500 line-clamp-2">{tour.title}</h3>
          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{tour.short_description}</p>
          <div className="mt-auto pt-4 border-t border-zinc-100">
            <span className="inline-block rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500">
              오픈 예정
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden bg-zinc-100">
        <Image
          src={tour.thumbnail_url}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant="info" size="sm">{getCategoryLabel(tour.category)}</Badge>
        </div>
        {tour.review_count > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{tour.rating.toFixed(1)}</span>
            <span className="text-white/70">({tour.review_count})</span>
          </div>
        )}
        {tour.review_count === 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-emerald-600/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
            NEW
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant={difficultyVariant[tour.difficulty]} size="sm">
            {getDifficultyLabel(tour.difficulty)}
          </Badge>
        </div>
        <h3 className="mt-1 text-base font-bold text-zinc-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {tour.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{tour.short_description}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(tour.duration_hours)}
          </span>
          <span className="flex items-center gap-1">
            <Route className="h-3.5 w-3.5" />
            {formatDistance(tour.distance_km)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            최대 {tour.max_participants}명
          </span>
        </div>

        <div className="mt-4 border-t border-zinc-100 pt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-400">1인 기준</p>
            <p className="text-lg font-bold text-zinc-900">{formatPrice(tour.price_krw)}</p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            예약하기 →
          </span>
        </div>
      </div>
    </Link>
  )
}
