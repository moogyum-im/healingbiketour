import type { Metadata } from 'next'
import RentalAvailabilityManager from '@/components/admin/RentalAvailabilityManager'

export const metadata: Metadata = { title: '렌탈 가용 수량 관리 | 관리자' }

export default function AdminRentalAvailabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">렌탈 가용 수량 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">
          날짜별 렌탈 가능 자전거 대수를 설정합니다. 달력에 남은 수량이 표시됩니다.
        </p>
      </div>
      <RentalAvailabilityManager />
    </div>
  )
}
