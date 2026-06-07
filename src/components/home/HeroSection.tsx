'use client'

import Link from 'next/link'
import { Search, Award, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function HeroSection() {
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-[680px] flex items-center overflow-hidden bg-zinc-950">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/메인-사진.jpg')",
        }}
      />
      {/* Bold dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/75 to-zinc-950/20" />
      {/* Subtle green glow */}
      <div className="absolute bottom-0 left-0 h-64 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 backdrop-blur-sm">
            <Award className="h-3.5 w-3.5" />
            <span>{t('badge')}</span>
          </div>

          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t('title1')}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {t('title2')}
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg max-w-xl whitespace-pre-line">
            {t('subtitle')}
          </p>

          {/* Bike type pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['🚲 City Bike', '🏔️ MTB', '⚡ E-Bike'].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-sm"
              >
                {b}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <Zap className="h-3 w-3" />
              Choose your ride
            </span>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                className="w-full rounded-xl border-0 bg-white/10 pl-11 pr-4 py-3.5 text-sm text-white shadow-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-sm"
              />
            </div>
            <Link
              href="/tours"
              className="rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg text-center transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('find_tour')}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {[
              { val: t('stat_bikes_val'), label: t('stat_bikes_label') },
              { val: t('stat_guide_val'), label: t('stat_guide_label') },
              { val: t('stat_video_val'), label: t('stat_video_label') },
              { val: t('stat_insurance_val'), label: t('stat_insurance_label') },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-xl font-black text-emerald-400">{val}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
