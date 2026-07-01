'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useLocale } from 'next-intl'

const STOPS = [
  {
    num: 1,
    name: '전류리포구', name_en: 'Jeolluri Port',
    sub: 'START · 0km · 출발 집결지', sub_en: 'START · 0km · Departure point',
    photo: '/stop-peacenuri-jeonryuri.png',
    badge: { text: 'START', color: 'bg-emerald-500' },
  },
  {
    num: 2,
    name: '석탄리 철새 도래지', name_en: 'Seoktanri Migratory Bird Site',
    sub: '+4km · 철책선 옆 평화의 자전거길', sub_en: '+4km · Peace cycling trail along the fence line',
    photo: '/stop-peacenuri-seoktanri.png',
    badge: { text: '4km', color: 'bg-sky-500' },
  },
  {
    num: 3,
    name: '애기봉 전망대', name_en: 'Aegibong Observatory',
    sub: '+7.2km · 북한이 보이는 최전방 전망대', sub_en: '+7.2km · Frontline observatory overlooking North Korea',
    photo: '/stop-peacenuri-aegibong.png',
    badge: { text: '11km', color: 'bg-violet-500' },
  },
  {
    num: 4,
    name: 'DMZ평화의길 거점센터', name_en: 'DMZ Peace Trail Center',
    sub: '+4km · 김포 DMZ 테마 전시관', sub_en: '+4km · Gimpo DMZ themed exhibition center',
    photo: '/stop-peacenuri-dmz.png',
    badge: { text: '15km', color: 'bg-rose-500' },
  },
  {
    num: 5,
    name: '김포대학', name_en: 'Gimpo University',
    sub: '+10km · 한적한 시골길 라이딩', sub_en: '+10km · Quiet countryside road riding',
    photo: '/stop-peacenuri-kimpouni.png',
    badge: { text: '25km', color: 'bg-orange-500' },
  },
  {
    num: 6,
    name: '석정초등학교', name_en: 'Seokjeong Elementary School',
    sub: '+4.5km · 우주 테마 벽화 포토스팟', sub_en: '+4.5km · Space-themed mural photo spot',
    photo: '/stop-peacenuri-seokjeong.png',
    badge: { text: '30km', color: 'bg-teal-500' },
  },
  {
    num: 7,
    name: '덕포진 교육박물관', name_en: 'Deokpojin Education Museum',
    sub: '+4.5km · 조선시대 역사 현장', sub_en: '+4.5km · Joseon-era historic battleground',
    photo: '/stop-peacenuri-deokpojin.png',
    badge: { text: '34km', color: 'bg-amber-500' },
  },
  {
    num: 8,
    name: '대명항', name_en: 'Daemyeong Harbor',
    sub: 'FINISH · 43km · 서해 신선 수산시장', sub_en: 'FINISH · 43km · West Sea fresh seafood market',
    photo: '/stop-peacenuri-daemyeong.png',
    badge: { text: 'FINISH', color: 'bg-emerald-500' },
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
      <Image src={stop.photo} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-zinc-950/10" />
      <div className="absolute top-3 left-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-black text-white">{stop.num}</div>
      </div>
      <div className="absolute top-3 right-3">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-lg ${stop.badge.color}`}>{stop.badge.text}</span>
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

export default function PeaceNuriRouteSection() {
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
          <span className="text-sm font-black text-white">43km</span>
          <span className="text-xs text-zinc-400">{isKo ? '편도' : 'one-way'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <StopCard stop={s1} />
          <div className="col-span-2"><StopCard stop={s2} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2"><StopCard stop={s3} tall /></div>
          <StopCard stop={s4} tall />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StopCard stop={s5} tall />
          <StopCard stop={s6} tall />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2"><StopCard stop={s7} /></div>
          <StopCard stop={s8} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />{isKo ? '출발' : 'Depart'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />{isKo ? '도착' : 'Arrive'}
        </span>
        <span className="ml-auto text-zinc-400">📱 {isKo ? '사진 위에서 멈추면 상세 정보' : 'Hover for details'}</span>
      </div>
    </section>
  )
}
