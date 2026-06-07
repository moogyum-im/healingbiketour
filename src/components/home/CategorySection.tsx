'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

const CATEGORIES: { key: string; emoji: string; available: boolean; href?: string }[] = [
  { key: 'hangang', emoji: '🚴', available: true, href: '/tours' },
  { key: 'cultural', emoji: '🏯', available: true, href: '/tours' },
  { key: 'coastal', emoji: '🌊', available: false },
  { key: 'mountain', emoji: '⛰️', available: false },
  { key: 'night', emoji: '🌙', available: false },
  { key: 'family', emoji: '👨‍👩‍👧', available: false },
]

export default function CategorySection() {
  const t = useTranslations('category')

  return (
    <section className="py-20 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Routes</p>
            <h2 className="mt-1 text-3xl font-black text-zinc-900 sm:text-4xl">{t('title')}</h2>
          </div>
          <p className="text-zinc-500">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ key, emoji, available, href }) =>
            available ? (
              <Link
                key={key}
                href={href!}
                className="group relative flex flex-col items-center gap-3 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-zinc-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-emerald-400"
              >
                <span className="text-4xl transition-transform duration-200 group-hover:scale-110">{emoji}</span>
                <div>
                  <p className="font-bold text-sm text-zinc-900">{t(key as Parameters<typeof t>[0])}</p>
                  <p className="text-[11px] mt-0.5 text-zinc-500">{t(`${key}_desc` as Parameters<typeof t>[0])}</p>
                </div>
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </Link>
            ) : (
              <div
                key={key}
                className="relative flex flex-col items-center gap-3 rounded-2xl bg-zinc-100 p-5 text-center opacity-60"
              >
                <span className="text-4xl grayscale">{emoji}</span>
                <div>
                  <p className="font-bold text-sm text-zinc-600">{t(key as Parameters<typeof t>[0])}</p>
                  <p className="text-[11px] mt-0.5 text-zinc-400">{t(`${key}_desc` as Parameters<typeof t>[0])}</p>
                </div>
                <span className="absolute top-2 right-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-300">
                  {t('coming_soon')}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
