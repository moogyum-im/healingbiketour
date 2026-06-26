'use client'

import Link from 'next/link'
import { CreditCard } from 'lucide-react'

interface Props {
  bookingId: string
  tourId: string
}

export default function ResumePaymentButton({ bookingId, tourId }: Props) {
  return (
    <Link
      href={`/booking?tour=${tourId}&resume=${bookingId}`}
      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
    >
      <CreditCard className="h-3.5 w-3.5" />
      결제하기
    </Link>
  )
}
