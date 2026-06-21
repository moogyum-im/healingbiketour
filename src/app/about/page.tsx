import Image from 'next/image'
import Link from 'next/link'
import { Bike, MapPin, Shield, Heart, Users, Star, Mail, KeyRound, ArrowRight } from 'lucide-react'

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
  { value: '633km', label: '국토종주 완주' },
  { value: '3개', label: '국가 공인 완주 인증' },
  { value: '그랜드슬램', label: '최고 등급 완주 달성' },
]

const certifications = [
  {
    year: '2013',
    title: '국토종주 완주 인증',
    subtitle: '633km 완주',
    desc: '인천 아라서해갑문에서 부산 낙동강 하굿둑까지, 대한민국 국토를 자전거로 종주한 공식 인증.',
    issuer: 'K-water · 행정안전부',
    color: 'emerald',
    img: '/cert-2013-national.jpeg',
  },
  {
    year: '2014',
    title: '4대강 자전거길 완주 인증',
    subtitle: '한강 · 낙동강 · 금강 · 영산강',
    desc: '대한민국 4개 주요 강줄기 자전거길을 모두 완주한 공식 인증.',
    issuer: 'K-water · 행정안전부',
    color: 'blue',
    img: '/cert-2014-river.jpeg',
  },
  {
    year: '2020',
    title: '국토종주 그랜드슬램 인증',
    subtitle: '최고 등급 달성',
    desc: '국토종주, 4대강, 동해안 등 모든 주요 국가 자전거길을 완주한 최상위 등급 공식 인증.',
    issuer: '국토교통부 · 행정안전부',
    color: 'amber',
    img: '/cert-2020-grandslam.jpeg',
  },
]

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-emerald-900 py-24 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Bike className="h-4 w-4" />
            가이드 투어 · 자전거 렌탈 서비스
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            페달을 밟을수록<br />깊어지는 대한민국의 아름다움
          </h1>
          <p className="mt-6 text-lg text-emerald-100 leading-relaxed max-w-2xl mx-auto">
            힐링바이크투어는 전문 가이드 자전거 투어와 프리미엄 자전거 렌탈 서비스를 함께 제공합니다.
            직접 달리며 검증한 코스, 정비된 고급 자전거로 대한민국의 아름다움을 안전하게 경험하세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/tours" className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-emerald-800 shadow hover:bg-emerald-50 transition-colors">
              투어 둘러보기
            </Link>
            <Link href="/rental" className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
              렌탈 예약하기
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
              <h2 className="text-3xl font-black text-zinc-900">자전거 전문가들이 만든<br />투어와 렌탈 서비스</h2>
              <div className="mt-6 space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  힐링바이크투어는 오랜 시간 대한민국의 산과 강, 해안과 도심을 달려온 자전거 전문가들이
                  그 아름다움을 더 많은 분들과 나누고 싶다는 열정으로 설립한 회사입니다.
                </p>
                <p>
                  전문 가이드가 동행하는 가이드 투어와, 검증된 고급 자전거를 직접 빌려 자유롭게 즐기는
                  렌탈 서비스 — 두 가지 방식으로 한강과 대한민국 자전거길의 아름다움을 경험할 수 있습니다.
                </p>
                <p>
                  자전거를 처음 타는 분부터 경험 많은 라이더까지, 각자의 속도와 목적에 맞게 선택하세요.
                </p>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-3xl bg-zinc-100 md:h-80">
              <Image src="/메인-사진.jpg" alt="힐링바이크투어" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">SERVICES</p>
            <h2 className="text-3xl font-black text-zinc-900">두 가지 방식으로 즐기세요</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* 가이드 투어 */}
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-emerald-600 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 mb-3">
                  <Bike className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">가이드 투어</h3>
                <p className="text-emerald-100 text-sm mt-1">전문 가이드와 함께하는 라이딩</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-2.5 text-sm text-zinc-600">
                  {['한강·아라뱃길·행주산성 코스 운영', '전문 가이드 1:1 동행', '자전거·헬멧 등 장비 일체 포함', '초보자부터 중급자까지 맞춤 코스'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/tours"
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                  투어 둘러보기 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* 자전거 렌탈 */}
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-zinc-900 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 mb-3">
                  <KeyRound className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">자전거 렌탈</h3>
                <p className="text-zinc-400 text-sm mt-1">내 페이스대로 자유롭게</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-2.5 text-sm text-zinc-600">
                  {['MTB·로드 등 10종 프리미엄 자전거', '24시간 · 48시간 · 72시간 선택', '헬멧·자물쇠·펌프·거치대 무상', '카카오페이·토스·계좌이체 결제'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/rental"
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-700 transition-colors">
                  렌탈 예약하기 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">CERTIFICATIONS</p>
            <h2 className="text-3xl font-black text-zinc-900">국가 공인 완주 인증</h2>
            <p className="mt-3 text-zinc-500 max-w-xl mx-auto">
              직접 달려보고 설계한 코스입니다. 국토교통부·행정안전부가 발급한 공식 완주 인증이 전문성을 증명합니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {certifications.map((cert) => (
              <div key={cert.year} className="rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                {/* 실제 인증서 이미지 */}
                <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                  <Image
                    src={cert.img}
                    alt={cert.title}
                    fill
                    className="object-cover object-center scale-[1.18]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-full shadow ${
                    cert.color === 'emerald' ? 'bg-emerald-500 text-white' :
                    cert.color === 'blue' ? 'bg-blue-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>{cert.year}</span>
                </div>
                {/* 텍스트 정보 */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black text-zinc-900 text-base leading-snug">{cert.title}</h3>
                  <p className={`text-xs font-bold mt-1 ${
                    cert.color === 'emerald' ? 'text-emerald-600' :
                    cert.color === 'blue' ? 'text-blue-600' :
                    'text-amber-600'
                  }`}>{cert.subtitle}</p>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed flex-1">{cert.desc}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    <span className="text-xs text-zinc-400">{cert.issuer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
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
                  <p className="mt-1 text-sm text-zinc-600">당산역 4번 출구 앞</p>
                  <p className="text-xs text-zinc-400 mt-0.5">서울특별시 영등포구 당산로50길 11</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
                <div>
                  <p className="font-bold text-zinc-900">지하철</p>
                  <p className="mt-1 text-sm text-zinc-600">2호선·9호선 당산역 4번 출구 도보 1분</p>
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
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-200 min-h-[220px]">
              {/* 커스텀 비즈니스 라벨 */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-white shadow-lg px-3 py-2 pointer-events-none">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
                  <Bike className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900 leading-none">힐링바이크투어</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">당산로50길 11 · 당산역 4번 출구</p>
                </div>
              </div>
              <iframe
                src="https://maps.google.com/maps?q=서울특별시+영등포구+당산로50길+11&output=embed&hl=ko"
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
              { label: '통신판매업신고', value: '제2026-서울영등포-1384호' },
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
                투어 예약, 자전거 렌탈 문의, 코스 상세 질문까지 언제든지 편하게 연락주세요.
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
                  <p className="font-semibold">당산역 4번 출구 앞 (서울 영등포구)</p>
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
