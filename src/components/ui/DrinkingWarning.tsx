import { Ban } from 'lucide-react'

export default function DrinkingWarning() {
  return (
    <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500">
          <Ban className="h-6 w-6 text-white" />
        </div>
        <p className="text-lg font-black text-red-700 tracking-tight">
          음주 후 탑승 절대 금지
        </p>
      </div>
      <div className="space-y-1.5 pl-1">
        <p className="text-sm font-bold text-red-800">
          음주 상태로 자전거에 탑승할 경우 투어 참가가 즉시 거부되며 환불이 불가합니다.
        </p>
        <p className="text-sm text-red-700">
          자전거는 도로교통법상 차에 해당하며, 음주 운전 시 형사처벌(벌금·징역) 대상입니다.
        </p>
        <p className="text-sm text-red-700">
          타인의 안전과 본인의 생명을 위해 반드시 음주 여부를 확인 후 참가해주시기 바랍니다.
        </p>
      </div>
    </div>
  )
}
