import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import CancelBookingButton from './CancelBookingButton'
import ResumePaymentButton from './ResumePaymentButton'

export const metadata = { title: '나의 예약' }

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  confirmed:  { label: '예약 확정',  variant: 'success' },
  pending:    { label: '결제 대기',  variant: 'warning' },
  cancelled:  { label: '취소됨',    variant: 'danger' },
  completed:  { label: '완료',      variant: 'default' },
}

async function BookingSuccessToast({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
      <div>
        <p className="font-semibold text-emerald-800">예약이 완료되었습니다!</p>
        <p className="text-sm text-emerald-600">카카오톡으로 예약 확인 알림이 발송되었습니다.</p>
      </div>
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ booked?: string }>
}

export default async function MyBookingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/my/bookings')

  const params = await searchParams

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, status, participants, total_amount_krw, tour_id,
      created_at,
      tours ( title, slug, thumbnail_url, meeting_point ),
      tour_dates ( date, start_time ),
      payments ( status, receipt_url, payment_method )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = bookings ?? []

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">나의 예약</h1>

        <BookingSuccessToast show={params.booked === 'success'} />

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-zinc-200 bg-white">
            <span className="text-5xl mb-4">🚴</span>
            <h3 className="text-lg font-semibold text-zinc-700">예약 내역이 없습니다</h3>
            <p className="mt-1 text-sm text-zinc-500 mb-6">첫 바이크 투어를 시작해보세요!</p>
            <Link href="/tours">
              <Button>투어 보러가기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((booking) => {
              const statusInfo = statusConfig[booking.status] ?? statusConfig.pending
              const tour = (booking as any).tours
              const tourDate = (booking as any).tour_dates
              const payment = (booking as any).payments?.[0]

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">{booking.booking_number}</p>
                      <h3 className="font-bold text-zinc-900">{tour?.title ?? '투어명 없음'}</h3>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      {tourDate?.date
                        ? new Date(tourDate.date).toLocaleDateString('ko-KR', {
                            month: 'long', day: 'numeric', weekday: 'short',
                          })
                        : '날짜 미정'}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      {tour?.meeting_point ?? '-'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      {booking.participants}명
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <span className="font-bold text-zinc-900">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(booking.total_amount_krw)}
                    </span>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <ResumePaymentButton
                          bookingId={booking.id}
                          tourId={(booking as any).tour_id ?? ''}
                        />
                      )}
                      {booking.status === 'confirmed' && (
                        <Suspense>
                          <CancelBookingButton bookingId={booking.id} />
                        </Suspense>
                      )}
                      {(booking.status === 'completed' || booking.status === 'confirmed') && (
                        <Link href={`/my/reviews/write?booking=${booking.id}&tour=${tour?.id ?? ''}&title=${encodeURIComponent(tour?.title ?? '')}`}>
                          <Button variant="outline" size="sm">⭐ 리뷰 작성</Button>
                        </Link>
                      )}
                      {payment?.receipt_url && (
                        <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">영수증</Button>
                        </a>
                      )}
                      <Link href={`/my/bookings/${booking.id}`}>
                        <Button variant="ghost" size="sm">상세 보기</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
