import { Suspense } from 'react'
import BookingForm from '@/components/booking/BookingForm'
import { getTranslations, getLocale } from 'next-intl/server'

export const metadata = {
  title: 'Booking',
}

export default async function BookingPage() {
  const locale = await getLocale()
  const isKo = locale === 'ko'

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          {isKo ? '예약 정보 입력' : 'Booking Details'}
        </h1>
        <Suspense fallback={<div className="text-center py-20 text-zinc-400">{isKo ? '로딩 중...' : 'Loading...'}</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  )
}
