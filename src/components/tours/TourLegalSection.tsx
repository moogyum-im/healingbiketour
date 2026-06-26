import { AlertTriangle, RefreshCcw, ShieldCheck, Heart, Info } from 'lucide-react'

interface Section {
  icon: React.ElementType
  title: string
  color: string
  defaultOpen?: boolean
  items: { label?: string; content: string }[]
}

const SECTIONS: Section[] = [
  {
    icon: RefreshCcw,
    title: '취소 및 환불 정책',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    items: [
      { label: '7일 전 이상', content: '100% 전액 환불' },
      { label: '3~6일 전', content: '50% 환불' },
      { label: '2일 전 ~ 당일', content: '환불 불가' },
      { label: '악천후 취소', content: '운영사 판단 하에 취소 시 100% 환불 또는 일정 변경 제공' },
      { label: 'No-show', content: '환불 불가 (당일 연락 없이 불참 시)' },
    ],
  },
  {
    icon: ShieldCheck,
    title: '운영자 배상책임보험 안내',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    defaultOpen: true,
    items: [
      { label: '보험사', content: '메리츠화재 (증권번호 14850-481)' },
      { label: '보험종류', content: '여행업자 전문배상책임보험 (기타 전문직업인배상책임보험 J-1)' },
      { label: '보장한도', content: '1청구당 최대 300,000,000원 (3억원) · 공제금액 3,000,000원' },
      { label: '보험기간', content: '2026년 06월 19일 ~ 2027년 06월 19일' },
      { label: '보장 범위', content: '투어 운영 중 고객에게 발생한 제3자 배상책임 사고를 보장합니다. 산악자전거 등 레저·스포츠 활동 포함.' },
      { label: '적용 조건', content: '전문 가이드 동반 투어에 한하여 적용됩니다. 가이드 미동반 자유 라이딩 중 발생한 사고는 보장 범위에서 제외됩니다.' },
      { label: '개인 여행자 보험', content: '본 보험은 운영사 배상책임보험으로, 참가자 개인의 상해·의료비는 보장하지 않습니다. 개인 여행자 보험은 참가자 본인이 별도로 가입하시기를 권장합니다.' },
      { label: '면책 사항', content: '본인 과실에 의한 사고, 음주 후 탑승, 교통법규 위반, 천재지변(자연재해), 분실·도난, 감염병(에이즈·사스·조류독감 등)은 보상 범위에서 제외됩니다.' },
    ],
  },
  {
    icon: AlertTriangle,
    title: '안전 주의사항',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    items: [
      { content: '헬멧 착용은 의무입니다. 미착용 시 탑승이 제한됩니다.' },
      { content: '음주 상태에서의 자전거 탑승은 법적으로 금지되어 있으며, 발각 시 즉시 투어에서 제외됩니다.' },
      { content: '교통신호 및 자전거 도로 법규를 반드시 준수해야 합니다.' },
      { content: '자전거 수령 시 상태를 직접 확인하고 이상이 있을 경우 출발 전 반드시 알려주세요.' },
      { content: '야간 또는 날씨가 좋지 않은 경우 감속 운행합니다.' },
      { content: '분실·도난에 대비한 위치추적 장치 및 도난 방지 알람이 장착되어 있습니다.' },
    ],
  },
  {
    icon: Heart,
    title: '건강 주의사항',
    color: 'text-red-600 bg-red-50 border-red-200',
    items: [
      { content: '심장 질환, 고혈압 등 격렬한 신체활동이 제한된 분은 참가 전 반드시 의사와 상담 후 참가 여부를 결정해주세요.' },
      { content: '임산부는 안전을 위해 참가가 제한됩니다.' },
      { content: '투어 전날 충분한 수면과 수분 섭취를 권장합니다.' },
      { content: '건강 상태 악화로 투어 중 중도 이탈이 필요할 경우, 스태프에게 즉시 알려주세요.' },
    ],
  },
  {
    icon: Info,
    title: '기타 고지사항',
    color: 'text-zinc-600 bg-zinc-50 border-zinc-200',
    items: [
      { content: '본 투어는 야외 활동으로, 날씨에 따라 일부 코스가 변경될 수 있습니다.' },
      { content: '최소 출발 인원: 1인 (개인 참가 가능)' },
      { content: '집결 장소: 당산역 4번 출구 / 출발 10분 전까지 도착해주세요.' },
      { content: '투어 중 촬영된 블랙박스 영상은 참가자 개인 제공용으로만 사용되며, 별도 동의 없이 마케팅에 활용하지 않습니다.' },
      { content: '자전거 파손 시 고의 또는 중대한 과실에 의한 경우 수리 비용이 청구될 수 있습니다.' },
      { content: '만 12세 미만 어린이는 보호자(만 19세 이상) 동반 시에만 참가 가능합니다.' },
    ],
  },
]

export default function TourLegalSection() {
  return (
    <section className="mt-10 border-t border-zinc-200 pt-10">
      <h2 className="text-xl font-black text-zinc-900 mb-6">예약 전 꼭 확인하세요</h2>
      <div className="space-y-4">
        {SECTIONS.map(({ icon: Icon, title, color, defaultOpen, items }) => (
          <details key={title} open={defaultOpen} className={`group rounded-xl border ${color} overflow-hidden`}>
            <summary className="flex cursor-pointer items-center gap-3 px-4 py-3.5 font-bold text-sm select-none">
              <Icon className="h-4 w-4 shrink-0" />
              {title}
              <svg
                className="ml-auto h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="border-t border-current/10 bg-white px-4 py-4">
              <ul className="space-y-2.5">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-600 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                    <span>
                      {item.label && (
                        <strong className="text-zinc-800 mr-1">{item.label}:</strong>
                      )}
                      {item.content}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
