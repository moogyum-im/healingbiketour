'use client'

import { useState } from 'react'
import { MessageSquare, Phone, Mail, CheckCircle, Send, Clock } from 'lucide-react'
import Link from 'next/link'
import { submitContactInquiry } from '@/lib/actions/contact'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim()) return
    setLoading(true)
    setError('')

    const result = await submitContactInquiry({
      name: form.name || undefined,
      phone: form.phone || undefined,
      message: form.message,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  const inputCls = 'w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-colors'

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">문의가 접수되었습니다</h2>
          <p className="text-zinc-500 mb-2">
            빠른 시일 내에 이메일 또는 전화로 연락드리겠습니다.
          </p>
          <p className="text-sm text-zinc-400 mb-8">
            영업시간: 평일 10:00 – 18:00 (주말·공휴일 휴무)
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
              홈으로
            </Link>
            <Link href="/faq" className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors">
              FAQ 보기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 mb-5">
            <MessageSquare className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900">1:1 상담 신청</h1>
          <p className="mt-3 text-zinc-500 text-lg">
            궁금한 점이 있으시면 편하게 남겨주세요.<br />
            빠르게 답변드리겠습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact info — left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
              <h2 className="font-bold text-zinc-900">바로 연락하기</h2>

              <a
                href="tel:010-0000-0000"
                className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">전화 상담</p>
                  <p className="font-bold text-zinc-900 group-hover:text-emerald-700">010-0000-0000</p>
                </div>
              </a>

              <a
                href="mailto:healingbiketour@gmail.com"
                className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">이메일</p>
                  <p className="font-bold text-zinc-900 group-hover:text-emerald-700 text-sm break-all">
                    healingbiketour@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="https://open.kakao.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-yellow-100 bg-yellow-50 p-4 hover:border-yellow-300 hover:bg-yellow-100 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-300 text-yellow-900">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 3C6.477 3 2 6.477 2 11c0 2.897 1.659 5.453 4.193 7.003L5 21l3.5-1.75C9.573 19.735 10.77 20 12 20c5.523 0 10-3.477 10-9S17.523 3 12 3z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-yellow-700 mb-0.5">카카오톡 오픈채팅</p>
                  <p className="font-bold text-yellow-900 group-hover:text-yellow-800">힐링바이크투어</p>
                </div>
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-zinc-400" />
                <h2 className="font-bold text-zinc-900 text-sm">운영 시간</h2>
              </div>
              <div className="space-y-1.5 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>평일</span>
                  <span className="font-semibold">10:00 – 18:00</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>주말·공휴일</span>
                  <span>휴무</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                온라인 문의는 24시간 접수 가능하며, 영업일 기준 1일 이내 답변드립니다.
              </p>
            </div>
          </div>

          {/* Form — right */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-5">
              <h2 className="font-bold text-zinc-900 text-lg">문의 내용 작성</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">이름</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">연락처</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className={inputCls}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={7}
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  placeholder="투어 일정, 자전거 종류, 단체 예약 등 궁금한 점을 자유롭게 적어주세요."
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !form.message.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="animate-pulse">전송 중...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    문의 접수하기
                  </>
                )}
              </button>

              <p className="text-xs text-center text-zinc-400">
                문의 내용은 서비스 개선 목적으로만 사용됩니다.{' '}
                <Link href="/policy/privacy" className="underline hover:text-zinc-600">개인정보처리방침</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-semibold text-zinc-500 mb-4">빠른 답변이 필요하신가요?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/faq" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-emerald-300 transition-colors">
              자주 묻는 질문 보기
            </Link>
            <Link href="/notice" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-emerald-300 transition-colors">
              공지사항 확인
            </Link>
            <Link href="/tours" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-emerald-300 transition-colors">
              투어 목록 보기
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
