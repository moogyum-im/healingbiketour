import { createClient } from '@/lib/supabase/server'
import RentalStatusSelect from './RentalStatusSelect'

export const metadata = { title: '렌탈 예약 관리 | 관리자' }

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:          { label: '결제 대기',  cls: 'bg-amber-100 text-amber-700' },
  pending_transfer: { label: '입금 확인',  cls: 'bg-blue-100 text-blue-700' },
  confirmed:        { label: '확정',       cls: 'bg-emerald-100 text-emerald-700' },
  completed:        { label: '완료',       cls: 'bg-zinc-100 text-zinc-700' },
  cancelled:        { label: '취소',       cls: 'bg-red-100 text-red-700' },
}

const FMT = new Intl.NumberFormat('ko-KR')

export default async function AdminRentalBookingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('rental_bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.search) {
    query = query.or(
      `booking_number.ilike.%${params.search}%,contact_name.ilike.%${params.search}%,bike_name.ilike.%${params.search}%`
    )
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
          <h1 className="text-2xl font-bold text-zinc-900">렌탈 예약 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">
            총 {bookings?.length ?? 0}건 · 확정 매출{' '}
            <span className="font-semibold text-emerald-700">
              {FMT.format(total)}원
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
          placeholder="예약번호·예약자·자전거 검색"
          className="rounded-xl border border-zinc-300 px-3.5 py-2 text-sm w-60 focus:border-emerald-500 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={params.status ?? 'all'}
          className="rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">전체 상태</option>
          <option value="pending">결제 대기</option>
          <option value="pending_transfer">입금 확인</option>
          <option value="confirmed">확정</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 테이블 */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3.5 font-semibold text-zinc-600">예약번호</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">자전거</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">예약자</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">시작일</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">기간</th>
                <th className="text-right px-4 py-3.5 font-semibold text-zinc-600">금액</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(bookings ?? []).map((booking) => {
                const sc = statusConfig[booking.status] ?? statusConfig.pending
                return (
                  <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs text-zinc-700">{booking.booking_number}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(booking.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-900">{booking.bike_brand} {booking.bike_name}</p>
                      <p className="text-xs text-zinc-400">{booking.duration_days}일 · {FMT.format(booking.daily_rate_krw)}원/일</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-medium text-zinc-900">{booking.contact_name}</p>
                        {booking.user_id ? (
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">회원</span>
                        ) : (
                          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500">비회원</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{booking.contact_phone}</p>
                      <p className="text-xs text-zinc-400">{booking.contact_email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {new Date(booking.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </td>
                    <td className="px-4 py-3.5 text-center text-zinc-700">
                      {booking.duration_days}일
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="font-semibold text-zinc-900">{FMT.format(booking.total_amount_krw)}원</p>
                      {booking.payment_method && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {booking.payment_method === 'bank_transfer' ? '계좌입금' : booking.payment_method}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <RentalStatusSelect
                        bookingId={booking.id}
                        currentStatus={booking.status}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(bookings ?? []).length === 0 && (
            <div className="py-16 text-center text-sm text-zinc-400">
              조건에 맞는 렌탈 예약이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
