'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { requestCancellation } from '@/lib/actions/booking'
import toast from 'react-hot-toast'

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [step, setStep] = useState<'idle' | 'form' | 'done'>('idle')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (step === 'done') {
    return (
      <span className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
        취소 요청 접수됨
      </span>
    )
  }

  if (step === 'form') {
    return (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <textarea
          rows={2}
          placeholder="취소 사유를 입력해주세요 (선택)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm resize-none focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep('idle')}
            className="flex-1"
          >
            돌아가기
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            className="flex-1"
            onClick={async () => {
              setLoading(true)
              const result = await requestCancellation(bookingId, reason || undefined)
              if (result.error) {
                toast.error(result.error)
              } else {
                toast.success('취소 요청이 접수되었습니다. 관리자 확인 후 처리됩니다.')
                setStep('done')
              }
              setLoading(false)
            }}
          >
            요청 제출
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setStep('form')}>
      취소 신청
    </Button>
  )
}
