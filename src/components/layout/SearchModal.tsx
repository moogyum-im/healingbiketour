'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Bike, Route, FileText } from 'lucide-react'
import Link from 'next/link'
import { RENTAL_PRICES } from '@/lib/rental-prices'
import type { Tour } from '@/types'

type SearchResult = {
  type: 'tour' | 'rental' | 'page'
  title: string
  subtitle: string
  href: string
}

const STATIC_PAGES = [
  { title: '홈',         subtitle: '메인 페이지',          href: '/',        keywords: '홈 메인 힐링바이크투어 한강' },
  { title: '회사소개',   subtitle: '힐링바이크투어 소개',   href: '/about',   keywords: '회사 소개 가이드 인증서 위치 지도 연락처 대표' },
  { title: '자전거 소개',subtitle: '자전거 라인업',         href: '/bikes',   keywords: '자전거 소개 종류 브랜드 목록' },
  { title: '투어 예약',  subtitle: '전체 투어 목록',        href: '/tours',   keywords: '투어 예약 한강 라이딩 가이드 코스' },
  { title: '자전거 렌탈',subtitle: '렌탈 예약하기',         href: '/rental',  keywords: '렌탈 대여 예약 24시간 48시간 자전거' },
  { title: 'FAQ',        subtitle: '자주 묻는 질문',        href: '/faq',     keywords: '자주 묻는 질문 도움말 안내 faq' },
  { title: '공지사항',   subtitle: '힐링바이크투어 소식',   href: '/notice',  keywords: '공지 공지사항 소식 notice' },
  { title: '문의하기',   subtitle: '1:1 상담 문의',         href: '/contact', keywords: '문의 연락 상담 전화 카카오' },
]

function getResults(query: string, tours: Tour[]): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  tours.forEach(tour => {
    const text = `${tour.title} ${tour.description ?? ''} ${tour.short_description ?? ''} ${tour.category ?? ''} ${tour.difficulty ?? ''} 투어 한강`.toLowerCase()
    if (text.includes(q)) {
      results.push({
        type: 'tour',
        title: tour.title,
        subtitle: `투어 · ${tour.distance_km}km`,
        href: `/tours/${tour.slug}`,
      })
    }
  })

  RENTAL_PRICES.forEach(bike => {
    const text = `${bike.brand} ${bike.model} ${bike.material} ${bike.size} 렌탈 자전거 대여`.toLowerCase()
    if (text.includes(q)) {
      results.push({
        type: 'rental',
        title: `${bike.brand} ${bike.model}`,
        subtitle: `렌탈 · ${bike.material} · ${bike.size}`,
        href: `/rental#${bike.bikeId}`,
      })
    }
  })

  STATIC_PAGES.forEach(page => {
    const text = `${page.title} ${page.subtitle} ${page.keywords}`.toLowerCase()
    if (text.includes(q)) {
      results.push({
        type: 'page',
        title: page.title,
        subtitle: page.subtitle,
        href: page.href,
      })
    }
  })

  return results
}

const TYPE_CONFIG = {
  tour:   { label: '투어',   Icon: Route,    color: 'text-emerald-600 bg-emerald-50' },
  rental: { label: '렌탈',   Icon: Bike,     color: 'text-blue-600 bg-blue-50' },
  page:   { label: '페이지', Icon: FileText, color: 'text-zinc-500 bg-zinc-100' },
}

export default function SearchModal({
  open,
  onClose,
  tours,
}: {
  open: boolean
  onClose: () => void
  tours: Tour[]
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = getResults(query, tours)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 입력창 */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="투어, 자전거, 페이지 검색..."
            className="flex-1 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none bg-transparent"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              ESC
            </kbd>
          )}
        </div>

        {/* 검색 결과 */}
        {query.trim() ? (
          <div className="max-h-[400px] overflow-y-auto py-2">
            {results.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-zinc-400">
                &apos;{query}&apos;에 대한 검색 결과가 없습니다
              </p>
            ) : (
              results.map((item, i) => {
                const { label, Icon, color } = TYPE_CONFIG[item.type]
                return (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{item.title}</p>
                      <p className="text-xs text-zinc-400">{item.subtitle}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
                      {label}
                    </span>
                  </Link>
                )
              })
            )}
          </div>
        ) : (
          /* 빠른 이동 */
          <div className="px-4 py-5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">빠른 이동</p>
            <div className="flex flex-wrap gap-2">
              {STATIC_PAGES.map(page => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={onClose}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
