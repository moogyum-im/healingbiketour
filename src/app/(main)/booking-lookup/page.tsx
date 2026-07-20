'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Calendar, Phone, Mail, Bike, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { getGuestBooking } from '@/lib/actions/guest'
import { formatPrice } from '@/utils/format'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  confirmed:         { label: '예약 확정',    variant: 'success' },
  pending:           { label: '결제 대기',    variant: 'warning' },
  pending_transfer:  { label: '입금 확인 중', variant: 'warning' },
  cancelled:         { label: '취소됨',      variant: 'danger' },
  completed:         { label: '완료',        variant: 'default' },
  cancel_requested:  { label: '취소 요청 중', variant: 'warning' },
}

type GuestBookingResult = Awaited<ReturnType<typeof getGuestBooking>>

interface GuestBookingRow {
  booking_number: string
  status: string
  contact_phone: string
  contact_email: string
  total_amount_krw: number
  // 투어 예약
  tours?: { title: string; meeting_point?: string } | null
  tour_dates?: { date: string } | null
  // 렌탈 예약
  bike_brand?: string
  bike_name?: string
  start_date?: string
  duration_days?: number
}

export default function BookingLookupPage() {
  const [bookingNumber, setBookingNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GuestBookingResult['data'] | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    const res = await getGuestBooking(bookingNumber, phone)
    if (res.error || !res.data) {
      setError(res.error ?? '예약을 찾을 수 없습니다.')
    } else {
      setResult(res.data)
    }
    setLoading(false)
  }

  const booking = result?.booking as GuestBookingRow | undefined
  const statusInfo = booking ? (statusConfig[booking.status] ?? statusConfig.pending) : null

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-zinc-50 py-10">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1.5">예약 조회</h1>
        <p className="text-sm text-zinc-500 mb-6">
          회원가입 없이 예약하신 경우, 예약번호와 연락처로 예약 내용을 확인할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">예약번호</label>
            <input
              type="text"
              required
              placeholder="BK-20260720-0001 / RN-20260720-0001"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-mono uppercase focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">예약 시 등록한 연락처</label>
            <input
              type="tel"
              required
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <Search className="h-4 w-4" />
            예약 조회하기
          </Button>
        </form>

        {booking && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1 font-mono">{booking.booking_number}</p>
                <h3 className="font-bold text-zinc-900">
                  {result?.type === 'tour' ? (booking.tours?.title ?? '투어명 없음') : `${booking.bike_brand} ${booking.bike_name}`}
                </h3>
              </div>
              {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
            </div>

            <div className="space-y-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                {result?.type === 'tour'
                  ? (booking.tour_dates?.date
                      ? new Date(booking.tour_dates.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
                      : '날짜 미정')
                  : `${booking.start_date} · ${booking.duration_days}일`}
              </div>
              {result?.type === 'tour' && booking.tours?.meeting_point && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  {booking.tours.meeting_point}
                </div>
              )}
              {result?.type === 'rental' && (
                <div className="flex items-center gap-2">
                  <Bike className="h-4 w-4 text-emerald-600 shrink-0" />
                  {booking.bike_brand} {booking.bike_name}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                {booking.contact_phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                {booking.contact_email}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="text-sm text-zinc-500">결제 금액</span>
              <span className="font-bold text-zinc-900">{formatPrice(booking.total_amount_krw)}</span>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                회원가입하면 이 예약을 포함해 앞으로의 예약을 마이페이지에서 계속 관리할 수 있어요.{' '}
                <Link href={`/auth/signup?email=${encodeURIComponent(booking.contact_email)}`} className="font-semibold underline">
                  회원가입하기
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
