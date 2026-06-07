'use client'

import Image from 'next/image'
import { useState } from 'react'

const STOPS = [
  {
    num: 1,
    name: '당산역',
    sub: 'START · 0km',
    photo: '/stop-dangsanstation.jpg',
    badge: { text: 'START', color: 'bg-emerald-500' },
    size: 'half',
  },
  {
    num: 2,
    name: '샛강 생태공원',
    sub: '+5.1km',
    photo: '/stop-saetgang.png',
    badge: { text: '5.1km', color: 'bg-sky-500' },
    size: 'half',
  },
  {
    num: 3,
    name: '한강대교',
    sub: '+1.6km',
    photo: '/stop-hangangbridge.png',
    badge: { text: '6.7km', color: 'bg-violet-500' },
    size: 'third',
  },
  {
    num: 4,
    name: '반포대교 분수',
    sub: '+4.3km · 달빛무지개분수',
    photo: '/stop-banpobridge.png',
    badge: { text: '🌈 FOUNTAIN', color: 'bg-blue-500' },
    size: 'two-third',
  },
  {
    num: 5,
    name: '한강라면',
    sub: '투어 가격에 포함!',
    photo: '/stop-ramen.jpg',
    badge: { text: '🍜 FREE', color: 'bg-amber-400 text-zinc-900' },
    size: 'two-third',
    special: true,
  },
  {
    num: 6,
    name: '노량대교',
    sub: '+2.5km',
    photo: '/stop-noryang.webp',
    badge: { text: '13.5km', color: 'bg-rose-500' },
    size: 'third',
  },
  {
    num: 7,
    name: '서울의 달',
    sub: '+5.0km · 선택 옵션',
    photo: '/stop-seouldal.png',
    badge: { text: '🎈 OPTIONAL', color: 'bg-fuchsia-500' },
    size: 'half',
  },
  {
    num: 8,
    name: '당산역 귀환',
    sub: 'FINISH · 21.2km 완주! 🎉',
    photo: '/stop-dangsanstation.jpg',
    badge: { text: 'FINISH', color: 'bg-emerald-500' },
    size: 'half',
  },
]

function StopCard({ stop, tall = false }: { stop: typeof STOPS[0]; tall?: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group"
      style={{ minHeight: tall ? '280px' : '200px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo */}
      <Image
        src={stop.photo}
        alt={stop.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 50vw"
      />

      {/* Always-on gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-zinc-950/10" />

      {/* FREE ribbon */}
      {stop.special && (
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
          <div className="absolute top-4 -right-6 bg-amber-400 text-zinc-900 text-[10px] font-black px-8 py-1 rotate-45 shadow-lg">
            FREE!
          </div>
        </div>
      )}

      {/* Number */}
      <div className="absolute top-3 left-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-black text-white">
          {stop.num}
        </div>
      </div>

      {/* Badge top-right */}
      <div className="absolute top-3 right-3">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-lg ${stop.badge.color}`}>
          {stop.badge.text}
        </span>
      </div>

      {/* Bottom info — always visible */}
      <div className="absolute bottom-0 inset-x-0 p-4">
        <p className="text-base font-black text-white leading-tight">{stop.name}</p>
        <p className="text-xs text-zinc-300 mt-0.5">{stop.sub}</p>
      </div>

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center px-4">
          <p className="text-2xl font-black text-white">{stop.num < 10 ? `0${stop.num}` : stop.num}</p>
          <p className="text-lg font-black text-white mt-1">{stop.name}</p>
          <p className="text-sm text-zinc-300 mt-0.5">{stop.sub}</p>
          {stop.special && (
            <p className="text-sm font-bold text-amber-400 mt-2">투어 가격에 포함된 혜택 🎉</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RouteSection() {
  const [s1, s2, s3, s4, s5, s6, s7, s8] = STOPS

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Route Check-In</p>
          <h2 className="text-2xl font-black text-zinc-900">투어 코스</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-black text-white">21.2km</span>
          <span className="text-xs text-zinc-400">순환</span>
        </div>
      </div>

      {/* Bento grid */}
      <div className="flex flex-col gap-2">

        {/* Row 1: 당산역 + 샛강 (50/50) */}
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s1} />
          <StopCard stop={s2} />
        </div>

        {/* Row 2: 한강대교(1/3) + 반포대교(2/3) */}
        <div className="grid grid-cols-3 gap-2">
          <StopCard stop={s3} tall />
          <div className="col-span-2">
            <StopCard stop={s4} tall />
          </div>
        </div>

        {/* Row 3: 한강라면(2/3) + 노량대교(1/3) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <StopCard stop={s5} tall />
          </div>
          <StopCard stop={s6} tall />
        </div>

        {/* Row 4: 서울의 달 + 당산역 도착 (50/50) */}
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s7} />
          <StopCard stop={s8} />
        </div>

      </div>

      {/* Footer legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />무료 포함
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-fuchsia-400" />현장 선택
        </span>
        <span className="ml-auto text-zinc-400">📱 사진 위에서 멈추면 상세 정보</span>
      </div>
    </section>
  )
}
