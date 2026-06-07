'use client'

import Image from 'next/image'
import { useState } from 'react'

const STOPS = [
  {
    num: 1,
    name: '당산역',
    sub: 'START · 0km',
    photo: '/stop-ara-dangsan.png',
    badge: { text: 'START', color: 'bg-emerald-500' },
  },
  {
    num: 2,
    name: '난지 하늘공원',
    sub: '+5km · 꽃밭 & 메타세쿼이아 숲',
    photo: '/stop-haengju-nanjido.png',
    badge: { text: '5km', color: 'bg-sky-500' },
  },
  {
    num: 3,
    name: '행주산성',
    sub: '+6.5km · 역사 유적지',
    photo: '/stop-haengju-fortress.png',
    badge: { text: '11.5km', color: 'bg-violet-500' },
  },
  {
    num: 4,
    name: '아라항 (현대아울렛)',
    sub: '+6km · 수상레저 & 쇼핑',
    photo: '/stop-ara-port.png',
    badge: { text: '17.5km', color: 'bg-rose-500' },
  },
  {
    num: 5,
    name: '서울식물원',
    sub: '+6km · 도심 속 열대 온실',
    photo: '/stop-ara-botanic.png',
    badge: { text: '23.5km', color: 'bg-teal-500' },
  },
  {
    num: 6,
    name: '선유도공원',
    sub: '+7km · 한강 섬 공원',
    photo: '/stop-haengju-seonyudo.png',
    badge: { text: '30.5km', color: 'bg-amber-500' },
  },
  {
    num: 7,
    name: '한강라면',
    sub: '투어 가격에 포함!',
    photo: '/stop-ramen.jpg',
    badge: { text: '🍜 FREE', color: 'bg-amber-400 text-zinc-900' },
    special: true,
  },
  {
    num: 8,
    name: '당산역 귀환',
    sub: 'FINISH · 32km 완주! 🎉',
    photo: '/stop-ara-dangsan.png',
    badge: { text: 'FINISH', color: 'bg-emerald-500' },
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
      <Image
        src={stop.photo}
        alt={stop.name}
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
        <p className="text-base font-black text-white leading-tight">{stop.name}</p>
        <p className="text-xs text-zinc-300 mt-0.5">{stop.sub}</p>
      </div>

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

export default function HaengjuRouteSection() {
  const [s1, s2, s3, s4, s5, s6, s7, s8] = STOPS

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Route Check-In</p>
          <h2 className="text-2xl font-black text-zinc-900">투어 코스</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-black text-white">32km</span>
          <span className="text-xs text-zinc-400">순환</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">

        {/* Row 1: 당산역(1/3) + 난지하늘공원(2/3) */}
        <div className="grid grid-cols-3 gap-2">
          <StopCard stop={s1} />
          <div className="col-span-2">
            <StopCard stop={s2} />
          </div>
        </div>

        {/* Row 2: 행주산성(2/3) + 아라항(1/3) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <StopCard stop={s3} tall />
          </div>
          <StopCard stop={s4} tall />
        </div>

        {/* Row 3: 서울식물원(1/2) + 선유도공원(1/2) */}
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s5} tall />
          <StopCard stop={s6} tall />
        </div>

        {/* Row 4: 한강라면(2/3) + 당산역 귀환(1/3) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <StopCard stop={s7} />
          </div>
          <StopCard stop={s8} />
        </div>

      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />무료 포함
        </span>
        <span className="ml-auto text-zinc-400">📱 사진 위에서 멈추면 상세 정보</span>
      </div>
    </section>
  )
}
