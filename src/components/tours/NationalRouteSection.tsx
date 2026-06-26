'use client'

import Image from 'next/image'
import { useState } from 'react'

const STOPS = [
  { num: 1,  name: '아라 서해갑문',   sub: 'START · 0km · 인천 출발',            photo: '/stop-national-ara-west.png',      badge: { text: 'START', color: 'bg-emerald-500' }, km: 0 },
  { num: 2,  name: '아라 한강갑문',   sub: '+21km · 경인아라뱃길 동쪽 끝',       photo: '/stop-national-ara-hangang.png',   badge: { text: '21km',  color: 'bg-sky-500'     }, km: 21 },
  { num: 3,  name: '여의도',          sub: '+13km · 한강 도심 자전거길',          photo: '/stop-national-yeouido.png',       badge: { text: '34km',  color: 'bg-blue-500'    }, km: 34 },
  { num: 4,  name: '뚝섬',            sub: '+17km · 한강공원 체크포인트',         photo: '/stop-national-ttukseom.png',      badge: { text: '51km',  color: 'bg-violet-500'  }, km: 51 },
  { num: 5,  name: '광나루',          sub: '+5km · 한강 동쪽 진입',              photo: '/stop-national-gwangnaru.png',     badge: { text: '56km',  color: 'bg-purple-500'  }, km: 56 },
  { num: 6,  name: '능내역',          sub: '+23km · 옛 팔당역·남한강 진입',      photo: '/stop-national-neungnae.png',      badge: { text: '79km',  color: 'bg-rose-500'    }, km: 79 },
  { num: 7,  name: '양평미술관',      sub: '+25km · 양평 체크포인트',            photo: '/stop-national-yangpyeong.png',    badge: { text: '104km', color: 'bg-pink-500'    }, km: 104 },
  { num: 8,  name: '이포보',          sub: '+16km · 남한강 보 시작',             photo: '/stop-national-ipo.png',           badge: { text: '120km', color: 'bg-orange-500'  }, km: 120 },
  { num: 9,  name: '여주보',          sub: '+14km · 여주 도심 통과',             photo: '/stop-national-yeoju.png',         badge: { text: '134km', color: 'bg-amber-500'   }, km: 134 },
  { num: 10, name: '강천보',          sub: '+10km · 남한강 마지막 보',           photo: '/stop-national-gangcheon.png',     badge: { text: '144km', color: 'bg-yellow-500'  }, km: 144 },
  { num: 11, name: '비내섬',          sub: '+28km · 충주 자연 습지 섬',          photo: '/stop-national-binae.png',         badge: { text: '172km', color: 'bg-lime-500'    }, km: 172 },
  { num: 12, name: '탄금대',          sub: '+36km · 충주 역사 유적지',           photo: '/stop-national-tangeum.png',       badge: { text: '208km', color: 'bg-green-500'   }, km: 208 },
  { num: 13, name: '수안보',          sub: '+28km · 충북 수안보 온천',           photo: '/stop-national-suanbo.png',        badge: { text: '236km', color: 'bg-teal-500'    }, km: 236 },
  { num: 14, name: '이화령 휴게소',   sub: '+19km · 한강·낙동강 분수령 고개',   photo: '/stop-national-ihwaryeong.png',    badge: { text: '255km', color: 'bg-cyan-500'    }, km: 255 },
  { num: 15, name: '문경 불정역',     sub: '+22km · 낙동강 최상류 진입',        photo: '/stop-national-mungyeong.png',     badge: { text: '277km', color: 'bg-indigo-500'  }, km: 277 },
  { num: 16, name: '상주상풍교',      sub: '+31km · 상주 낙동강 체크포인트',    photo: '/stop-national-sangju-bridge.png', badge: { text: '308km', color: 'bg-sky-500'     }, km: 308 },
  { num: 17, name: '상주보',          sub: '+11km · 낙동강 보 구간 시작',       photo: '/stop-national-sangju.png',        badge: { text: '319km', color: 'bg-blue-500'    }, km: 319 },
  { num: 18, name: '낙단보',          sub: '+17km',                             photo: '/stop-national-nakdan.png',        badge: { text: '336km', color: 'bg-violet-500'  }, km: 336 },
  { num: 19, name: '구미보',          sub: '+19km · 구미 공단 통과',            photo: '/stop-national-gumi.png',          badge: { text: '355km', color: 'bg-purple-500'  }, km: 355 },
  { num: 20, name: '칠곡보',          sub: '+26km · 대구 북쪽 진입',            photo: '/stop-national-chilgok.png',       badge: { text: '381km', color: 'bg-rose-500'    }, km: 381 },
  { num: 21, name: '고령보',          sub: '+26km · 대가야 고령 통과',          photo: '/stop-national-goryeong.png',      badge: { text: '407km', color: 'bg-orange-500'  }, km: 407 },
  { num: 22, name: '달성보',          sub: '+23km · 대구 달성 체크포인트',      photo: '/stop-national-dalseong.png',      badge: { text: '430km', color: 'bg-amber-500'   }, km: 430 },
  { num: 23, name: '창녕보',          sub: '+38km · 낙동강 중·하류 전환',       photo: '/stop-national-changnyeong.png',   badge: { text: '468km', color: 'bg-lime-500'    }, km: 468 },
  { num: 24, name: '함안보',          sub: '+55km · 경남 함안',                 photo: '/stop-national-haman.png',         badge: { text: '523km', color: 'bg-green-500'   }, km: 523 },
  { num: 25, name: '양산문화관',      sub: '+55km · 부산 진입 직전',            photo: '/stop-national-yangsan.png',       badge: { text: '578km', color: 'bg-teal-500'    }, km: 578 },
  { num: 26, name: '낙동강하구뚝',    sub: 'FINISH · 562km · 완주 인증',        photo: '/stop-national-nakdong-end.png',   badge: { text: 'FINISH', color: 'bg-emerald-500' }, km: 562 },
]

function StopCard({ stop, tall = false }: { stop: typeof STOPS[0]; tall?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{ minHeight: tall ? '180px' : '130px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image src={stop.photo} alt={stop.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-zinc-950/5" />
      <div className="absolute top-2 left-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[9px] font-black text-white">{stop.num}</div>
      </div>
      <div className="absolute top-2 right-2">
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black text-white shadow ${stop.badge.color}`}>{stop.badge.text}</span>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-2.5">
        <p className="text-xs font-black text-white leading-tight">{stop.name}</p>
      </div>
      <div className={`absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center px-2">
          <p className="text-sm font-black text-white">{stop.name}</p>
          <p className="text-[10px] text-zinc-300 mt-0.5">{stop.sub}</p>
        </div>
      </div>
    </div>
  )
}

const DAY_GROUPS = [
  { label: 'Day 1', desc: '한강 도심', range: [0, 4],  color: 'bg-sky-500' },
  { label: 'Day 2', desc: '남한강 진입', range: [5, 8], color: 'bg-violet-500' },
  { label: 'Day 3', desc: '충주·탄금대', range: [9, 12], color: 'bg-rose-500' },
  { label: 'Day 4', desc: '이화령 고개', range: [13, 16], color: 'bg-amber-500' },
  { label: 'Day 5', desc: '낙동강 상류', range: [17, 21], color: 'bg-green-500' },
  { label: 'Day 6', desc: '낙동강 완주', range: [22, 25], color: 'bg-emerald-500' },
]

export default function NationalRouteSection() {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Route Check-In · 26 Stops</p>
          <h2 className="text-2xl font-black text-zinc-900">국토종주 코스</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-black text-white">562km</span>
            <span className="text-xs text-zinc-400">편도</span>
          </div>
          <div className="rounded-full bg-amber-500 px-4 py-2">
            <span className="text-sm font-black text-white">5박6일</span>
          </div>
        </div>
      </div>

      {DAY_GROUPS.map((day) => {
        const stops = STOPS.slice(day.range[0], day.range[1] + 1)
        return (
          <div key={day.label} className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black text-white ${day.color}`}>{day.label}</span>
              <span className="text-xs text-zinc-500">{day.desc}</span>
            </div>
            <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${stops.length}, 1fr)` }}>
              {stops.map((stop) => (
                <StopCard key={stop.num} stop={stop} tall={stop.num === 14} />
              ))}
            </div>
          </div>
        )
      })}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />출발 (인천 아라서해갑문)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />도착 (부산 낙동강하구뚝)</span>
        <span className="ml-auto text-zinc-400">📱 사진 위에서 멈추면 상세 정보</span>
      </div>
    </section>
  )
}
