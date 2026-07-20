import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Zap, Mountain, Bike, Wind, Tag, BatteryCharging, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { RENTAL_PRICES, type BikeRentalPrice } from '@/lib/rental-prices'
import { formatPrice, type Currency } from '@/utils/format'

export const metadata: Metadata = {
  title: '자전거렌탈예약하기',
  description: '힐링바이크투어의 프리미엄 자전거 라인업을 소개합니다.',
}

const LOCALE_CURRENCY: Record<string, Currency> = {
  ko: 'KRW', en: 'USD', ja: 'JPY', 'zh-CN': 'CNY', 'zh-TW': 'TWD',
}
const FX: Record<Currency, number> = {
  KRW: 1, USD: 1 / 1350, JPY: 150 / 1350, CNY: 7.2 / 1350, TWD: 32 / 1350,
}

function fmtKrw(krw: number, currency: Currency): string {
  const rate = FX[currency]
  const amount = currency === 'KRW' || currency === 'JPY'
    ? Math.round(krw * rate)
    : Math.floor(krw * rate * 100) / 100
  return formatPrice(amount, currency)
}

type TFunc = Awaited<ReturnType<typeof getTranslations<'bikes'>>>

function RentalPriceBadge({ rental, t, currency }: { rental: BikeRentalPrice; t: TFunc; currency: Currency }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2">
        <Tag className="h-3.5 w-3.5" />
        {t('rental_label')}
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white border border-zinc-200 py-1.5">
          <p className="text-[10px] text-zinc-400 font-medium">{t('day_1')}</p>
          <p className="text-sm font-black text-zinc-800">{fmtKrw(rental.h24, currency)}</p>
        </div>
        <div className="rounded-lg bg-white border border-zinc-200 py-1.5">
          <p className="text-[10px] text-zinc-400 font-medium">{t('day_2')}</p>
          <p className="text-sm font-black text-zinc-800">{fmtKrw(rental.h48, currency)}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-1.5">
          <p className="text-[10px] text-emerald-600 font-medium">{t('day_3')}</p>
          <p className="text-sm font-black text-emerald-700">{fmtKrw(rental.h72, currency)}</p>
        </div>
      </div>
      {rental.isEbike && rental.extraBattery > 0 && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
          <BatteryCharging className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] font-semibold text-amber-700">
            {t('extra_battery_option', { price: fmtKrw(rental.extraBattery, currency) })}
          </p>
        </div>
      )}
    </div>
  )
}

export default async function BikesPage() {
  const t = await getTranslations('bikes')
  const locale = await getLocale()
  const currency = LOCALE_CURRENCY[locale] ?? 'KRW'

  type BikeData = {
    id: string
    brand: string
    model: string
    tagline: string
    description: string
    photo: string | null
    color: string
    badgeColor: string
    specs: { labelKey: string; value: string }[]
    forText: string
  }

  const ROAD_BIKES: BikeData[] = [
    {
      id: 'tcr6500', brand: 'Giant', model: 'TCR 6500',
      tagline: t('tcr6500_tagline'), description: t('tcr6500_desc'), forText: t('tcr6500_for'),
      photo: '/bikes/tcr6500.png', color: 'from-blue-600/10 to-transparent', badgeColor: 'bg-blue-100 text-blue-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '700c' },
        { labelKey: 'spec_derailleur', value: 'Shimano Tiagra' },
        { labelKey: 'spec_height', value: '165 – 180 cm' },
      ],
    },
    {
      id: 'yukon', brand: 'Infiza', model: 'Yukon',
      tagline: t('yukon_tagline'), description: t('yukon_desc'), forText: t('yukon_for'),
      photo: '/bikes/infiza.png', color: 'from-indigo-500/10 to-transparent', badgeColor: 'bg-indigo-100 text-indigo-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_carbon') },
        { labelKey: 'spec_size', value: '700c' },
        { labelKey: 'spec_derailleur', value: 'Shimano 105' },
        { labelKey: 'spec_height', value: '165 – 180 cm' },
      ],
    },
    {
      id: 'cayin', brand: 'Cello', model: 'Cayin',
      tagline: t('cayin_tagline'), description: t('cayin_desc'), forText: t('cayin_for'),
      photo: '/bikes/cayin.png', color: 'from-cyan-500/10 to-transparent', badgeColor: 'bg-cyan-100 text-cyan-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_carbon') },
        { labelKey: 'spec_size', value: '700c' },
        { labelKey: 'spec_derailleur', value: 'Shimano Tiagra' },
        { labelKey: 'spec_height', value: t('spec_val_consult') },
      ],
    },
    {
      id: 'bianchi1885', brand: 'Bianchi', model: '1885',
      tagline: t('bianchi1885_tagline'), description: t('bianchi1885_desc'), forText: t('bianchi1885_for'),
      photo: '/bikes/1885.png', color: 'from-teal-500/10 to-transparent', badgeColor: 'bg-teal-100 text-teal-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '700c' },
        { labelKey: 'spec_derailleur', value: 'Shimano Tiagra' },
        { labelKey: 'spec_height', value: '170 – 180 cm' },
      ],
    },
  ]

  const MTB_BIKES: BikeData[] = [
    {
      id: 'callas', brand: 'Cello', model: 'Callas',
      tagline: t('callas_tagline'), description: t('callas_desc'), forText: t('callas_for'),
      photo: '/bikes/callas.png', color: 'from-green-500/10 to-transparent', badgeColor: 'bg-green-100 text-green-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '27.5"' },
        { labelKey: 'spec_derailleur', value: 'Shimano XT + SLX' },
        { labelKey: 'spec_height', value: '165 – 180 cm' },
      ],
    },
    {
      id: 'principia', brand: 'Principia', model: 'MXC',
      tagline: t('principia_tagline'), description: t('principia_desc'), forText: t('principia_for'),
      photo: '/bikes/principia.png', color: 'from-emerald-500/10 to-transparent', badgeColor: 'bg-emerald-100 text-emerald-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '26"' },
        { labelKey: 'spec_derailleur', value: 'Shimano XT + SLX' },
        { labelKey: 'spec_height', value: '165 – 180 cm' },
      ],
    },
    {
      id: 'zaskar', brand: 'GT', model: 'Zaskar',
      tagline: t('zaskar_tagline'), description: t('zaskar_desc'), forText: t('zaskar_for'),
      photo: '/bikes/zaskar.png', color: 'from-orange-500/10 to-transparent', badgeColor: 'bg-orange-100 text-orange-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '26"' },
        { labelKey: 'spec_derailleur', value: 'Shimano Alivio' },
        { labelKey: 'spec_height', value: '165 – 182 cm' },
      ],
    },
    {
      id: 'aspen', brand: 'Jaeger', model: 'Aspen',
      tagline: t('aspen_tagline'), description: t('aspen_desc'), forText: t('aspen_for'),
      photo: '/bikes/aspen.png', color: 'from-lime-500/10 to-transparent', badgeColor: 'bg-lime-100 text-lime-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '26"' },
        { labelKey: 'spec_derailleur', value: 'Shimano XT' },
        { labelKey: 'spec_height', value: '165 – 182 cm' },
      ],
    },
    {
      id: 'aspen-limited', brand: 'Jaeger', model: 'Aspen Limited',
      tagline: t('aspen_limited_tagline'), description: t('aspen_limited_desc'), forText: t('aspen_limited_for'),
      photo: '/bikes/aspen-limited.png', color: 'from-rose-500/10 to-transparent', badgeColor: 'bg-rose-100 text-rose-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '26"' },
        { labelKey: 'spec_derailleur', value: 'Campagnolo Athena' },
        { labelKey: 'spec_height', value: '170 – 180 cm' },
      ],
    },
  ]

  const MINIROAD_BIKES: BikeData[] = [
    {
      id: 'meridan', brand: 'Cello', model: 'Meridan',
      tagline: t('meridan_tagline'), description: t('meridan_desc'), forText: t('meridan_for'),
      photo: '/bikes/meridan.png', color: 'from-purple-500/10 to-transparent', badgeColor: 'bg-purple-100 text-purple-700',
      specs: [
        { labelKey: 'spec_material', value: t('spec_val_carbon') },
        { labelKey: 'spec_size', value: '27.5"' },
        { labelKey: 'spec_derailleur', value: 'Shimano Sora' },
        { labelKey: 'spec_height', value: '160 – 173 cm' },
      ],
    },
  ]

  const EBIKE_BIKES: BikeData[] = [
    {
      id: 'tx8-pro', brand: '모토벨로', model: 'TX8 PRO',
      tagline: t('tx8_pro_tagline'), description: t('tx8_pro_desc'), forText: t('tx8_pro_for'),
      photo: '/bikes/tx8-pro.png', color: 'from-zinc-500/10 to-transparent', badgeColor: 'bg-zinc-200 text-zinc-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum_folding') },
        { labelKey: 'spec_size', value: '20"' },
        { labelKey: 'spec_motor', value: t('spec_val_hub_motor') },
        { labelKey: 'spec_range', value: t('spec_val_range_60') },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
        { labelKey: 'spec_derailleur', value: 'Shimano 7단' },
      ],
    },
    {
      id: 'tx8-pro3', brand: '모토벨로', model: 'TX8 PRO3',
      tagline: t('tx8_pro3_tagline'), description: t('tx8_pro3_desc'), forText: t('tx8_pro3_for'),
      photo: '/bikes/tx8-pro3.png', color: 'from-zinc-600/10 to-transparent', badgeColor: 'bg-zinc-200 text-zinc-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum_folding') },
        { labelKey: 'spec_size', value: t('spec_val_fat_tire') },
        { labelKey: 'spec_motor', value: t('spec_val_hub_motor') },
        { labelKey: 'spec_range', value: t('spec_val_range_60') },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
        { labelKey: 'spec_derailleur', value: 'Shimano 7단' },
      ],
    },
    {
      id: 'viaggio-v6', brand: 'AU테크', model: '비아지오 V6',
      tagline: t('viaggio_v6_tagline'), description: t('viaggio_v6_desc'), forText: t('viaggio_v6_for'),
      photo: '/bikes/v6.png', color: 'from-amber-500/10 to-transparent', badgeColor: 'bg-amber-100 text-amber-700',
      specs: [
        { labelKey: 'spec_battery', value: t('spec_val_battery_20ah') },
        { labelKey: 'spec_range', value: t('spec_val_range_160') },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
        { labelKey: 'spec_suspension', value: t('spec_val_dual_suspension') },
        { labelKey: 'spec_display', value: t('spec_val_color_lcd') },
        { labelKey: 'spec_lights', value: t('spec_val_led_headlight') },
      ],
    },
    {
      id: 'tn8-pro', brand: '모토벨로', model: 'TN8 PRO',
      tagline: t('tn8_pro_tagline'), description: t('tn8_pro_desc'), forText: t('tn8_pro_for'),
      photo: null, color: 'from-zinc-700/10 to-transparent', badgeColor: 'bg-zinc-200 text-zinc-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum_folding') },
        { labelKey: 'spec_size', value: '20"' },
        { labelKey: 'spec_motor', value: '500W 허브모터' },
        { labelKey: 'spec_battery', value: '48V 20Ah 리튬이온' },
        { labelKey: 'spec_range', value: '최대 130km (완충 기준)' },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
      ],
    },
    {
      id: 'e-volt', brand: '스마트', model: 'e-volt',
      tagline: t('e_volt_tagline'), description: t('e_volt_desc'), forText: t('e_volt_for'),
      photo: null, color: 'from-sky-500/10 to-transparent', badgeColor: 'bg-sky-100 text-sky-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum_folding') },
        { labelKey: 'spec_size', value: '16"' },
        { labelKey: 'spec_motor', value: '350W 허브모터' },
        { labelKey: 'spec_battery', value: '48V 7.5Ah 리튬이온' },
        { labelKey: 'spec_range', value: '최대 35km (완충 기준)' },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
      ],
    },
    {
      id: 'q-tour', brand: 'quali', model: 'q-tour',
      tagline: t('q_tour_tagline'), description: t('q_tour_desc'), forText: t('q_tour_for'),
      photo: null, color: 'from-violet-500/10 to-transparent', badgeColor: 'bg-violet-100 text-violet-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '20"' },
        { labelKey: 'spec_motor', value: '500W 허브모터' },
        { labelKey: 'spec_battery', value: '48V 15Ah 리튬이온' },
        { labelKey: 'spec_range', value: '최대 70km (완충 기준)' },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
      ],
    },
    {
      id: 'q-max', brand: 'quali', model: 'q-max',
      tagline: t('q_max_tagline'), description: t('q_max_desc'), forText: t('q_max_for'),
      photo: null, color: 'from-violet-600/10 to-transparent', badgeColor: 'bg-violet-100 text-violet-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '20"' },
        { labelKey: 'spec_motor', value: '500W 허브모터' },
        { labelKey: 'spec_battery', value: '48V 20Ah 리튬이온' },
        { labelKey: 'spec_range', value: '최대 90km (완충 기준)' },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
      ],
    },
    {
      id: 'j2-aeul-pro', brand: 'j2 sport', model: '애울 프로',
      tagline: t('j2_aeul_pro_tagline'), description: t('j2_aeul_pro_desc'), forText: t('j2_aeul_pro_for'),
      photo: null, color: 'from-rose-500/10 to-transparent', badgeColor: 'bg-rose-100 text-rose-700',
      specs: [
        { labelKey: 'spec_frame', value: t('spec_val_aluminum') },
        { labelKey: 'spec_size', value: '20"' },
        { labelKey: 'spec_motor', value: '350W 허브모터' },
        { labelKey: 'spec_battery', value: '36V 15Ah 리튬이온' },
        { labelKey: 'spec_range', value: '최대 50km (완충 기준)' },
        { labelKey: 'spec_max_speed', value: t('spec_val_speed_25') },
      ],
    },
  ]

  const CATEGORIES = [
    { id: 'road',     label: t('road_label'),     icon: Bike,     bikes: ROAD_BIKES,     desc: t('road_desc') },
    { id: 'mtb',      label: t('mtb_label'),      icon: Mountain, bikes: MTB_BIKES,      desc: t('mtb_desc') },
    { id: 'miniroad', label: t('miniroad_label'), icon: Wind,     bikes: MINIROAD_BIKES, desc: t('miniroad_desc') },
    { id: 'ebike',    label: t('ebike_label'),    icon: Zap,      bikes: EBIKE_BIKES,    desc: t('ebike_desc') },
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-zinc-950 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">Our Fleet</p>
        <h1 className="text-4xl font-black text-white sm:text-5xl">{t('hero_title')}</h1>
        <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed whitespace-pre-line">
          {t('hero_subtitle')}
        </p>
      </section>

      {/* Category Sections */}
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        return (
          <section key={cat.id} className="py-16 border-b border-zinc-100 last:border-b-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">{cat.label}</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">{cat.desc}</p>
                </div>
                <span className="ml-auto rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-500">
                  {t('count', { n: cat.bikes.length })}
                </span>
              </div>

              <div className="space-y-8">
                {cat.bikes.map((bike, idx) => {
                  const rentalPrice = RENTAL_PRICES.find((r) => r.bikeId === bike.id)
                  const isEven = idx % 2 === 0
                  return (
                    <div key={bike.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                      <div className={`grid grid-cols-1 lg:grid-cols-2 ${!isEven ? 'lg:grid-flow-dense' : ''}`}>
                        {/* Photo */}
                        <div className={`relative h-64 lg:h-auto min-h-[320px] ${bike.photo ? 'bg-white' : 'bg-zinc-50'} ${!isEven ? 'lg:col-start-2' : ''}`}>
                          {bike.photo ? (
                            <Image
                              src={bike.photo}
                              alt={`${bike.brand} ${bike.model}`}
                              fill
                              className="object-contain mix-blend-multiply p-4"
                            />
                          ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${bike.color} flex items-center justify-center`}>
                              <div className="text-center text-zinc-300">
                                <Bike className="h-16 w-16 mx-auto mb-2 opacity-30" />
                                <p className="text-xs font-semibold opacity-50">{t('photo_coming')}</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${bike.badgeColor}`}>
                              {cat.label}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-between p-8 lg:p-10">
                          <div>
                            <h3 className="text-2xl font-black text-zinc-900">{bike.model}</h3>
                            <p className="text-sm font-semibold text-zinc-400 mt-0.5">{bike.brand}</p>
                            <p className="mt-2 text-base font-bold text-emerald-600">{bike.tagline}</p>
                            <p className="mt-3 text-zinc-600 leading-relaxed text-sm">{bike.description}</p>

                            <p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('recommended_for')}</p>
                            <p className="mt-1 text-sm text-zinc-600">{bike.forText}</p>
                          </div>

                          <div className="mt-6 space-y-2">
                            <details className="group">
                              <summary className="flex cursor-pointer items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 select-none hover:bg-zinc-100 transition-colors">
                                {t('spec_view')}
                                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-2 rounded-xl border border-zinc-200 overflow-hidden">
                                {bike.specs.map(({ labelKey, value }, i) => (
                                  <div key={labelKey} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
                                    <span className="font-semibold text-zinc-500">{t(labelKey as Parameters<TFunc>[0])}</span>
                                    <span className="font-bold text-zinc-800">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </details>

                            {rentalPrice && (
                              <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 select-none hover:bg-emerald-100 transition-colors">
                                  {t('rental_view')}
                                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="mt-2">
                                  <RentalPriceBadge rental={rentalPrice} t={t} currency={currency} />
                                </div>
                              </details>
                            )}

                            <Link
                              href={`/rental?bike=${bike.id}`}
                              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99]"
                            >
                              {t('rental_cta_btn')}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}

      {/* CTA */}
      <section className="py-16 bg-zinc-50 text-center">
        <p className="text-zinc-500 mb-2">{t('cta_video')}</p>
        <h3 className="text-2xl font-black text-zinc-900 mb-6">{t('cta_title')}</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-[1.02]"
          >
            {t('cta_tour')}
          </Link>
          <Link
            href="/rental"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-8 py-4 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-50 hover:scale-[1.02]"
          >
            {t('cta_rental')}
          </Link>
        </div>
      </section>
    </div>
  )
}
