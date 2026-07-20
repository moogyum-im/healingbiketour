import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { RENTAL_PRICES, getRentalPriceByBikeId } from '@/lib/rental-prices'
import { CheckCircle, Tag, Bike, BatteryCharging } from 'lucide-react'
import RentalWidget from './RentalWidget'
import { getLocale } from 'next-intl/server'
import { formatPrice, type Currency } from '@/utils/format'

export const metadata: Metadata = {
  title: '자전거 렌탈 | 힐링바이크투어',
  description: '로드·MTB·미니로드 고급 자전거를 합리적인 가격에 렌탈하세요. 헬멧·자물쇠·펌프 무상 제공.',
}

const LOCALE_CURRENCY: Record<string, Currency> = {
  ko: 'KRW', en: 'USD', ja: 'JPY', 'zh-CN': 'CNY', 'zh-TW': 'TWD',
}
const FX: Record<Currency, number> = {
  KRW: 1, USD: 1 / 1350, JPY: 150 / 1350, CNY: 7.2 / 1350, TWD: 32 / 1350,
}

function fmtKrw(krw: number, currency: Currency): string {
  const rate = FX[currency]
  const amount = currency === 'KRW' || currency === 'JPY'
    ? Math.round(krw * rate)
    : Math.floor(krw * rate * 100) / 100
  return formatPrice(amount, currency)
}

// ── 렌탈 가능 자전거 상세 데이터 ─────────────────────────────
const RENTAL_BIKE_DETAILS = [
  // ── 미니로드 ──────────────────────────────────────────────
  {
    bikeId: 'meridan',
    category: '미니로드',
    badgeColor: 'bg-purple-100 text-purple-700',
    brand: 'Cello', model: 'Meridan',
    tagline: '카본 미니로드, 소형 체형에 맞춤',
    description: '첼로의 27.5인치 카본 미니로드 자전거. 작은 체형에 최적화된 사이즈와 시마노 소라 변속기의 부드러운 구동감으로 편안하고 경쾌한 라이딩을 즐길 수 있습니다.',
    photo: '/bikes/meridan.png',
    specs: [
      { label: '재질', value: '카본' },
      { label: '규격', value: '27.5"' },
      { label: '변속기', value: 'Shimano Sora' },
      { label: '사용 키', value: '160 – 173 cm' },
    ],
    for: '소형 체형 · 여성 라이더 · 미니로드 선호자',
  },
  // ── MTB ───────────────────────────────────────────────────
  {
    bikeId: 'callas',
    category: 'MTB',
    badgeColor: 'bg-green-100 text-green-700',
    brand: 'Cello', model: 'Callas',
    tagline: '27.5인치 MTB, 넓은 노면 대응력',
    description: '첼로의 27.5인치 알루미늄 MTB. 시마노 XT+SLX 조합의 정교한 변속과 넓은 타이어로 비포장 구간이나 험로에서도 안정적인 주행이 가능합니다.',
    photo: '/bikes/callas.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '27.5"' },
      { label: '변속기', value: 'Shimano XT + SLX' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '중급 라이더 · 다양한 지형 코스',
  },
  {
    bikeId: 'principia',
    category: 'MTB',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    brand: 'Principia', model: 'MXC',
    tagline: '강렬한 퍼포먼스, XT+SLX 풀 셋업',
    description: '프린시피아의 26인치 알루미늄 MTB. 시마노 XT+SLX의 최상급 변속 성능으로 오르막 내리막 모두 정교하게 대응합니다.',
    photo: '/bikes/principia.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Shimano XT + SLX' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '퍼포먼스 MTB 선호자 · 산악 구간',
  },
  {
    bikeId: 'zaskar',
    category: 'MTB',
    badgeColor: 'bg-orange-100 text-orange-700',
    brand: 'GT', model: 'Zaskar',
    tagline: '트레일 본능을 깨우는 올라운더',
    description: 'GT의 시그니처 MTB 라인. 시마노 알리비오 변속기와 견고한 알루미늄 프레임으로 트레일부터 도심 라이딩까지 폭넓게 활용할 수 있습니다.',
    photo: '/bikes/zaskar.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Shimano Alivio' },
      { label: '사용 키', value: '165 – 182 cm' },
    ],
    for: '트레일 라이딩 · 다양한 체형',
  },
  {
    bikeId: 'aspen',
    category: 'MTB',
    badgeColor: 'bg-lime-100 text-lime-700',
    brand: 'Jaeger', model: 'Aspen',
    tagline: '정교한 변속, 탄탄한 내구성',
    description: '예거의 알루미늄 MTB. 시마노 XT 변속기 탑재로 정확하고 경쾌한 변속 반응을 제공하며, 장시간 라이딩에도 피로감이 낮습니다.',
    photo: '/bikes/aspen.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Shimano XT' },
      { label: '사용 키', value: '165 – 182 cm' },
    ],
    for: '중급 이상 라이더 · 장거리 MTB 투어',
  },
  {
    bikeId: 'aspen-limited',
    category: 'MTB',
    badgeColor: 'bg-rose-100 text-rose-700',
    brand: 'Jaeger', model: 'Aspen Limited',
    tagline: '캄파뇰로 탑재, 희소가치 있는 MTB',
    description: '이탈리아 명품 캄파뇰로 아테나 변속기를 탑재한 리미티드 에디션. 독보적인 변속 질감과 레트로한 감성을 동시에 즐길 수 있는 특별한 자전거입니다.',
    photo: '/bikes/aspen-limited.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Campagnolo Athena' },
      { label: '사용 키', value: '170 – 180 cm' },
    ],
    for: '고급 부품 선호자 · 특별한 라이딩 경험',
  },
  // ── 로드 ──────────────────────────────────────────────────
  {
    bikeId: 'tcr6500',
    category: '로드',
    badgeColor: 'bg-blue-100 text-blue-700',
    brand: 'Giant', model: 'TCR 6500',
    tagline: '가볍고 반응성 좋은 알루미늄 로드',
    description: '자이언트의 클래식 알루미늄 로드 바이크. 시마노 티아그라 변속기와 700c 휠로 도심 라이딩부터 중거리 코스까지 안정적으로 소화합니다.',
    photo: '/bikes/tcr6500.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano Tiagra' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '로드 입문자 · 도심 라이딩 · 한강 코스',
  },
  {
    bikeId: 'yukon',
    category: '로드',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    brand: 'Infiza', model: 'Yukon',
    tagline: '카본 프레임의 가벼움과 시마노 105의 정확함',
    description: '카본 프레임으로 경량성을 극대화한 퍼포먼스 로드. 시마노 105 그룹셋의 정밀한 변속과 뛰어난 반응성으로 더욱 역동적인 라이딩을 제공합니다.',
    photo: '/bikes/infiza.png',
    specs: [
      { label: '재질', value: '카본' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano 105' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '경험자 · 퍼포먼스 라이딩 선호자',
  },
  {
    bikeId: 'cayin',
    category: '로드',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    brand: 'Cello', model: 'Cayin',
    tagline: '카본의 승차감, 합리적인 선택',
    description: '첼로의 카본 로드 바이크. 시마노 티아그라의 안정적인 변속 성능과 카본 프레임 특유의 부드러운 승차감으로 긴 거리도 편하게 달릴 수 있습니다.',
    photo: '/bikes/cayin.png',
    specs: [
      { label: '재질', value: '카본' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano Tiagra' },
      { label: '사용 키', value: '문의 시 안내' },
    ],
    for: '중급 라이더 · 장거리 코스',
  },
  {
    bikeId: 'bianchi1885',
    category: '로드',
    badgeColor: 'bg-teal-100 text-teal-700',
    brand: 'Bianchi', model: '1885',
    tagline: '세계적인 명품 브랜드의 클래식',
    description: '1885년 창업한 이탈리아 명품 브랜드 비앙키의 알루미늄 로드. 깔끔한 라인과 시마노 티아그라의 조합으로 스타일과 성능을 동시에 만족합니다.',
    photo: '/bikes/1885.png',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano Tiagra' },
      { label: '사용 키', value: '170 – 180 cm' },
    ],
    for: '스타일 중시 라이더 · 사진 찍기 좋은 투어',
  },
  // ── 전기 자전거 ──────────────────────────────────────────
  {
    bikeId: 'tx8-pro',
    category: '전기 자전거',
    badgeColor: 'bg-zinc-200 text-zinc-700',
    brand: '모토벨로', model: 'TX8 PRO',
    tagline: '20인치 폴딩, 도심 전기자전거의 기준',
    description: '모토벨로의 인기 폴딩 전기자전거. 알루미늄 폴딩 프레임으로 접으면 간편하게 보관·이동 가능하며, 36V•350W 허브모터로 가볍고 조용하게 달립니다.',
    photo: '/bikes/tx8-pro.png',
    specs: [
      { label: '프레임', value: '알루미늄 폴딩' },
      { label: '규격', value: '20"' },
      { label: '배터리', value: '36V 20Ah 리튬이온' },
      { label: '모터', value: '350W 허브모터' },
      { label: '주행거리', value: '최대 60km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '도심 이동 · 폴딩 선호자 · 가벼운 한강 라이딩',
  },
  {
    bikeId: 'tx8-pro3',
    category: '전기 자전거',
    badgeColor: 'bg-zinc-200 text-zinc-700',
    brand: '모토벨로', model: 'TX8 PRO3',
    tagline: '팻타이어 폴딩, 어떤 노면도 흔들림 없이',
    description: '모토벨로 TX8 시리즈의 팻타이어 버전. 20×4.0인치 광폭 타이어가 자갈길·비포장도로에서도 진동을 줄여주며, 48V•500W 강력한 모터로 오르막도 거뜬합니다.',
    photo: '/bikes/tx8-pro3.png',
    specs: [
      { label: '프레임', value: '알루미늄 폴딩' },
      { label: '규격', value: '20" × 4.0" 팻타이어' },
      { label: '배터리', value: '48V 15Ah 리튬이온' },
      { label: '모터', value: '500W 허브모터' },
      { label: '주행거리', value: '최대 60km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '비포장 구간 · 안정감 선호자 · 폴딩 전기자전거',
  },
  {
    bikeId: 'tn8-pro',
    category: '전기 자전거',
    badgeColor: 'bg-zinc-200 text-zinc-700',
    brand: '모토벨로', model: 'TN8 PRO',
    tagline: '대용량 배터리, 최상급 주행 성능',
    description: '모토벨로의 프리미엄 전기자전거. 48V•500W 고출력 모터와 20Ah 대용량 배터리를 탑재해 오르막과 장거리 주행 모두 여유롭게 소화합니다.',
    photo: null,
    specs: [
      { label: '규격', value: '20"' },
      { label: '배터리', value: '48V 20Ah 리튬이온' },
      { label: '모터', value: '500W 허브모터' },
      { label: '주행거리', value: '최대 80km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '장거리 라이딩 · 오르막 구간 · 고출력 선호자',
  },
  {
    bikeId: 'viaggio-v6',
    category: '전기 자전거',
    badgeColor: 'bg-amber-100 text-amber-700',
    brand: 'AU테크', model: '비아지오 V6',
    tagline: '20Ah 대용량, 완충 시 최대 160km 주행',
    description: 'AU테크의 프리미엄 전기 자전거. 20Ah 대용량 리튬이온 배터리와 BMS 보호 시스템을 탑재하여 장거리 안심 라이딩이 가능합니다. 앞뒤 이중 서스펜션으로 승차감도 뛰어납니다.',
    photo: '/bikes/v6.png',
    specs: [
      { label: '규격', value: '20"' },
      { label: '배터리', value: '48V 20Ah 리튬이온 (BMS)' },
      { label: '모터', value: '500W 허브모터' },
      { label: '주행거리', value: '최대 160km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
      { label: '서스펜션', value: '앞바퀴 + 안장 이중 서스펜션' },
    ],
    for: '체력 걱정되시는 분 · 어르신 · 장거리 안심 라이딩',
  },
  {
    bikeId: 'e-volt',
    category: '전기 자전거',
    badgeColor: 'bg-sky-100 text-sky-700',
    brand: '스마트', model: 'e-volt',
    tagline: '16인치 소형, 가볍고 편리한 생활 전기자전거',
    description: '스마트의 소형 전기자전거. 16인치 컴팩트한 바디로 수납과 이동이 간편하며, 48V•350W 모터로 도심 주행에 충분한 주행 성능을 제공합니다.',
    photo: null,
    specs: [
      { label: '규격', value: '16"' },
      { label: '배터리', value: '48V 7.5Ah 리튬이온' },
      { label: '모터', value: '350W 허브모터' },
      { label: '주행거리', value: '최대 35km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '소형 체형 · 도심 생활 이동 · 보관 공간 적은 분',
  },
  {
    bikeId: 'q-tour',
    category: '전기 자전거',
    badgeColor: 'bg-violet-100 text-violet-700',
    brand: 'quali', model: 'q-tour',
    tagline: '투어링 특화, 500W 출력의 안정적인 주행',
    description: '콸리의 투어링 전기자전거. 48V•500W 모터와 15Ah 배터리로 투어링에 최적화되어 있으며, 안정적인 주행 감각으로 장거리도 편안하게 달릴 수 있습니다.',
    photo: null,
    specs: [
      { label: '규격', value: '20"' },
      { label: '배터리', value: '48V 15Ah 리튬이온' },
      { label: '모터', value: '500W 허브모터' },
      { label: '주행거리', value: '최대 70km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '투어링 라이딩 · 중장거리 코스 · 안정감 선호자',
  },
  {
    bikeId: 'q-max',
    category: '전기 자전거',
    badgeColor: 'bg-violet-100 text-violet-700',
    brand: 'quali', model: 'q-max',
    tagline: '최대 출력·최대 용량, 콸리 플래그십',
    description: '콸리의 최상위 전기자전거. 48V•500W 모터와 20Ah 대용량 배터리 조합으로 오르막과 장거리 모두 여유롭게 대응하는 플래그십 모델입니다.',
    photo: null,
    specs: [
      { label: '규격', value: '20"' },
      { label: '배터리', value: '48V 20Ah 리튬이온' },
      { label: '모터', value: '500W 허브모터' },
      { label: '주행거리', value: '최대 90km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '장거리 투어 · 오르막 구간 · 고급 전기자전거 선호자',
  },
  {
    bikeId: 'j2-aeul-pro',
    category: '전기 자전거',
    badgeColor: 'bg-rose-100 text-rose-700',
    brand: 'j2 sport', model: '애울 프로',
    tagline: '가볍고 민첩한 도심형 전기자전거',
    description: 'j2 sport의 도심형 전기자전거. 36V•350W 모터와 15Ah 배터리로 경쾌한 주행 감각을 제공하며, 20인치 바퀴로 도심 곳곳을 부담 없이 누빌 수 있습니다.',
    photo: null,
    specs: [
      { label: '규격', value: '20"' },
      { label: '배터리', value: '36V 15Ah 리튬이온' },
      { label: '모터', value: '350W 허브모터' },
      { label: '주행거리', value: '최대 50km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
    ],
    for: '도심 이동 · 라이트한 라이딩 · 입문자',
  },
]

const INCLUDES = ['헬멧', '자물쇠', '펌프', '거치대']

export default async function RentalPage({
  searchParams,
}: {
  searchParams: Promise<{ bike?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { bike: initialBikeId } = await searchParams
  const locale = await getLocale()
  const currency = LOCALE_CURRENCY[locale] ?? 'KRW'

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-zinc-950 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Bike Rental</p>
        <h1 className="text-4xl font-black text-white sm:text-5xl">자전거 렌탈</h1>
        <p className="mt-3 text-zinc-400 max-w-lg mx-auto leading-relaxed">
          고급 자전거를 원하는 기간만큼 렌탈하세요.<br />
          <span className="text-emerald-400 font-semibold">헬멧 · 자물쇠 · 펌프 · 거치대</span> 무상 제공
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── 좌측: 자전거 목록 ────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* 무상 제공 배너 */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-sm font-bold text-emerald-700 shrink-0">무상 제공 포함</p>
              {INCLUDES.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-zinc-600 font-semibold">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> {item}
                </span>
              ))}
            </div>

            {/* 자전거 카드 목록 */}
            {RENTAL_BIKE_DETAILS.map((bike) => {
              const rental = getRentalPriceByBikeId(bike.bikeId)!
              return (
                <div
                  id={bike.bikeId}
                  key={bike.bikeId}
                  className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* 사진 */}
                    <div className="relative h-64 md:h-auto min-h-[280px] bg-white">
                      {bike.photo ? (
                        <Image
                          src={bike.photo}
                          alt={`${bike.brand} ${bike.model}`}
                          fill
                          className="object-contain mix-blend-multiply p-6"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
                          <Bike className="h-16 w-16 text-zinc-200" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${bike.badgeColor}`}>
                          {bike.category}
                        </span>
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="flex flex-col justify-between p-7">
                      <div>
                        <h2 className="text-2xl font-black text-zinc-900">{bike.model}</h2>
                        <p className="text-sm font-semibold text-zinc-400 mt-0.5">{bike.brand}</p>
                        <p className="mt-2 text-base font-bold text-emerald-600">{bike.tagline}</p>
                        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{bike.description}</p>
                        <p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">이런 분께 추천</p>
                        <p className="mt-1 text-sm text-zinc-600">{bike.for}</p>

                        {/* 스펙 */}
                        <div className="mt-5 rounded-xl border border-zinc-200 overflow-hidden">
                          {bike.specs.map(({ label, value }, i) => (
                            <div
                              key={label}
                              className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
                            >
                              <span className="font-semibold text-zinc-500">{label}</span>
                              <span className="font-bold text-zinc-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 렌탈 단가 */}
                      <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2">
                          <Tag className="h-3.5 w-3.5" />
                          렌탈 단가 (1대 기준)
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-white border border-zinc-200 py-2">
                            <p className="text-[10px] text-zinc-400 font-medium">24시간</p>
                            <p className="text-sm font-black text-zinc-800">
                              {fmtKrw(rental.h24, currency)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white border border-zinc-200 py-2">
                            <p className="text-[10px] text-zinc-400 font-medium">48시간</p>
                            <p className="text-sm font-black text-zinc-800">
                              {fmtKrw(rental.h48, currency)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-2">
                            <p className="text-[10px] text-emerald-600 font-medium">72시간</p>
                            <p className="text-sm font-black text-emerald-700">
                              {fmtKrw(rental.h72, currency)}
                            </p>
                          </div>
                        </div>
                        {rental.isEbike && rental.extraBattery > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
                            <BatteryCharging className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <p className="text-[11px] font-semibold text-amber-700">
                              추가 배터리 옵션 +{fmtKrw(rental.extraBattery, currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── 우측: 예약 위젯 (스티키, 독립 스크롤) ──────────── */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent pr-1">
              <RentalWidget
                isLoggedIn={!!user}
                initialBikeId={initialBikeId}
                userInfo={user ? {
                  name: ((user.user_metadata?.full_name || user.user_metadata?.name) ?? '') as string,
                  email: user.email ?? '',
                  phone: ((user.user_metadata?.phone || user.user_metadata?.phone_number) ?? '') as string,
                } : undefined}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
