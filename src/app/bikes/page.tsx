import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Zap, Mountain, Bike, Wind, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import { RENTAL_PRICES, type BikeRentalPrice } from '@/lib/rental-prices'

export const metadata: Metadata = {
  title: '자전거 소개',
  description: '힐링바이크투어의 프리미엄 자전거 라인업을 소개합니다.',
}

type BikeSpec = { label: string; value: string }

interface BikeData {
  id: string
  brand: string
  model: string
  tagline: string
  description: string
  photo: string | null
  color: string
  badgeColor: string
  specs: BikeSpec[]
  for: string
  category?: string
}

const FMT = new Intl.NumberFormat('ko-KR')

function RentalPriceBadge({ rental }: { rental: BikeRentalPrice }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2">
        <Tag className="h-3.5 w-3.5" />
        렌탈 단가 (1대 / 1일)
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white border border-zinc-200 py-1.5">
          <p className="text-[10px] text-zinc-400 font-medium">24시간 / 1일</p>
          <p className="text-sm font-black text-zinc-800">{FMT.format(rental.day12)}<span className="text-[10px] font-semibold text-zinc-400">원</span></p>
        </div>
        <div className="rounded-lg bg-white border border-zinc-200 py-1.5">
          <p className="text-[10px] text-zinc-400 font-medium">48시간 / 2일</p>
          <p className="text-sm font-black text-zinc-800">{FMT.format(rental.day12)}<span className="text-[10px] font-semibold text-zinc-400">원</span></p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-1.5">
          <p className="text-[10px] text-emerald-600 font-medium">72시간 / 3일</p>
          <p className="text-sm font-black text-emerald-700">{FMT.format(rental.day34)}<span className="text-[10px] font-semibold text-emerald-500">원</span></p>
        </div>
      </div>
    </div>
  )
}

const ROAD_BIKES: BikeData[] = [
  {
    id: 'tcr6500',
    brand: 'Giant',
    model: 'TCR 6500',
    tagline: '가볍고 반응성 좋은 알루미늄 로드',
    description: '자이언트의 클래식 알루미늄 로드 바이크. 시마노 티아그라 변속기와 700c 휠로 도심 라이딩부터 중거리 코스까지 안정적으로 소화합니다.',
    photo: '/bikes/tcr6500.png',
    color: 'from-blue-600/10 to-transparent',
    badgeColor: 'bg-blue-100 text-blue-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano Tiagra' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '로드 입문자 · 도심 라이딩 · 한강 코스',
  },
  {
    id: 'yukon',
    brand: 'Infiza',
    model: 'Yukon',
    tagline: '카본 프레임의 가벼움과 시마노 105의 정확함',
    description: '카본 프레임으로 경량성을 극대화한 퍼포먼스 로드. 시마노 105 그룹셋의 정밀한 변속과 뛰어난 반응성으로 더욱 역동적인 라이딩을 제공합니다.',
    photo: '/bikes/infiza.png',
    color: 'from-indigo-500/10 to-transparent',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    specs: [
      { label: '재질', value: '카본' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano 105' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '경험자 · 퍼포먼스 라이딩 선호자',
  },
  {
    id: 'cayin',
    brand: 'Cello',
    model: 'Cayin',
    tagline: '카본의 승차감, 합리적인 선택',
    description: '첼로의 카본 로드 바이크. 시마노 티아그라의 안정적인 변속 성능과 카본 프레임 특유의 부드러운 승차감으로 긴 거리도 편하게 달릴 수 있습니다.',
    photo: '/bikes/cayin.png',
    color: 'from-cyan-500/10 to-transparent',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    specs: [
      { label: '재질', value: '카본' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano Tiagra' },
      { label: '사용 키', value: '문의 시 안내' },
    ],
    for: '중급 라이더 · 장거리 코스',
  },
  {
    id: 'bianchi1885',
    brand: 'Bianchi',
    model: '1885',
    tagline: '세계적인 명품 브랜드의 클래식',
    description: '1885년 창업한 이탈리아 명품 브랜드 비앙키의 알루미늄 로드. 깔끔한 라인과 시마노 티아그라의 조합으로 스타일과 성능을 동시에 만족합니다.',
    photo: '/bikes/1885.png',
    color: 'from-teal-500/10 to-transparent',
    badgeColor: 'bg-teal-100 text-teal-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '700c' },
      { label: '변속기', value: 'Shimano Tiagra' },
      { label: '사용 키', value: '170 – 180 cm' },
    ],
    for: '스타일 중시 라이더 · 사진 찍기 좋은 투어',
  },
]

const MTB_BIKES: BikeData[] = [
  {
    id: 'callas',
    brand: 'Cello',
    model: 'Callas',
    tagline: '27.5인치 MTB, 넓은 노면 대응력',
    description: '첼로의 27.5인치 알루미늄 MTB. 시마노 XT+SLX 조합의 정교한 변속과 넓은 타이어로 비포장 구간이나 험로에서도 안정적인 주행이 가능합니다.',
    photo: '/bikes/callas.png',
    color: 'from-green-500/10 to-transparent',
    badgeColor: 'bg-green-100 text-green-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '27.5"' },
      { label: '변속기', value: 'Shimano XT + SLX' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '중급 라이더 · 다양한 지형 코스',
  },
  {
    id: 'principia',
    brand: 'Principia',
    model: 'MXC',
    tagline: '강렬한 퍼포먼스, XT+SLX 풀 셋업',
    description: '프린시피아의 26인치 알루미늄 MTB. 시마노 XT+SLX의 최상급 변속 성능으로 오르막 내리막 모두 정교하게 대응합니다.',
    photo: '/bikes/principia.png',
    color: 'from-emerald-500/10 to-transparent',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Shimano XT + SLX' },
      { label: '사용 키', value: '165 – 180 cm' },
    ],
    for: '퍼포먼스 MTB 선호자 · 산악 구간',
  },
  {
    id: 'zaskar',
    brand: 'GT',
    model: 'Zaskar',
    tagline: '트레일 본능을 깨우는 올라운더',
    description: 'GT의 시그니처 MTB 라인. 시마노 알리비오 변속기와 견고한 알루미늄 프레임으로 트레일부터 도심 라이딩까지 폭넓게 활용할 수 있는 올라운더입니다.',
    photo: '/bikes/zaskar.png',
    color: 'from-orange-500/10 to-transparent',
    badgeColor: 'bg-orange-100 text-orange-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Shimano Alivio' },
      { label: '사용 키', value: '165 – 182 cm' },
    ],
    for: '트레일 라이딩 · 다양한 체형',
  },
  {
    id: 'aspen',
    brand: 'Jaeger',
    model: 'Aspen',
    tagline: '정교한 변속, 탄탄한 내구성',
    description: '예거의 알루미늄 MTB. 시마노 XT 변속기 탑재로 정확하고 경쾌한 변속 반응을 제공하며, 장시간 라이딩에도 피로감이 낮습니다.',
    photo: '/bikes/aspen.png',
    color: 'from-lime-500/10 to-transparent',
    badgeColor: 'bg-lime-100 text-lime-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Shimano XT' },
      { label: '사용 키', value: '165 – 182 cm' },
    ],
    for: '중급 이상 라이더 · 장거리 MTB 투어',
  },
  {
    id: 'aspen-limited',
    brand: 'Jaeger',
    model: 'Aspen Limited',
    tagline: '캄파뇰로 탑재, 희소가치 있는 MTB',
    description: '이탈리아 명품 캄파뇰로 아테나 변속기를 탑재한 리미티드 에디션. 독보적인 변속 질감과 레트로한 감성을 동시에 즐길 수 있는 특별한 자전거입니다.',
    photo: '/bikes/aspen-limited.png',
    color: 'from-rose-500/10 to-transparent',
    badgeColor: 'bg-rose-100 text-rose-700',
    specs: [
      { label: '재질', value: '알루미늄' },
      { label: '규격', value: '26"' },
      { label: '변속기', value: 'Campagnolo Athena' },
      { label: '사용 키', value: '170 – 180 cm' },
    ],
    for: '고급 부품 선호자 · 특별한 라이딩 경험',
  },
]

const MINIROAD_BIKES: BikeData[] = [
  {
    id: 'meridan',
    brand: 'Cello',
    model: 'Meridan',
    tagline: '카본 미니로드, 소형 체형에 맞춤',
    description: '첼로의 27.5인치 카본 미니로드 자전거. 작은 체형에 최적화된 사이즈와 시마노 소라 변속기의 부드러운 구동감으로 편안하고 경쾌한 라이딩을 즐길 수 있습니다.',
    photo: '/bikes/meridan.png',
    color: 'from-purple-500/10 to-transparent',
    badgeColor: 'bg-purple-100 text-purple-700',
    specs: [
      { label: '재질', value: '카본' },
      { label: '규격', value: '27.5"' },
      { label: '변속기', value: 'Shimano Sora' },
      { label: '사용 키', value: '160 – 173 cm' },
    ],
    for: '소형 체형 · 여성 라이더 · 미니로드 선호자',
  },
]

const EBIKE_BIKES: BikeData[] = [
  {
    id: 'tx8-pro',
    brand: '모토벨로',
    model: 'TX8 PRO',
    tagline: '20인치 폴딩, 도심 전기자전거의 기준',
    description: '모토벨로의 인기 폴딩 전기자전거. 알루미늄 폴딩 프레임으로 접으면 간편하게 보관·이동 가능합니다. 시마노 7단 변속기와 250W 허브모터 조합으로 언덕도 가볍게 오르며, 한번 충전으로 최대 60km 주행 가능합니다.',
    photo: '/bikes/tx8-pro.png',
    color: 'from-zinc-500/10 to-transparent',
    badgeColor: 'bg-zinc-200 text-zinc-700',
    specs: [
      { label: '프레임', value: '알루미늄 폴딩' },
      { label: '규격', value: '20인치' },
      { label: '모터', value: '250W 허브모터' },
      { label: '주행거리', value: '최대 60km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
      { label: '변속기', value: 'Shimano 7단' },
    ],
    for: '도심 이동 · 폴딩 선호자 · 가벼운 한강 라이딩',
  },
  {
    id: 'tx8-pro3',
    brand: '모토벨로',
    model: 'TX8 PRO3',
    tagline: '팻타이어 폴딩, 어떤 노면도 흔들림 없이',
    description: '모토벨로 TX8 시리즈의 팻타이어 버전. 20×4.0인치 광폭 타이어가 자갈길·비포장도로·젖은 노면에서도 안정적인 주행을 제공합니다. 폴딩의 편의성에 탄탄한 접지력을 더한 올라운더 전기자전거입니다.',
    photo: '/bikes/tx8-pro3.png',
    color: 'from-zinc-600/10 to-transparent',
    badgeColor: 'bg-zinc-200 text-zinc-700',
    specs: [
      { label: '프레임', value: '알루미늄 폴딩' },
      { label: '규격', value: '20" × 4.0" 팻타이어' },
      { label: '모터', value: '250W 허브모터' },
      { label: '주행거리', value: '최대 60km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
      { label: '변속기', value: 'Shimano 7단' },
    ],
    for: '비포장 구간 · 안정감 선호자 · 폴딩 전기자전거',
  },
  {
    id: 'viaggio-v6',
    brand: 'AU테크',
    model: '비아지오 V6',
    tagline: '20Ah 대용량, 완충 시 최대 160km 주행',
    description: 'AU테크의 프리미엄 전기 자전거. 20Ah 대용량 리튬이온 배터리와 BMS 보호 시스템을 탑재해 완충 시 최대 160km까지 주행 가능합니다. 앞바퀴·안장 서스펜션과 컬러 LCD 디스플레이, LED 전조등까지 갖춘 실용적인 전기 바이크입니다.',
    photo: '/bikes/v6.png',
    color: 'from-amber-500/10 to-transparent',
    badgeColor: 'bg-amber-100 text-amber-700',
    specs: [
      { label: '배터리', value: '20Ah 리튬이온 (BMS)' },
      { label: '주행거리', value: '최대 160km (완충 기준)' },
      { label: '최고속도', value: '25km/h (법정 제한)' },
      { label: '서스펜션', value: '앞바퀴 + 안장 이중 서스펜션' },
      { label: '디스플레이', value: '컬러 LCD' },
      { label: '조명', value: 'LED 전조등 (방향지시 기능)' },
    ],
    for: '체력 걱정되시는 분 · 어르신 · 장거리 안심 라이딩',
  },
]

const CATEGORIES = [
  { id: 'road',     label: '로드 자전거',   icon: Bike,     bikes: ROAD_BIKES,     desc: '700c 휠의 경쾌한 주행감, 포장도로 특화' },
  { id: 'mtb',      label: 'MTB',           icon: Mountain, bikes: MTB_BIKES,      desc: '26–27.5인치 와이드 타이어, 다양한 지형 대응' },
  { id: 'miniroad', label: '미니로드',       icon: Wind,     bikes: MINIROAD_BIKES, desc: '소형 체형 맞춤, 카본 프레임의 경쾌함' },
  { id: 'ebike',    label: '전기 자전거',    icon: Zap,      bikes: EBIKE_BIKES,    desc: '전동 어시스트, 체력 걱정 없이 달리기' },
]

function BikeCard({ bike, idx, categoryLabel }: { bike: BikeData; idx: number; categoryLabel: string }) {
  const rentalPrice = RENTAL_PRICES.find((r) => r.bikeId === bike.id)
  const isEven = idx % 2 === 0
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${!isEven ? 'lg:grid-flow-dense' : ''}`}>
        {/* Photo */}
        <div className={`relative h-64 lg:h-auto min-h-[320px] ${bike.photo ? 'bg-white' : 'bg-zinc-50'} ${!isEven ? 'lg:col-start-2' : ''}`}>
          {bike.photo ? (
            <Image
              src={bike.photo}
              alt={`${bike.brand} ${bike.model}`}
              fill
              className="object-contain mix-blend-multiply p-4"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${bike.color} flex items-center justify-center`}>
              <div className="text-center text-zinc-300">
                <Bike className="h-16 w-16 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold opacity-50">사진 준비 중</p>
              </div>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${bike.badgeColor}`}>
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-8 lg:p-10">
          <div>
            <h3 className="text-2xl font-black text-zinc-900">{bike.model}</h3>
            <p className="text-sm font-semibold text-zinc-400 mt-0.5">{bike.brand}</p>
            <p className="mt-2 text-base font-bold text-emerald-600">{bike.tagline}</p>
            <p className="mt-3 text-zinc-600 leading-relaxed text-sm">{bike.description}</p>

            <p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">이런 분께 추천</p>
            <p className="mt-1 text-sm text-zinc-600">{bike.for}</p>

          </div>

          <div className="mt-6 space-y-2">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 select-none hover:bg-zinc-100 transition-colors">
                스펙 보기
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 rounded-xl border border-zinc-200 overflow-hidden">
                {bike.specs.map(({ label, value }, i) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
                    <span className="font-semibold text-zinc-500">{label}</span>
                    <span className="font-bold text-zinc-800">{value}</span>
                  </div>
                ))}
              </div>
            </details>

            {rentalPrice && (
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 select-none hover:bg-emerald-100 transition-colors">
                  렌탈 단가 보기
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-2">
                  <RentalPriceBadge rental={rentalPrice} />
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BikesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-zinc-950 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">Our Fleet</p>
        <h1 className="text-4xl font-black text-white sm:text-5xl">자전거 소개</h1>
        <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
          로드·MTB·미니로드·전기 자전거 중 원하시는 스타일을 선택하세요.
          <br />
          어떤 바이크를 선택하셔도 블랙박스 장착 + 투어 영상은 기본 제공됩니다.
        </p>
      </section>

      {/* Category Sections */}
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        return (
          <section key={cat.id} className="py-16 border-b border-zinc-100 last:border-b-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Category Header */}
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">{cat.label}</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">{cat.desc}</p>
                </div>
                <span className="ml-auto rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-500">
                  {cat.bikes.length}종
                </span>
              </div>

              <div className="space-y-8">
                {cat.bikes.map((bike, idx) => (
                  <BikeCard key={bike.id} bike={bike} idx={idx} categoryLabel={cat.label} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* CTA */}
      <section className="py-16 bg-zinc-50 text-center">
        <p className="text-zinc-500 mb-2">어떤 자전거든 블랙박스 장착 + 투어 영상 기본 제공</p>
        <h3 className="text-2xl font-black text-zinc-900 mb-6">마음에 드는 자전거를 골랐다면</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-[1.02]"
          >
            투어 예약하기 →
          </Link>
          <Link
            href="/rental"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-8 py-4 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-50 hover:scale-[1.02]"
          >
            렌탈 예약하기 →
          </Link>
        </div>
      </section>
    </div>
  )
}
