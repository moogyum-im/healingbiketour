'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'pending',   label: '결제 대기' },
  { value: 'confirmed', label: '예약 확정' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소됨' },
]

const cls: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-zinc-100 text-zinc-700',
}

export default function BookingStatusSelect({
  bookingId,
  currentStatus,
}: {
  bookingId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      toast.error('상태 변경 실패')
    } else {
      setStatus(newStatus)
      toast.success('상태가 변경되었습니다.')
    }
    setLoading(false)
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`rounded-lg border-0 px-2.5 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${cls[status] ?? cls.pending}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
