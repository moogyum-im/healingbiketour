import { createClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, Users, CreditCard, Calendar } from 'lucide-react'

export const metadata = { title: '매출 관리 | 관리자' }
export const revalidate = 0

const KRW = (n: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(n)

export default async function AdminSalesPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, participants, total_amount_krw, created_at,
      tours ( title ),
      payments ( status, payment_method, paid_at )
    `)
    .in('status', ['confirmed', 'completed', 'cancelled', 'pending'])
    .order('created_at', { ascending: false })

  const all = bookings ?? []
  const confirmed = all.filter(b => b.status === 'confirmed' || b.status === 'completed')
  const thisMonth = new Date().toISOString().slice(0, 7)   // YYYY-MM
  const lastMonth = (() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 7)
  })()

  const thisMonthSales = confirmed
    .filter(b => b.created_at.slice(0, 7) === thisMonth)
    .reduce((s, b) => s + b.total_amount_krw, 0)
  const lastMonthSales = confirmed
    .filter(b => b.created_at.slice(0, 7) === lastMonth)
    .reduce((s, b) => s + b.total_amount_krw, 0)
  const totalSales = confirmed.reduce((s, b) => s + b.total_amount_krw, 0)
  const totalParticipants = confirmed.reduce((s, b) => s + b.participants, 0)
  const growthRate = lastMonthSales > 0
    ? Math.round(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100)
    : null

  // 월별 집계 (최근 12개월)
  const monthlyMap: Record<string, { sales: number; bookings: number }> = {}
  confirmed.forEach(b => {
    const month = b.created_at.slice(0, 7)
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, bookings: 0 }
    monthlyMap[month].sales += b.total_amount_krw
    monthlyMap[month].bookings += 1
  })
  const months = Object.keys(monthlyMap).sort().slice(-12).reverse()

  // 투어별 매출
  const tourSalesMap: Record<string, { title: string; sales: number; count: number }> = {}
  confirmed.forEach(b => {
    const tour = (b as any).tours
    const title = tour?.title ?? '알 수 없음'
    if (!tourSalesMap[title]) tourSalesMap[title] = { title, sales: 0, count: 0 }
    tourSalesMap[title].sales += b.total_amount_krw
    tourSalesMap[title].count += 1
  })
  const tourSales = Object.values(tourSalesMap).sort((a, b) => b.sales - a.sales)

  const maxMonthSales = Math.max(...months.map(m => monthlyMap[m].sales), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">매출 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">확정·완료된 예약 기준 집계</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: '이번 달 매출',
            value: KRW(thisMonthSales),
            sub: growthRate != null
              ? `전월 대비 ${growthRate > 0 ? '+' : ''}${growthRate}%`
              : '전월 데이터 없음',
            icon: growthRate != null && growthRate >= 0 ? TrendingUp : TrendingDown,
            color: growthRate != null && growthRate >= 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600',
            subColor: growthRate != null && growthRate >= 0 ? 'text-emerald-600' : 'text-red-500',
          },
          {
            label: '전체 누적 매출',
            value: KRW(totalSales),
            sub: `확정 ${confirmed.length}건`,
            icon: CreditCard,
            color: 'bg-blue-50 text-blue-600',
            subColor: 'text-zinc-400',
          },
          {
            label: '총 참가 인원',
            value: `${totalParticipants.toLocaleString()}명`,
            sub: `평균 ${confirmed.length > 0 ? (totalParticipants / confirmed.length).toFixed(1) : 0}명/건`,
            icon: Users,
            color: 'bg-violet-50 text-violet-600',
            subColor: 'text-zinc-400',
          },
          {
            label: '이번 달 예약',
            value: `${all.filter(b => b.created_at.slice(0, 7) === thisMonth).length}건`,
            sub: `확정 ${confirmed.filter(b => b.created_at.slice(0, 7) === thisMonth).length}건`,
            icon: Calendar,
            color: 'bg-amber-50 text-amber-600',
            subColor: 'text-zinc-400',
          },
        ].map(({ label, value, sub, icon: Icon, color, subColor }) => (
          <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold text-zinc-900 leading-tight">{value}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
            <p className={`text-xs mt-1 font-medium ${subColor}`}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 월별 매출 바 차트 */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-bold text-zinc-900 mb-5">월별 매출</h2>
          {months.length === 0 ? (
            <p className="text-sm text-zinc-400 py-10 text-center">매출 데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {months.map(month => {
                const d = monthlyMap[month]
                const pct = Math.round((d.sales / maxMonthSales) * 100)
                const label = month.replace('-', '년 ') + '월'
                return (
                  <div key={month} className="flex items-center gap-3">
                    <p className="w-20 text-xs text-zinc-500 shrink-0">{label}</p>
                    <div className="flex-1 h-7 rounded-lg bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-emerald-500 transition-all flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      >
                        {pct > 20 && (
                          <span className="text-[11px] font-bold text-white">{KRW(d.sales)}</span>
                        )}
                      </div>
                    </div>
                    <p className="w-8 text-xs text-zinc-400 shrink-0 text-right">{d.bookings}건</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 투어별 매출 */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-bold text-zinc-900 mb-5">투어별 매출</h2>
          {tourSales.length === 0 ? (
            <p className="text-sm text-zinc-400 py-10 text-center">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {tourSales.map((t, i) => (
                <div key={t.title} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{t.title}</p>
                    <p className="text-xs text-zinc-400">{t.count}건</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 shrink-0">{KRW(t.sales)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 최근 결제 내역 */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">최근 결제 내역</h2>
          <span className="text-xs text-zinc-400">확정·완료 기준</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">투어</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600">인원</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600">금액</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600">결제 수단</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {confirmed.slice(0, 20).map(b => {
                const tour = (b as any).tours
                const payment = (b as any).payments?.[0]
                const methodLabel: Record<string, string> = {
                  kakaopay: '카카오페이', naverpay: '네이버페이',
                  card: '카드', paypal: 'PayPal',
                }
                return (
                  <tr key={b.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3 font-medium text-zinc-900 max-w-[200px] truncate">
                      {tour?.title ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600">{b.participants}명</td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                      {KRW(b.total_amount_krw)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                        {payment ? (methodLabel[payment.payment_method] ?? payment.payment_method) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">
                      {new Date(b.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
              {confirmed.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-zinc-400">
                    결제 완료된 예약이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
