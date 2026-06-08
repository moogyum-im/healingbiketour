import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, MapPin, Users, Gift, Star, CheckCircle,
  ChevronRight, Receipt,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import CancelBookingButton from './bookings/CancelBookingButton'
import ResumePaymentButton from './bookings/ResumePaymentButton'

export const metadata = { title: '마이페이지' }

const bookingStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  confirmed:  { label: '예약 확정',  variant: 'success' },
  pending:    { label: '결제 대기',  variant: 'warning' },
  cancelled:  { label: '취소됨',    variant: 'danger' },
  completed:  { label: '완료',      variant: 'default' },
}

const creditTypeLabel: Record<string, string> = {
  review_reward: '리뷰 적립',
  admin_grant:   '관리자 지급',
  purchase_used: '결제 사용',
  refund:        '환불',
  expired:       '만료',
}

const creditTypeColor: Record<string, string> = {
  review_reward: 'bg-emerald-100 text-emerald-700',
  admin_grant:   'bg-blue-100 text-blue-700',
  purchase_used: 'bg-red-100 text-red-700',
  refund:        'bg-amber-100 text-amber-700',
  expired:       'bg-zinc-100 text-zinc-500',
}

interface PageProps {
  searchParams: Promise<{ tab?: string; booked?: string }>
}

export default async function MyPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/my')

  const params = await searchParams
  const tab = params.tab ?? 'bookings'

  const [
    { data: bookings },
    { data: creditBalance },
    { data: creditHistory },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, booking_number, status, participants, total_amount_krw, tour_id,
        created_at,
        tours ( id, title, slug, thumbnail_url, meeting_point ),
        tour_dates ( date, start_time ),
        payments ( status, receipt_url, payment_method )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('credit_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('credits')
      .select('id, amount, type, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('reviews')
      .select('id, rating, content, created_at, tours ( title, slug )')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const balance = creditBalance?.balance ?? 0
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'User'

  const tabs = [
    { key: 'bookings', label: '예약 내역' },
    { key: 'credits',  label: '크레딧 내역' },
    { key: 'reviews',  label: '내 리뷰' },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* 프로필 헤더 */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">마이페이지</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <Gift className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-emerald-600 font-medium leading-none mb-0.5">보유 크레딧</p>
              <p className="text-xl font-black text-emerald-800 leading-none">{balance.toLocaleString()}C</p>
            </div>
          </div>
        </div>

        {/* 예약 완료 토스트 */}
        {params.booked === 'success' && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">예약이 완료되었습니다!</p>
              <p className="text-sm text-emerald-600">카카오톡으로 예약 확인 알림이 발송되었습니다.</p>
            </div>
          </div>
        )}

        {/* 탭 */}
        <div className="mb-6 flex gap-1 rounded-xl bg-zinc-100 p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/my?tab=${t.key}`}
              className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* 예약 내역 탭 */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {(bookings ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-zinc-200 bg-white">
                <span className="text-5xl mb-4">🚴</span>
                <h3 className="text-lg font-semibold text-zinc-700">예약 내역이 없습니다</h3>
                <p className="mt-1 text-sm text-zinc-500 mb-6">첫 바이크 투어를 시작해보세요!</p>
                <Link href="/tours"><Button>투어 보러가기</Button></Link>
              </div>
            ) : (
              (bookings ?? []).map((booking) => {
                const statusInfo = bookingStatusConfig[booking.status] ?? bookingStatusConfig.pending
                const tour = (booking as any).tours
                const tourDate = (booking as any).tour_dates
                const payment = (booking as any).payments?.[0]

                return (
                  <div key={booking.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
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

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 flex-wrap gap-2">
                      <span className="font-bold text-zinc-900">
                        {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(booking.total_amount_krw)}
                      </span>
                      <div className="flex gap-2 flex-wrap">
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
                            <Button variant="ghost" size="sm">
                              <Receipt className="h-3.5 w-3.5 mr-1" />
                              영수증
                            </Button>
                          </a>
                        )}
                        <Link href={`/my/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">
                            상세 보기
                            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* 크레딧 내역 탭 */}
        {tab === 'credits' && (
          <div className="space-y-4">
            {/* 잔액 카드 */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">현재 보유 크레딧</p>
                <p className="text-4xl font-black text-emerald-800 mt-1">{balance.toLocaleString()}<span className="text-xl ml-1">C</span></p>
                <p className="text-xs text-emerald-600 mt-1">1 크레딧 = 1원 할인 적용</p>
              </div>
              <Gift className="h-12 w-12 text-emerald-400 opacity-60" />
            </div>

            {/* 적립 안내 */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>투어 완료 후 리뷰를 작성하면 <strong>2,000 크레딧</strong>이 자동 적립됩니다.</span>
            </div>

            {/* 거래 내역 */}
            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="font-bold text-zinc-900">크레딧 거래 내역</h2>
              </div>
              {(creditHistory ?? []).length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-400">크레딧 거래 내역이 없습니다</div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {(creditHistory ?? []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${creditTypeColor[item.type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                          {creditTypeLabel[item.type] ?? item.type}
                        </span>
                        <span className="text-sm text-zinc-600">{item.description ?? '-'}</span>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className={`font-bold ${item.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}C
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 내 리뷰 탭 */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            {(reviews ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-zinc-200 bg-white">
                <Star className="h-10 w-10 text-zinc-200 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-700">아직 작성한 리뷰가 없습니다</h3>
                <p className="mt-1 text-sm text-zinc-500 mb-6">투어 완료 후 리뷰를 작성하면 2,000 크레딧이 적립됩니다!</p>
                <Link href="/my?tab=bookings"><Button variant="outline">예약 내역 보기</Button></Link>
              </div>
            ) : (
              (reviews ?? []).map((review) => {
                const tour = (review as any).tours
                return (
                  <div key={review.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <Link href={tour?.slug ? `/tours/${tour.slug}` : '#'} className="font-bold text-zinc-900 hover:text-emerald-700 transition-colors">
                          {tour?.title ?? '투어명 없음'}
                        </Link>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {new Date(review.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed">{review.content}</p>
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
    </div>
  )
}
