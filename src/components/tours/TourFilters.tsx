'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { TourCategory, TourDifficulty } from '@/types'
import { getCategoryLabel, getDifficultyLabel } from '@/utils/format'
import { cn } from '@/utils/cn'

interface TourFiltersProps {
  currentParams: {
    category?: TourCategory
    difficulty?: TourDifficulty
    search?: string
    minPrice?: string
    maxPrice?: string
  }
}

const categories: TourCategory[] = ['city', 'coastal', 'mountain', 'cultural', 'night', 'family', 'national']
const difficulties: TourDifficulty[] = ['easy', 'moderate', 'hard']

const categoryEmoji: Record<TourCategory, string> = {
  city: '🏙️',
  coastal: '🌊',
  mountain: '⛰️',
  cultural: '🏯',
  night: '🌙',
  family: '👨‍👩‍👧',
  national: '🏅',
}

export default function TourFilters({ currentParams }: TourFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams()
      // Preserve existing params
      Object.entries(currentParams).forEach(([k, v]) => {
        if (v && k !== key) params.set(k, v)
      })
      if (value) params.set(key, value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [currentParams, pathname, router]
  )

  const clearAll = () => router.push(pathname)

  const hasFilters =
    !!currentParams.category ||
    !!currentParams.difficulty ||
    !!currentParams.search ||
    !!currentParams.minPrice ||
    !!currentParams.maxPrice

  return (
    <div className="space-y-6">
      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full rounded-xl border border-zinc-300 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          필터 초기화
        </button>
      )}

      {/* Category */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">카테고리</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                updateFilter('category', currentParams.category === cat ? null : cat)
              }
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                currentParams.category === cat
                  ? 'bg-emerald-50 font-semibold text-emerald-700'
                  : 'text-zinc-600 hover:bg-zinc-50'
              )}
            >
              <span>{categoryEmoji[cat]}</span>
              <span>{getCategoryLabel(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">난이도</h3>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() =>
                updateFilter('difficulty', currentParams.difficulty === diff ? null : diff)
              }
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                currentParams.difficulty === diff
                  ? diff === 'easy'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : diff === 'moderate'
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-red-600 bg-red-600 text-white'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
              )}
            >
              {getDifficultyLabel(diff)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">가격대</h3>
        <div className="space-y-2">
          {[
            { label: '3만원 이하', max: '30000' },
            { label: '3~5만원', min: '30000', max: '50000' },
            { label: '5~8만원', min: '50000', max: '80000' },
            { label: '8만원 이상', min: '80000' },
          ].map(({ label, min, max }) => {
            const active =
              currentParams.minPrice === (min ?? '') && currentParams.maxPrice === (max ?? '')
            return (
              <button
                key={label}
                onClick={() => {
                  if (active) {
                    const p = new URLSearchParams()
                    if (currentParams.category) p.set('category', currentParams.category)
                    if (currentParams.difficulty) p.set('difficulty', currentParams.difficulty)
                    router.push(`${pathname}?${p.toString()}`)
                  } else {
                    const p = new URLSearchParams()
                    if (currentParams.category) p.set('category', currentParams.category)
                    if (currentParams.difficulty) p.set('difficulty', currentParams.difficulty)
                    if (min) p.set('minPrice', min)
                    if (max) p.set('maxPrice', max)
                    router.push(`${pathname}?${p.toString()}`)
                  }
                }}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : 'text-zinc-600 hover:bg-zinc-50'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
