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
    name: '여의도 한강공원', name_en: 'Yeouido Han River Park',
    sub: '+3km · 한강 라이딩 시작', sub_en: '+3km · Han River cycling begins',
    photo: '/stop-chuncheon-yeouido.png',
    badge: { text: '3km', color: 'bg-sky-500' },
    size: 'half',
  },
  {
    num: 3,
    name: '청계광장', name_en: 'Cheonggye Plaza',
    sub: '+10km · 청계천 출발점', sub_en: '+10km · Cheonggye Stream starting point',
    photo: '/stop-cheonggyecheon-stream.png',
    badge: { text: '13km', color: 'bg-blue-500' },
    size: 'two-third',
  },
  {
    num: 4,
    name: '용두공원', name_en: 'Yongdu Park',
    sub: '+7km · 청계천 산책로 라이딩', sub_en: '+7km · Cheonggye Stream trail ride',
    photo: '/stop-cheonggyecheon-yongdu.png',
    badge: { text: '20km', color: 'bg-violet-500' },
    size: 'third',
  },
  {
    num: 5,
    name: '살곶이공원', name_en: 'Salgoji Park',
    sub: 'FINISH · 40km · 중랑천 합류 지점', sub_en: 'FINISH · 40km · Jungnang stream confluence',
    photo: '/stop-cheonggyecheon-salgoji.png',
    badge: { text: 'FINISH', color: 'bg-emerald-500' },
    size: 'full',
  },
]

function StopCard({ stop, tall = false }: { stop: typeof STOPS[0]; tall?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const locale = useLocale()
  const isKo = locale === 'ko'
  const name = isKo ? stop.name : (stop.name_en ?? stop.name)
  const sub = isKo ? stop.sub : (stop.sub_en ?? stop.sub)

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
        </div>
      </div>
    </div>
  )
}

export default function CheonggyecheonRouteSection() {
  const locale = useLocale()
  const isKo = locale === 'ko'
  const [s1, s2, s3, s4, s5] = STOPS

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Route Check-In</p>
          <h2 className="text-2xl font-black text-zinc-900">{isKo ? '투어 코스' : 'Tour Route'}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-black text-white">40km</span>
          <span className="text-xs text-zinc-400">{isKo ? '왕복' : 'round trip'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s1} />
          <StopCard stop={s2} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2"><StopCard stop={s3} tall /></div>
          <StopCard stop={s4} tall />
        </div>
        <div className="w-full">
          <StopCard stop={s5} tall />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="ml-auto text-zinc-400">📱 {isKo ? '사진 위에서 멈추면 상세 정보' : 'Hover for details'}</span>
      </div>
    </section>
  )
}
