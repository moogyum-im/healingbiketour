'use client'

import { useActionState } from 'react'
import { submitGuideApplication } from '@/lib/actions/guide'
import { Bike, Globe, Award, CheckCircle2, Users, MapPin } from 'lucide-react'

const highlights = [
  {
    icon: Globe,
    title: '영어 안내 가능',
    desc: '영어로 투어 안내가 가능한 가이드를 우대합니다. 외국인 참가자를 대상으로 한 프리미엄 투어를 함께 운영할 수 있습니다.',
  },
  {
    icon: Award,
    title: '국토종주 인증 보유자',
    desc: '국토종주 인증(한강, 낙동강, 금강, 섬진강, 새재 등)을 보유한 자전거 전문가를 환영합니다.',
  },
  {
    icon: Bike,
    title: '자전거 투어 전문가',
    desc: '자전거 투어 운영 경험이 있거나, 라이딩 관련 자격증·이수증을 보유하신 분을 우대합니다.',
  },
  {
    icon: Users,
    title: '소통·안전 중시',
    desc: '참가자의 안전을 최우선으로 생각하며 즐거운 투어 분위기를 만들어 갈 수 있는 분을 찾습니다.',
  },
]

const benefits = [
  '유연한 시간 조정 가능 (파트타임·프리랜서 형태)',
  '자전거 투어 전문 가이드로서의 경력 구축',
  '전문 교육 및 코스 사전 답사 지원',
  '향후 정규직 전환 검토',
  '투어 수수료 + 성과 인센티브',
]

export default function GuideApplyPage() {
  const [state, action, pending] = useActionState(submitGuideApplication, null)

  if (state?.success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900">지원서 접수 완료!</h2>
          <p className="mt-3 text-zinc-500 leading-relaxed">
            가이드 지원서가 성공적으로 접수되었습니다.<br />
            검토 후 7일 이내 이메일로 연락드리겠습니다.
          </p>
          <a href="/" className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-emerald-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            <Bike className="h-4 w-4" />
            힐링바이크투어 가이드 모집
          </div>
          <h1 className="text-4xl font-black sm:text-5xl">
            자전거로 대한민국을<br />함께 누빌 가이드를 찾습니다
          </h1>
          <p className="mt-5 text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            국토종주 인증 보유자, 영어 안내 가능자, 자전거 투어 전문가 — 대한민국의 아름다운 자연을
            참가자들과 함께 나눌 열정 있는 분들의 지원을 환영합니다.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 text-center">이런 분을 찾습니다</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <h.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-zinc-900">{h.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 text-center">가이드 혜택</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm max-w-xl mx-auto">
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-700">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <MapPin className="h-4 w-4" />
                근무 지역
              </div>
              서울 및 수도권 위주 운영 (향후 전국 확대 예정)
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-black text-zinc-900 mb-2 text-center">가이드 지원서</h2>
          <p className="text-center text-zinc-500 text-sm mb-8">검토 후 7일 이내 이메일로 연락드립니다.</p>

          <form action={action} className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
            {state?.error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">이름 *</label>
                <input name="name" required className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">이메일 *</label>
                <input name="email" type="email" required className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">연락처 *</label>
              <input name="phone" type="tel" required placeholder="010-0000-0000" className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">영어 가능 수준</label>
              <select name="english_level" className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none bg-white">
                <option value="">선택 안 함</option>
                <option value="none">영어 불가</option>
                <option value="basic">기초 (간단한 회화 가능)</option>
                <option value="intermediate">중급 (투어 안내 가능)</option>
                <option value="advanced">고급 (원활한 소통 가능)</option>
                <option value="native">원어민 수준</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">보유 인증·자격</label>
              <input name="certifications" placeholder="예: 국토종주 인증(한강, 낙동강), 자전거 지도자 자격증 등" className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">자전거 관련 경력</label>
              <textarea
                name="experience"
                rows={3}
                placeholder="자전거 투어 운영 경험, 라이딩 경력 등을 자유롭게 작성해주세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">지원 동기</label>
              <textarea
                name="motivation"
                rows={4}
                placeholder="힐링바이크투어 가이드에 지원하는 이유를 작성해주세요."
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {pending ? '제출 중...' : '지원서 제출하기'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
