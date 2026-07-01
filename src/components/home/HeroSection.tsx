import Link from 'next/link'
import { Award } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function HeroSection() {
  const t = await getTranslations('hero')

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

          {/* CTA 버튼 */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tours"
              className="rounded-xl bg-emerald-600 px-8 py-4 text-center text-base font-bold text-white transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('tour_btn')}
            </Link>
            <Link
              href="/rental"
              className="rounded-xl border-2 border-white/40 px-8 py-4 text-center text-base font-bold text-white backdrop-blur-sm transition-all hover:border-white/70 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('rental_btn')}
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
