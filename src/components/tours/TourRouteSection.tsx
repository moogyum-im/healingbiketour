'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import type { RouteStop, TourRoute } from '@/types'

function StopCard({ stop }: { stop: RouteStop }) {
  const [hovered, setHovered] = useState(false)
  const locale = useLocale()
  const isKo = locale === 'ko'
  const name = isKo ? stop.name : (stop.name_en || stop.name)
  const sub = isKo ? stop.sub : (stop.sub_en || stop.sub)

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group aspect-[4/3]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {stop.photo && (
        <Image
          src={stop.photo}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-zinc-950/10" />

      {stop.special && (
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
          <div className="absolute top-4 -right-6 bg-amber-400 text-zinc-900 text-[10px] font-black px-8 py-1 rotate-45 shadow-lg">
            {stop.ribbon_text || 'FREE!'}
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-black text-white">
          {stop.num}
        </div>
      </div>

      <div className="absolute top-3 right-3">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-lg ${stop.badge_color}`}>
          {stop.badge_text}
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

function groupStops(stops: RouteStop[]) {
  const groups: { label?: string; desc?: string; desc_en?: string; color?: string; stops: RouteStop[] }[] = []
  for (const stop of stops) {
    const last = groups[groups.length - 1]
    // day_label이 없는 스팟들끼리도(undefined === undefined) 하나의 그룹으로 묶여야
    // 일반 투어가 한 줄에 하나씩 쌓이지 않고 정상적인 그리드로 표시된다.
    if (last && last.label === stop.day_label) {
      last.stops.push(stop)
    } else {
      groups.push({
        label: stop.day_label,
        desc: stop.day_desc,
        desc_en: stop.day_desc_en,
        color: stop.day_color,
        stops: [stop],
      })
    }
  }
  return groups
}

export default function TourRouteSection({ route }: { route: TourRoute }) {
  const locale = useLocale()
  const isKo = locale === 'ko'

  if (!route?.stops?.length) return null

  const title = isKo ? (route.title || '투어 코스') : (route.title_en || route.title || 'Tour Route')
  const groups = groupStops(route.stops)
  const hasSpecial = route.stops.some((s) => s.special)

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Route Check-In</p>
          <h2 className="text-2xl font-black text-zinc-900">{title}</h2>
        </div>
        {!!route.summary?.length && (
          <div className="flex items-center gap-2">
            {route.summary.map((badge, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-full px-4 py-2 ${badge.color || 'bg-zinc-900'}`}>
                {i === 0 && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                <span className="text-sm font-black text-white">
                  {isKo ? badge.text : (badge.text_en || badge.text)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black text-white ${group.color || 'bg-zinc-700'}`}>
                  {group.label}
                </span>
                {(group.desc || group.desc_en) && (
                  <span className="text-xs text-zinc-500">{isKo ? group.desc : (group.desc_en || group.desc)}</span>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {group.stops.map((stop) => (
                <StopCard key={stop.id} stop={stop} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        {hasSpecial && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />{isKo ? '무료 포함' : 'Included free'}
          </span>
        )}
        <span className="ml-auto text-zinc-400">📱 {isKo ? '사진 위에서 멈추면 상세 정보' : 'Hover for details'}</span>
      </div>
    </section>
  )
}
