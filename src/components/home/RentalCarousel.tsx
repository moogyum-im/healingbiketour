'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { RENTAL_PRICES } from '@/lib/rental-prices'

const IMG: Record<string, string> = {
  meridan:        '/bikes/meridan.png',
  callas:         '/bikes/callas.png',
  principia:      '/bikes/principia.png',
  zaskar:         '/bikes/zaskar.png',
  aspen:          '/bikes/aspen.png',
  tcr6500:        '/bikes/tcr6500.png',
  yukon:          '/bikes/infiza.png',
  cayin:          '/bikes/cayin.png',
  bianchi1885:    '/bikes/1885.png',
  'aspen-limited':'/bikes/aspen-limited.png',
}

export default function RentalCarousel() {
  const t = useTranslations('home')
  const [active, setActive] = useState(0)
  const total = RENTAL_PRICES.length

  const prev = () => setActive(i => (i - 1 + total) % total)
  const next = () => setActive(i => (i + 1) % total)

  function getPos(idx: number) {
    let p = (idx - active + total) % total
    if (p > total / 2) p -= total
    return p
  }

  const bike = RENTAL_PRICES[active]

  const OFFSETS = [0, 195, 345]

  const priceTiers = [
    { labelKey: 'rental_h24' as const, price: bike.h24 },
    { labelKey: 'rental_h48' as const, price: bike.h48 },
    { labelKey: 'rental_h72' as const, price: bike.h72, highlight: true },
  ]

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Bike Rental</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('rental_title')}</h2>
            <p className="mt-2 text-zinc-500">{t('rental_subtitle')}</p>
          </div>
          <Link href="/rental" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-zinc-900 transition-colors">
            {t('rental_view_all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3D 캐러셀 */}
        <div
          className="relative mx-auto h-72"
          style={{ perspective: '1100px', maxWidth: '900px' }}
        >
          {RENTAL_PRICES.map((b, i) => {
            const pos = getPos(i)
            const abs = Math.abs(pos)
            if (abs > 2) return null

            const xOffset = Math.sign(pos) * OFFSETS[abs]
            const scale   = abs === 0 ? 1 : abs === 1 ? 0.72 : 0.52
            const rotateY = pos * 28
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.75 : 0.4
            const zIndex  = 10 - abs * 3

            return (
              <div
                key={b.bikeId}
                onClick={() => abs !== 0 && setActive(i)}
                className="absolute left-1/2 top-0"
                style={{
                  transform: `translateX(calc(-50% + ${xOffset}px)) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex,
                  cursor: abs !== 0 ? 'pointer' : 'default',
                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transformOrigin: 'center center',
                }}
              >
                <div className={`w-72 h-64 rounded-3xl border-2 transition-colors overflow-hidden select-none ${
                  abs === 0
                    ? 'bg-zinc-50 border-emerald-500 shadow-2xl shadow-emerald-100'
                    : 'bg-zinc-100 border-zinc-200 shadow-lg'
                }`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={IMG[b.bikeId] ?? '/bikes/meridan.png'}
                      alt={`${b.brand} ${b.model}`}
                      fill
                      className="object-contain p-8"
                      sizes="288px"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 자전거 정보 */}
        <div className="mt-6 text-center">
          <p className="text-2xl font-black text-zinc-900">{bike.brand} {bike.model}</p>
          <p className="text-sm text-zinc-400 mt-1">{bike.material} · {bike.size}</p>

          <div className="inline-flex mt-5 divide-x divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
            {priceTiers.map(({ labelKey, price, highlight }) => (
              <div key={labelKey} className={`px-7 py-3 text-center ${highlight ? 'bg-emerald-50' : 'bg-white'}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wide ${highlight ? 'text-emerald-500' : 'text-zinc-400'}`}>{t(labelKey)}</p>
                <p className={`text-base font-black mt-0.5 ${highlight ? 'text-emerald-600' : 'text-zinc-800'}`}>
                  {price.toLocaleString()}<span className="text-xs font-normal opacity-60">{t('per_24h')}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="flex items-center gap-5">
            <button
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-1.5">
              {RENTAL_PRICES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-emerald-500' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <Link
            href={`/rental?bike=${bike.bikeId}`}
            className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white hover:bg-zinc-700 transition-colors"
          >
            {t('rental_cta')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
