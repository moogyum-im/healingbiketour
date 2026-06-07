'use client'

import { Camera, Download, Play, Sparkles } from 'lucide-react'
import Link from 'next/link'

const VIDEO_ID = 'X0LkFcq9lE0'
const EMBED_SRC =
  `https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}` +
  `&controls=0&rel=0&modestbranding=1&iv_load_policy=3` +
  `&start=2&playsinline=1&disablekb=1`

export default function VideoHighlightSection() {
  return (
    <section className="relative bg-zinc-950 py-24">
      {/* Background glow — overflow clipped separately so badge can overflow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Exclusive Feature
            </div>

            <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
              Ride it.
              <br />
              Watch it.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Keep it forever.
              </span>
            </h2>

            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
              투어가 끝나도, 달리신 모든 순간은 영원히 남습니다.
              <br />
              블랙박스로 촬영된{' '}
              <strong className="text-white">전 구간 라이딩 영상</strong>을
              투어 후 제공해 드립니다.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: Camera, text: '자전거에 블랙박스 기본 장착' },
                { icon: Play,   text: '투어 종료 후 전체 루트 영상 제공' },
                { icon: Download, text: '기기에 저장하여 영구 소장 가능' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            <Link
              href="/tours"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-400 hover:scale-[1.02]"
            >
              <Play className="h-4 w-4" />
              투어 예약하기
            </Link>
          </div>

          {/* Right — Phone frame */}
          <div className="flex justify-center lg:justify-end lg:pr-16">
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-emerald-500/20 blur-2xl" />

              {/* Phone body */}
              <div className="relative w-[260px] sm:w-[290px]">
                <div className="relative overflow-hidden rounded-[3rem] border-[6px] border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/70 aspect-[9/16]">

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 h-7 w-28 rounded-b-2xl bg-zinc-950" />

                  {/* Top overlay — hides YouTube channel info shown at start/loop */}
                  <div className="pointer-events-none absolute top-0 inset-x-0 z-10 h-16 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent" />

                  {/* YouTube iframe — fills the 9:16 frame */}
                  <iframe
                    src={EMBED_SRC}
                    allow="autoplay; encrypted-media"
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 'none', pointerEvents: 'none' }}
                    title="라이딩 영상"
                  />

                  {/* Bottom gradient fade */}
                  <div className="pointer-events-none absolute bottom-0 inset-x-0 z-10 h-20 bg-gradient-to-t from-zinc-950/90 to-transparent" />

                  {/* Home indicator bar */}
                  <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 h-1 w-20 rounded-full bg-zinc-600" />
                </div>

                {/* Phone side buttons */}
                <div className="absolute -right-[7px] top-28 h-16 w-[5px] rounded-full bg-zinc-700" />
                <div className="absolute -left-[7px] top-20 h-8 w-[5px] rounded-full bg-zinc-700" />
                <div className="absolute -left-[7px] top-32 h-12 w-[5px] rounded-full bg-zinc-700" />
                <div className="absolute -left-[7px] top-48 h-12 w-[5px] rounded-full bg-zinc-700" />
              </div>

              {/* Floating badge — positioned outside phone to the right */}
              <div className="absolute -top-4 -right-28 rounded-2xl bg-emerald-500 px-4 py-3 shadow-lg shadow-emerald-500/40 z-10 whitespace-nowrap">
                <p className="text-xs font-bold text-white/80">투어 후</p>
                <p className="text-lg font-black text-white">영상 무료 발송</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
