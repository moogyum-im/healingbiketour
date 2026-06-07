import Image from 'next/image'
import Link from 'next/link'
import { Bike, MapPin, Shield, Heart, Users, Star, Mail } from 'lucide-react'

export const metadata = { title: '회사 소개 | 힐링바이크투어' }

const values = [
  {
    icon: Heart,
    title: '안전 최우선',
    desc: '출발 전 전 장비 안전 점검, 전문 가이드 동행으로 안심하고 즐길 수 있는 투어를 제공합니다.',
  },
  {
    icon: MapPin,
    title: '전국 각지의 전문가',
    desc: '각 코스를 수백 번 달린 전문 가이드가 숨겨진 명소와 현지만 아는 이야기를 함께 나눕니다.',
  },
  {
    icon: Shield,
    title: '책임감 있는 운영',
    desc: '개인 맞춤 서비스, 소규모 그룹 운영으로 한 분 한 분께 집중하는 투어를 운영합니다.',
  },
  {
    icon: Star,
    title: '잊지 못할 경험',
    desc: '단순한 이동을 넘어 대한민국의 자연과 문화를 온몸으로 느끼는 특별한 시간을 만들어 드립니다.',
  },
]

const stats = [
  { value: '전문', label: '가이드 동행' },
  { value: '소규모', label: '그룹 운영' },
  { value: '완비', label: '안전 장비' },
  { value: '확장 중', label: '전국 코스' },
]

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-emerald-900 py-24 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Bike className="h-4 w-4" />
            자전거 전문 가이드 투어 서비스
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            페달을 밟을수록<br />깊어지는 대한민국의 아름다움
          </h1>
          <p className="mt-6 text-lg text-emerald-100 leading-relaxed max-w-2xl mx-auto">
            힐링바이크투어는 자전거를 가장 잘 아는 전문가들이 대한민국 곳곳의 아름다운 자연과 문화를
            더 많은 분들과 나누기 위해 만든 프리미엄 가이드 투어 서비스입니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/tours" className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-emerald-800 shadow hover:bg-emerald-50 transition-colors">
              투어 둘러보기
            </Link>
            <Link href="/booking" className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
              바로 예약하기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-100 bg-zinc-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-emerald-600">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">OUR STORY</p>
              <h2 className="text-3xl font-black text-zinc-900">자전거 전문가들이 만든<br />대한민국 라이딩 투어</h2>
              <div className="mt-6 space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  힐링바이크투어는 오랜 시간 대한민국의 산과 강, 해안과 도심을 달려온 자전거 전문가들이
                  그 아름다움을 더 많은 분들과 나누고 싶다는 열정으로 설립한 투어 회사입니다.
                </p>
                <p>
                  자전거를 처음 타는 분부터 경험 많은 라이더까지, 각자의 속도와 목적에 맞게 설계된 코스를 통해
                  누구나 안전하고 즐겁게 대한민국의 아름다운 풍경 속을 달릴 수 있습니다.
                </p>
                <p>
                  서울에서 시작해 전국으로 뻗어가는 힐링바이크투어와 함께, 자전거 위에서 만나는 새로운 대한민국을 경험해보세요.
                </p>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-3xl bg-zinc-100 md:h-80">
              <Image src="/메인-사진.jpg" alt="힐링바이크투어" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">OUR VALUES</p>
            <h2 className="text-3xl font-black text-zinc-900">저희가 지키는 약속</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{v.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">ACCESS</p>
            <h2 className="text-3xl font-black text-zinc-900">오시는 길</h2>
            <p className="mt-3 text-zinc-500">투어 집합 장소 안내</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">집합 장소</p>
                  <p className="mt-1 text-sm text-zinc-600">당산역 2번 출구 앞</p>
                  <p className="text-xs text-zinc-400 mt-0.5">서울특별시 영등포구 당산로50길 11</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
                <div>
                  <p className="font-bold text-zinc-900">지하철</p>
                  <p className="mt-1 text-sm text-zinc-600">2호선·9호선 당산역 2번 출구 도보 1분</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <div>
                  <p className="font-bold text-zinc-900">버스</p>
                  <p className="mt-1 text-sm text-zinc-600">당산역 정류장 하차</p>
                  <p className="text-xs text-zinc-400 mt-0.5">6623, 5623, 605, 600번 등</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-200 flex items-center justify-center min-h-[220px]">
              <iframe
                src="https://maps.google.com/maps?q=서울특별시+영등포구+당산역+2번출구&output=embed"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                title="오시는 길"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">COMPANY INFO</p>
            <h2 className="text-3xl font-black text-zinc-900">회사 정보</h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            {[
              { label: '상호', value: '주식회사 힐링바이크투어' },
              { label: '대표자', value: '이상호' },
              { label: '사업자등록번호', value: '860-86-04061' },
              { label: '사업장 소재지', value: '서울특별시 영등포구 당산로50길 11, 102호(당산동6가, 당산빌)' },
              { label: '개업일', value: '2026년 05월 01일' },
              { label: '업태', value: '사업시설 관리, 사업지원 및 임대 서비스업' },
              { label: '종목', value: '여행사업, 스포츠 및 레크리에이션 용품 임대업' },
              { label: '이메일', value: 'healingbiketour@gmail.com' },
            ].map(({ label, value }, i) => (
              <div key={label} className={`flex gap-6 px-6 py-4 ${i % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}`}>
                <span className="w-36 shrink-0 text-sm font-semibold text-zinc-500">{label}</span>
                <span className="text-sm text-zinc-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-emerald-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">CONTACT</p>
              <h2 className="text-3xl font-black">궁금한 점이 있으신가요?</h2>
              <p className="mt-4 text-emerald-100 leading-relaxed">
                투어 예약부터 코스 상세 문의까지, 언제든지 편하게 연락주세요.
                실시간 채팅 상담도 가능합니다.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">이메일</p>
                  <p className="font-semibold">healingbiketour@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">집합 장소</p>
                  <p className="font-semibold">당산역 2번 출구 앞 (서울 영등포구)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">운영 방식</p>
                  <p className="font-semibold">소규모 그룹 · 전문 가이드 동행</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
