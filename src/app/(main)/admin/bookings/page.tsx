import { createClient } from '@/lib/supabase/server'
import BookingStatusSelect from './BookingStatusSelect'
import CancellationButtons from './CancellationButtons'
import { calcRefundPercentageFromDate } from '@/lib/utils/refund'

export const metadata = { title: '예약 관리 | 관리자' }

interface PageProps {
  searchParams: Promise<{ status?: string; date?: string; search?: string }>
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  confirmed:        { label: '확정',      cls: 'bg-emerald-100 text-emerald-700' },
  pending:          { label: '대기',      cls: 'bg-amber-100 text-amber-700' },
  cancelled:        { label: '취소',      cls: 'bg-red-100 text-red-700' },
  completed:        { label: '완료',      cls: 'bg-zinc-100 text-zinc-700' },
  cancel_requested: { label: '취소요청', cls: 'bg-orange-100 text-orange-700' },
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select(`
      id, booking_number, status, participants, total_amount_krw,
      contact_name, contact_email, contact_phone, created_at,
      cancellation_reason, cancellation_requested_at,
      nationality, passport_number,
      tours ( title ),
      tour_dates ( date, start_time ),
      payments ( status, payment_method )
    `)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.date === 'today') {
    query = query.gte('created_at', new Date().toISOString().split('T')[0])
  }
  if (params.search) {
    query = query.or(`booking_number.ilike.%${params.search}%,contact_name.ilike.%${params.search}%`)
  }

  const { data: bookings } = await query

  const total = bookings?.reduce((sum, b) => {
    if (b.status === 'confirmed' || b.status === 'completed') return sum + b.total_amount_krw
    return sum
  }, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">예약 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">
            총 {bookings?.length ?? 0}건 · 확정 매출{' '}
            <span className="font-semibold text-emerald-700">
              {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(total)}
            </span>
          </p>
        </div>
      </div>

      {/* 필터 */}
      <form className="flex flex-wrap gap-3">
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ''}
          placeholder="예약번호 또는 예약자명 검색"
          className="rounded-xl border border-zinc-300 px-3.5 py-2 text-sm w-64 focus:border-emerald-500 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={params.status ?? 'all'}
          className="rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">전체 상태</option>
          <option value="cancel_requested">취소 요청</option>
          <option value="pending">결제 대기</option>
          <option value="confirmed">예약 확정</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소됨</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 예약 테이블 */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3.5 font-semibold text-zinc-600 whitespace-nowrap">예약번호</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">투어명</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600 whitespace-nowrap">예약자</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600 whitespace-nowrap">연락처</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600 whitespace-nowrap">여권번호</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">날짜</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">인원</th>
                <th className="text-right px-4 py-3.5 font-semibold text-zinc-600">금액</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">결제</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(bookings ?? []).map((booking) => {
                const status = statusConfig[booking.status] ?? statusConfig.pending
                const tour = (booking as any).tours
                const tourDate = (booking as any).tour_dates
                const payment = (booking as any).payments?.[0]

                const isCancelRequested = booking.status === 'cancel_requested'
                const suggestedPct = calcRefundPercentageFromDate(tourDate?.date)

                return (
                  <tr key={booking.id} className={`hover:bg-zinc-50 transition-colors ${isCancelRequested ? 'bg-orange-50' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs text-zinc-700">{booking.booking_number}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(booking.created_at).toLocaleDateString('ko-KR')}
                      </p>
                      {isCancelRequested && (booking as any).cancellation_reason && (
                        <p className="text-xs text-orange-600 mt-1">사유: {(booking as any).cancellation_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-900 max-w-[160px] truncate">{tour?.title ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-900">{booking.contact_name}</p>
                      <p className="text-xs text-zinc-400">{booking.contact_email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-zinc-700 whitespace-nowrap">{booking.contact_phone ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {(booking as any).nationality === 'foreign' ? (
                        <div>
                          <span className="inline-block mb-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">외국인</span>
                          <p className="font-mono text-xs text-zinc-700">{(booking as any).passport_number ?? '-'}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">내국인</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {tourDate?.date
                        ? new Date(tourDate.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
                        : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-center text-zinc-700">
                      {booking.participants}명
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-zinc-900">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(booking.total_amount_krw)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {payment ? (
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                          {payment.status === 'paid' ? '결제완료' : payment.status}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {isCancelRequested ? (
                        <CancellationButtons
                          bookingId={booking.id}
                          totalAmount={booking.total_amount_krw}
                          suggestedPercentage={suggestedPct}
                        />
                      ) : (
                        <BookingStatusSelect
                          bookingId={booking.id}
                          currentStatus={booking.status}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(bookings ?? []).length === 0 && (
            <div className="py-16 text-center text-sm text-zinc-400">
              조건에 맞는 예약이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
