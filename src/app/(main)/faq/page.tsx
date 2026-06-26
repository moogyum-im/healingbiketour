'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronDown, HelpCircle } from 'lucide-react'

const CATEGORIES = ['전체', '참가 조건', '준비물', '투어 안내', '예약·결제', '취소·환불', '안전·보험']

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [activeCategory, setActiveCategory] = useState('전체')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setFaqs(data ?? []))
  }, [])

  const filtered = activeCategory === '전체' ? faqs : faqs.filter(f => f.category === activeCategory)

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">자주 묻는 질문</h1>
            <p className="text-sm text-zinc-500 mt-0.5">궁금한 점을 빠르게 확인하세요</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
            해당 카테고리의 FAQ가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((faq) => (
              <div key={faq.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                >
                  <span className="font-semibold text-zinc-900 text-sm leading-relaxed pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {openId === faq.id && (
                  <div className="border-t border-zinc-100 px-6 py-4 bg-zinc-50 text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-zinc-400">
          원하는 답변을 못 찾으셨나요?{' '}
          <a href="mailto:healingbiketour@gmail.com" className="text-emerald-600 font-semibold hover:underline">
            이메일로 문의하기
          </a>
        </p>
      </div>
    </div>
  )
}
