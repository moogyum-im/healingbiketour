'use client'

import { HardHat, Smartphone, Video, Wrench, Film, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

const SERVICE_ICONS = [HardHat, Smartphone, Video, Film, Wrench, ShieldCheck]
const SERVICE_KEYS = ['helmet', 'phone', 'blackbox', 'video', 'pump', 'insurance'] as const

export default function ReviewSection() {
  const t = useTranslations('services')

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Included</p>
          <h2 className="mt-1 text-3xl font-black text-zinc-900 sm:text-4xl">{t('title')}</h2>
          <p className="mt-2 text-zinc-500 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICE_KEYS.map((key, i) => {
            const Icon = SERVICE_ICONS[i]
            return (
              <div
                key={key}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{t(`${key}_title`)}</p>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{t(`${key}_desc`)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
