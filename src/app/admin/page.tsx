import { createClient } from '@/lib/supabase/server'
import { Map, CalendarDays, DollarSign, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: '관리자 대시보드' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalTours },
    { count: totalBookings },
    { count: todayBookings },
    { count: pendingBookings },
    { data: recentTourBookings },
    { data: recentRentalBookings },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings')
      .select('id, booking_number, status, total_amount_krw, contact_name, created_at, tours(title)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('rental_bookings')
      .select('id, booking_number, status, total_amount_krw, contact_name, created_at, bike_brand, bike_name')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('bookings').select('total_amount_krw').eq('status', 'confirmed'),
  ])

  const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount_krw ?? 0), 0) ?? 0

  // 투어 + 렌탈 통합, 최신순 8건
  const allRecent = [
    ...(recentTourBookings ?? []).map((b) => ({
      id: b.id,
      type: 'tour' as const,
      title: (b as { tours?: { title?: string } }).tours?.title ?? '-',
      bookingNumber: b.booking_number,
      status: b.status,
      amount: b.total_amount_krw,
      name: b.contact_name,
      createdAt: b.created_at,
    })),
    ...(recentRentalBookings ?? []).map((b) => ({
      id: b.id,
      type: 'rental' as const,
      title: `${b.bike_brand} ${b.bike_name}`,
      bookingNumber: b.booking_number,
      status: b.status,
      amount: b.total_amount_krw,
      name: b.contact_name,
      createdAt: b.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const stats = [
    { label: '활성 투어',  value: totalTours ?? 0,    icon: Map,        color: 'bg-blue-50 text-blue-600',     href: '/admin/tours' },
    { label: '전체 예약',  value: totalBookings ?? 0,  icon: CalendarDays, color: 'bg-emerald-50 text-emerald-600', href: '/admin/bookings' },
    { label: '오늘 예약',  value: todayBookings ?? 0,  icon: TrendingUp,  color: 'bg-amber-50 text-amber-600',   href: '/admin/bookings?date=today' },
    { label: '대기 중',    value: pendingBookings ?? 0, icon: Clock,      color: 'bg-orange-50 text-orange-600',  href: '/admin/bookings?status=pending' },
    {
      label: '총 매출',
      value: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(totalRevenue),
      icon: DollarSign,
      color: 'bg-violet-50 text-violet-600',
      href: '/admin/bookings',
    },
  ]

  const statusConfig: Record<string, { label: string; cls: string }> = {
    confirmed:        { label: '확정',    cls: 'bg-emerald-100 text-emerald-700' },
    pending:          { label: '대기',    cls: 'bg-amber-100 text-amber-700' },
    pending_transfer: { label: '입금확인', cls: 'bg-blue-100 text-blue-700' },
    cancelled:        { label: '취소',    cls: 'bg-red-100 text-red-700' },
    completed:        { label: '완료',    cls: 'bg-zinc-100 text-zinc-700' },
  }

  const FMT = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">바이크투어 운영 현황</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 예약 (투어 + 렌탈 통합) */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">최근 예약</h2>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/admin/bookings" className="text-emerald-600 hover:underline">투어 전체 →</Link>
            <Link href="/admin/rental-bookings" className="text-emerald-600 hover:underline">렌탈 전체 →</Link>
          </div>
        </div>
        <div className="divide-y divide-zinc-100">
          {allRecent.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-400">예약 없음</div>
          ) : (
            allRecent.map((booking) => {
              const status = statusConfig[booking.status] ?? statusConfig.pending
              return (
                <div key={`${booking.type}-${booking.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                  {/* 분류 뱃지 */}
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    booking.type === 'rental'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-violet-100 text-violet-700'
                  }`}>
                    {booking.type === 'rental' ? '렌탈' : '투어'}
                  </span>

                  {/* 제목 + 예약자 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{booking.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {booking.name} · {booking.bookingNumber}
                    </p>
                  </div>

                  {/* 금액 + 상태 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-zinc-700">{FMT.format(booking.amount)}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/tours/new',              label: '새 투어 등록',      emoji: '➕', desc: '새로운 자전거 투어를 등록하세요' },
          { href: '/admin/bookings?status=pending', label: '미처리 예약 확인',  emoji: '⏰', desc: '결제 대기 예약을 처리하세요' },
          { href: '/tours',                         label: '사이트 미리보기',   emoji: '🌐', desc: '실제 고객 화면을 확인하세요' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-emerald-300 hover:shadow-sm transition-all">
              <span className="text-2xl">{item.emoji}</span>
              <p className="mt-2 font-semibold text-zinc-900">{item.label}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
