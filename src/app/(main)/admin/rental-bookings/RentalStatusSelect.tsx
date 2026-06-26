'use client'

import { useState } from 'react'
import { updateRentalBookingStatus } from '@/lib/actions/rental'
import toast from 'react-hot-toast'

const OPTIONS = [
  { value: 'pending',          label: '결제 대기', cls: 'bg-amber-100 text-amber-700' },
  { value: 'pending_transfer', label: '입금 확인', cls: 'bg-blue-100 text-blue-700' },
  { value: 'confirmed',        label: '확정',      cls: 'bg-emerald-100 text-emerald-700' },
  { value: 'completed',        label: '완료',      cls: 'bg-zinc-100 text-zinc-700' },
  { value: 'cancelled',        label: '취소',      cls: 'bg-red-100 text-red-700' },
]

export default function RentalStatusSelect({
  bookingId,
  currentStatus,
}: {
  bookingId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const current = OPTIONS.find((o) => o.value === status)

  async function handleChange(newStatus: string) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateRentalBookingStatus(bookingId, newStatus)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setStatus(newStatus)
    toast.success('상태가 변경되었습니다.')
  }

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={`rounded-lg px-2.5 py-1 text-xs font-bold border-0 cursor-pointer appearance-none pr-6 ${current?.cls ?? 'bg-zinc-100 text-zinc-600'}`}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
