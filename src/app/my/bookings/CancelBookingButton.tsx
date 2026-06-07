'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { cancelBooking } from '@/lib/actions/booking'
import toast from 'react-hot-toast'

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  if (cancelled) return null

  const handleCancel = async () => {
    if (!confirm('정말 예약을 취소하시겠습니까?')) return
    setLoading(true)
    const result = await cancelBooking(bookingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('예약이 취소되었습니다.')
      setCancelled(true)
    }
    setLoading(false)
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleCancel}>
      취소 신청
    </Button>
  )
}
