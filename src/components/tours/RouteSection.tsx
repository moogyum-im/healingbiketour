'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useLocale } from 'next-intl'

const STOPS = [
  {
    num: 1,
    name: '당산역', name_en: 'Dangsan Station',
    sub: 'START · 0km', sub_en: 'START · 0km',
    photo: '/stop-dangsanstation.jpg',
    badge: { text: 'START', color: 'bg-emerald-500' },
    size: 'half',
  },
  {
    num: 2,
    name: '샛강 생태공원', name_en: 'Saetgang Ecological Park',
    sub: '+5.1km', sub_en: '+5.1km',
    photo: '/stop-saetgang.png',
    badge: { text: '5.1km', color: 'bg-sky-500' },
    size: 'half',
  },
  {
    num: 3,
    name: '한강대교', name_en: 'Hangang Bridge',
    sub: '+1.6km', sub_en: '+1.6km',
    photo: '/stop-hangangbridge.png',
    badge: { text: '6.7km', color: 'bg-violet-500' },
    size: 'third',
  },
  {
    num: 4,
    name: '반포대교 분수', name_en: 'Banpo Bridge Fountain',
    sub: '+4.3km · 달빛무지개분수', sub_en: '+4.3km · Moonlight Rainbow Fountain',
    photo: '/stop-banpobridge.png',
    badge: { text: '🌈 FOUNTAIN', color: 'bg-blue-500' },
    size: 'two-third',
  },
  {
    num: 5,
    name: '한강라면', name_en: 'Han River Ramen',
    sub: '투어 가격에 포함!', sub_en: 'Included in tour price!',
    photo: '/stop-ramen.jpg',
    badge: { text: '🍜 FREE', color: 'bg-amber-400 text-zinc-900' },
    size: 'two-third',
    special: true,
  },
  {
    num: 6,
    name: '노량대교', name_en: 'Noryang Bridge',
    sub: '+2.5km', sub_en: '+2.5km',
    photo: '/stop-noryang.webp',
    badge: { text: '13.5km', color: 'bg-rose-500' },
    size: 'third',
  },
  {
    num: 7,
    name: '서울의 달', name_en: 'Seoul Balloon',
    sub: '+5.0km · 선택 옵션', sub_en: '+5.0km · Optional add-on',
    photo: '/stop-seouldal.png',
    badge: { text: '🎈 OPTIONAL', color: 'bg-fuchsia-500' },
    size: 'half',
  },
  {
    num: 8,
    name: '당산역 귀환', name_en: 'Return to Dangsan',
    sub: 'FINISH · 21.2km 완주! 🎉', sub_en: 'FINISH · 21.2km complete! 🎉',
    photo: '/stop-dangsanstation.jpg',
    badge: { text: 'FINISH', color: 'bg-emerald-500' },
    size: 'half',
  },
]

function StopCard({ stop, tall = false }: { stop: typeof STOPS[0]; tall?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const locale = useLocale()
  const isKo = locale === 'ko'
  const name = isKo ? stop.name : (stop.name_en ?? stop.name)
  const sub = isKo ? stop.sub : (stop.sub_en ?? stop.sub)
  const specialText = isKo ? '투어 가격에 포함된 혜택 🎉' : 'Included in your tour price 🎉'

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group"
      style={{ minHeight: tall ? '280px' : '200px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={stop.photo}
        alt={name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-zinc-950/10" />

      {stop.special && (
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
          <div className="absolute top-4 -right-6 bg-amber-400 text-zinc-900 text-[10px] font-black px-8 py-1 rotate-45 shadow-lg">
            FREE!
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-black text-white">
          {stop.num}
        </div>
      </div>

      <div className="absolute top-3 right-3">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-lg ${stop.badge.color}`}>
          {stop.badge.text}
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4">
        <p className="text-base font-black text-white leading-tight">{name}</p>
        <p className="text-xs text-zinc-300 mt-0.5">{sub}</p>
      </div>

      <div className={`absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center px-4">
          <p className="text-2xl font-black text-white">{stop.num < 10 ? `0${stop.num}` : stop.num}</p>
          <p className="text-lg font-black text-white mt-1">{name}</p>
          <p className="text-sm text-zinc-300 mt-0.5">{sub}</p>
          {stop.special && (
            <p className="text-sm font-bold text-amber-400 mt-2">{specialText}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RouteSection() {
  const locale = useLocale()
  const isKo = locale === 'ko'
  const [s1, s2, s3, s4, s5, s6, s7, s8] = STOPS

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Route Check-In</p>
          <h2 className="text-2xl font-black text-zinc-900">{isKo ? '투어 코스' : 'Tour Route'}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-black text-white">21.2km</span>
          <span className="text-xs text-zinc-400">{isKo ? '순환' : 'loop'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s1} />
          <StopCard stop={s2} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StopCard stop={s3} tall />
          <div className="col-span-2"><StopCard stop={s4} tall /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2"><StopCard stop={s5} tall /></div>
          <StopCard stop={s6} tall />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s7} />
          <StopCard stop={s8} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />{isKo ? '무료 포함' : 'Included free'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-fuchsia-400" />{isKo ? '현장 선택' : 'Choose on-site'}
        </span>
        <span className="ml-auto text-zinc-400">📱 {isKo ? '사진 위에서 멈추면 상세 정보' : 'Hover for details'}</span>
      </div>
    </section>
  )
}
