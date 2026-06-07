import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Calendar, MapPin, Users, Clock, Route, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'

export const revalidate = 0

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; icon: typeof CheckCircle }> = {
  confirmed: { label: '예약 확정',  variant: 'success',  icon: CheckCircle },
  pending:   { label: '결제 대기',  variant: 'warning',  icon: AlertCircle },
  cancelled: { label: '취소됨',    variant: 'danger',   icon: XCircle },
  completed: { label: '완료',      variant: 'default',  icon: CheckCircle },
}

interface PageProps { params: Promise<{ id: string }> }

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/my/bookings')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, status, participants, total_amount_krw,
      contact_name, contact_email, contact_phone, special_requests,
      created_at, tour_id,
      tours ( id, title, slug, thumbnail_url, meeting_point, duration_hours, distance_km, price_krw ),
      tour_dates ( date, start_time, end_time ),
      payments ( status, payment_method, paid_at, receipt_url )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!booking) notFound()

  const tour = (booking as any).tours
  const tourDate = (booking as any).tour_dates
  const payments: any[] = (booking as any).payments ?? []
  const payment = payments[0]
  const statusInfo = statusConfig[booking.status] ?? statusConfig.pending
  const StatusIcon = statusInfo.icon

  const fmt = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* 뒤로가기 */}
        <Link href="/my/bookings" className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          나의 예약
        </Link>

        {/* 상태 헤더 */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            booking.status === 'confirmed' ? 'bg-emerald-100' :
            booking.status === 'pending'   ? 'bg-amber-100'   :
            booking.status === 'cancelled' ? 'bg-red-100'     : 'bg-zinc-100'
          }`}>
            <StatusIcon className={`h-6 w-6 ${
              booking.status === 'confirmed' ? 'text-emerald-600' :
              booking.status === 'pending'   ? 'text-amber-500'   :
              booking.status === 'cancelled' ? 'text-red-500'     : 'text-zinc-500'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400 font-mono">{booking.booking_number}</span>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <p className="text-lg font-bold text-zinc-900 mt-0.5 truncate">{tour?.title ?? '투어명 없음'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 투어 정보 */}
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {tour?.thumbnail_url && (
              <div className="relative h-40">
                <Image src={tour.thumbnail_url} alt={tour.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-5">
              <h2 className="font-bold text-zinc-900 mb-4">투어 정보</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: Calendar, label: '날짜',
                    value: tourDate?.date
                      ? new Date(tourDate.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
                      : '날짜 미정'
                  },
                  { icon: Clock, label: '시간',
                    value: tourDate?.start_time
                      ? `${tourDate.start_time}${tourDate.end_time ? ` ~ ${tourDate.end_time}` : ''}`
                      : '미정'
                  },
                  { icon: MapPin,  label: '집결지',   value: tour?.meeting_point ?? '-' },
                  { icon: Users,   label: '인원',     value: `${booking.participants}명` },
                  { icon: Clock,   label: '소요 시간', value: tour?.duration_hours ? `약 ${tour.duration_hours}시간` : '-' },
                  { icon: Route,   label: '거리',      value: tour?.distance_km ? `${tour.distance_km}km` : '-' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2 text-zinc-600">
                    <Icon className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-400">{label}</p>
                      <p className="font-medium text-zinc-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 예약자 정보 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-bold text-zinc-900 mb-4">예약자 정보</h2>
            <div className="space-y-2 text-sm text-zinc-700">
              {[
                ['이름',   booking.contact_name],
                ['이메일', booking.contact_email],
                ['연락처', booking.contact_phone],
                ...(booking.special_requests ? [['요청사항', booking.special_requests]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-20 shrink-0 text-zinc-400">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-bold text-zinc-900 mb-4">결제 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">결제 금액</span>
                <span className="font-bold text-zinc-900 text-base">{fmt.format(booking.total_amount_krw)}</span>
              </div>
              {payment && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">결제 수단</span>
                    <span className="font-medium capitalize">{payment.payment_method ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">결제 상태</span>
                    <span className={`font-semibold ${payment.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {payment.status === 'paid' ? '결제 완료' : '미결제'}
                    </span>
                  </div>
                  {payment.paid_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">결제 일시</span>
                      <span className="font-medium">{new Date(payment.paid_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            {booking.status === 'pending' && (
              <Link
                href={`/booking?tour=${(booking as any).tour_id}&resume=${booking.id}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                결제 완료하기
              </Link>
            )}
            {payment?.receipt_url && (
              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                영수증 보기
              </a>
            )}
            {tour?.slug && (
              <Link href={`/tours/${tour.slug}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                투어 보기
              </Link>
            )}
          </div>

          <p className="text-center text-xs text-zinc-400">
            예약 문의: 힐링바이크투어 채팅 상담 또는 카카오톡으로 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
