import { Suspense } from 'react'
import BookingForm from '@/components/booking/BookingForm'

export const metadata = {
  title: '예약',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">예약 정보 입력</h1>
        <Suspense fallback={<div className="text-center py-20 text-zinc-400">로딩 중...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  )
}
