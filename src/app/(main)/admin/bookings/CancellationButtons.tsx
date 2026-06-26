'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { approveCancellation, rejectCancellation } from '@/lib/actions/booking'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const REFUND_OPTIONS = [
  { label: '100% 전액 환불', value: 100 },
  { label: '80% 환불',       value: 80 },
  { label: '50% 환불',       value: 50 },
  { label: '20% 환불',       value: 20 },
  { label: '환불 없음 (0%)', value: 0 },
]

export default function CancellationButtons({
  bookingId,
  totalAmount,
  suggestedPercentage,
}: {
  bookingId: string
  totalAmount: number
  suggestedPercentage: number
}) {
  const router = useRouter()
  const [refundPct, setRefundPct] = useState(suggestedPercentage)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const refundAmount = Math.round(totalAmount * refundPct / 100)
  const fmt = (n: number) => n.toLocaleString('ko-KR') + '원'

  const handleApprove = async () => {
    if (!confirm(`${refundPct}% 환불 (${fmt(refundAmount)})로 취소 승인하시겠습니까?`)) return
    setLoading('approve')
    const result = await approveCancellation(bookingId, refundPct)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`취소 승인 완료 · 환불 ${fmt(result.refundAmount ?? 0)}`)
      router.refresh()
    }
    setLoading(null)
  }

  const handleReject = async () => {
    setLoading('reject')
    const result = await rejectCancellation(bookingId, rejectReason || undefined)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('취소 요청을 거절했습니다.')
      setShowReject(false)
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      {/* 환불 % 선택 */}
      <div className="relative">
        <select
          value={refundPct}
          onChange={(e) => setRefundPct(Number(e.target.value))}
          className="w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          {REFUND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({fmt(Math.round(totalAmount * o.value / 100))})
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
      </div>

      {/* 승인 / 거절 버튼 */}
      <div className="flex gap-1.5">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {loading === 'approve' ? '처리 중...' : '승인'}
        </button>
        <button
          onClick={() => setShowReject((v) => !v)}
          disabled={loading !== null}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <XCircle className="h-3.5 w-3.5" />
          거절
        </button>
      </div>

      {/* 거절 사유 입력 */}
      {showReject && (
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="거절 사유 (선택)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
          />
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className="w-full rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'reject' ? '처리 중...' : '거절 확인'}
          </button>
        </div>
      )}
    </div>
  )
}
