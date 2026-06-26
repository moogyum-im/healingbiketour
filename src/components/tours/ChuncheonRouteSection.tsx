'use client'

import Image from 'next/image'
import { useState } from 'react'

const STOPS = [
  {
    num: 1,
    name: '당산역',
    sub: 'START · 0km · 출발 집결지',
    photo: '/stop-chuncheon-dangsan.png',
    badge: { text: 'START', color: 'bg-emerald-500' },
  },
  {
    num: 2,
    name: '팔당 (초계국수)',
    sub: '+41km · 팔당댐 뷰포인트 · 초계국수 포인트',
    photo: '/stop-chuncheon-paldang.png',
    badge: { text: '41km', color: 'bg-sky-500' },
  },
  {
    num: 3,
    name: '두물머리',
    sub: '+10km · 남한강·북한강이 만나는 비경',
    photo: '/stop-chuncheon-dumulmeori.png',
    badge: { text: '51km', color: 'bg-violet-500' },
  },
  {
    num: 4,
    name: '세미원 연꽃정원',
    sub: '+3km · 연꽃 가득한 수생식물 공원',
    photo: '/stop-chuncheon-lotus.png',
    badge: { text: '54km', color: 'bg-pink-500' },
  },
  {
    num: 5,
    name: '자라섬',
    sub: '+40km · 북한강 자전거길 하이라이트',
    photo: '/stop-chuncheon-jaraseom.png',
    badge: { text: '94km', color: 'bg-rose-500' },
  },
  {
    num: 6,
    name: '남이섬',
    sub: '+3km · 사계절 아름다운 섬 라이딩',
    photo: '/stop-chuncheon-namisum.png',
    badge: { text: '97km', color: 'bg-orange-500' },
  },
  {
    num: 7,
    name: '레고랜드 코리아',
    sub: '+32km · 강촌·호수케블카 경유',
    photo: '/stop-chuncheon-legoland.png',
    badge: { text: '129km', color: 'bg-amber-500' },
  },
  {
    num: 8,
    name: '춘천역 (차량 복귀)',
    sub: 'FINISH · 용산역까지 차량 이동',
    photo: '/stop-chuncheon-bridge.png',
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
        </div>
      </div>
    </div>
  )
}

export default function ChuncheonRouteSection() {
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
          <span className="text-sm font-black text-white">129km</span>
          <span className="text-xs text-zinc-400">편도</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">

        {/* Row 1: 당산역(1/3) + 팔당(2/3) */}
        <div className="grid grid-cols-3 gap-2">
          <StopCard stop={s1} />
          <div className="col-span-2">
            <StopCard stop={s2} />
          </div>
        </div>

        {/* Row 2: 두물머리(2/3) + 세미원(1/3) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <StopCard stop={s3} tall />
          </div>
          <StopCard stop={s4} tall />
        </div>

        {/* Row 3: 자라섬(1/2) + 남이섬(1/2) */}
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s5} tall />
          <StopCard stop={s6} tall />
        </div>

        {/* Row 4: 레고랜드(2/3) + 춘천역(1/3) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <StopCard stop={s7} />
          </div>
          <StopCard stop={s8} />
        </div>

      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />출발
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />도착
        </span>
        <span className="ml-auto text-zinc-400">📱 사진 위에서 멈추면 상세 정보</span>
      </div>
    </section>
  )
}
