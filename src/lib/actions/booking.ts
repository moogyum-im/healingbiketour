'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import {
  sendBookingPendingNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendAdminNewBookingNotification,
  sendCancellationRequestedAdminNotification,
  sendCancellationApprovedNotification,
  sendCancellationRejectedNotification,
} from '@/lib/notify/kakao'
import { calcRefundPercentageFromDate } from '@/lib/utils/refund'

export interface CreateBookingInput {
  tourId: string
  tourDateId?: string
  participants: number
  date: string
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests?: string
  totalAmountKrw: number
  nationality?: 'korean' | 'foreign'
  passportNumber?: string
}

// ── 예약 생성 ──────────────────────────────────────────────
export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 투어 정보 확인
  const { data: tour } = await supabase
    .from('tours')
    .select('id, title, price_krw, max_participants')
    .eq('id', input.tourId)
    .single()

  if (!tour) return { error: '투어 정보를 찾을 수 없습니다.' }

  // 비회원 예약은 RLS 우회를 위해 admin 클라이언트 사용
  const insertClient = user ? supabase : createAdminClient()

  // 예약번호 생성 — RLS로 안 보이는 예약이 있으면 번호가 중복될 수 있으므로
  // admin 클라이언트로 전체 예약 수를 정확히 센다
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const { count } = await createAdminClient()
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().split('T')[0])

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  const bookingNumber = `BK-${today}-${seq}`

  // 예약 생성
  const { data: booking, error } = await insertClient
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      user_id: user?.id ?? null,
      tour_id: input.tourId,
      tour_date_id: input.tourDateId ?? null,
      participants: input.participants,
      total_amount_krw: input.totalAmountKrw,
      currency: 'KRW',
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      special_requests: input.specialRequests ?? null,
      nationality: input.nationality ?? 'korean',
      passport_number: input.passportNumber ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('[createBooking]', error)
    return { error: '예약 생성에 실패했습니다.' }
  }

  // 예약 접수 알림 (고객 + 사장님)
  const dateLabel = input.date
    ? new Date(input.date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 미정'

  await Promise.all([
    sendBookingPendingNotification({
      phone: input.contactPhone,
      name: input.contactName,
      bookingNumber: booking.booking_number,
      tourTitle: tour.title,
      date: dateLabel,
      participants: input.participants,
      totalAmount: input.totalAmountKrw,
    }).catch(console.error),
    sendAdminNewBookingNotification({
      bookingNumber: booking.booking_number,
      tourTitle: tour.title,
      date: dateLabel,
      participants: input.participants,
      totalAmount: input.totalAmountKrw,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
    }).catch(console.error),
  ])

  return { data: booking }
}

// ── 크레딧 차감 헬퍼 ──────────────────────────────────────
async function deductCredit(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, amount: number, bookingId: string) {
  const { data: balance } = await supabase
    .from('credit_balances')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if ((balance?.balance ?? 0) < amount) return { error: '크레딧 잔액이 부족합니다.' }

  const { error } = await supabase.from('credits').insert({
    user_id: userId,
    amount: -amount,
    type: 'purchase_used',
    description: `예약 결제 사용`,
    reference_id: bookingId,
  })

  if (error) return { error: '크레딧 차감에 실패했습니다.' }
  return { success: true }
}

// ── 결제 완료 후 예약 확정 ─────────────────────────────────
export async function confirmBooking(bookingId: string, paymentData: {
  paymentId: string
  method: string
  receiptUrl?: string
  creditAmount?: number
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 비회원은 admin client로 RLS 우회
  const dbClient = user ? supabase : createAdminClient()

  let bookingQuery = dbClient
    .from('bookings')
    .select('*, tours(title), tour_dates(date)')
    .eq('id', bookingId)
  if (user) bookingQuery = bookingQuery.eq('user_id', user.id)

  const { data: booking } = await bookingQuery.single()
  if (!booking) return { error: '예약을 찾을 수 없습니다.' }

  const creditAmount = paymentData.creditAmount ?? 0
  const paidAmount = booking.total_amount_krw - creditAmount

  // PortOne V2 결제 검증
  if (paidAmount > 0) {
    const portoneRes = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentData.paymentId)}`,
      { headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` } }
    )
    if (!portoneRes.ok) return { error: '결제 정보를 확인할 수 없습니다.' }
    const payment = await portoneRes.json()
    if (payment.status !== 'PAID') return { error: '결제가 완료되지 않았습니다.' }
    if (payment.amount.total !== paidAmount) return { error: '결제 금액이 일치하지 않습니다.' }
  }

  const tourDate = (booking as any).tour_dates
  const dateLabel = tourDate?.date
    ? new Date(tourDate.date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 미정'

  // 크레딧 차감 (사용한 경우, 회원만)
  if (creditAmount > 0 && user) {
    const result = await deductCredit(supabase, user.id, creditAmount, bookingId)
    if (result.error) return { error: result.error }
  }

  await dbClient.from('payments').insert({
    booking_id: bookingId,
    payment_method: paymentData.method,
    portone_payment_id: paymentData.paymentId,
    amount_krw: paidAmount,
    currency: 'KRW',
    status: 'paid',
    paid_at: new Date().toISOString(),
    receipt_url: paymentData.receiptUrl ?? null,
  })

  await dbClient
    .from('bookings')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  await sendBookingConfirmedNotification({
    phone: booking.contact_phone,
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    tourTitle: (booking as any).tours?.title ?? '',
    date: dateLabel,
    participants: booking.participants,
    totalAmount: booking.total_amount_krw,
  }).catch(console.error)

  revalidatePath('/my/bookings')
  revalidatePath('/my')
  return { success: true, bookingNumber: booking.booking_number }
}

// ── 크레딧 전액 결제 (PortOne 없이) ───────────────────────
export async function confirmBookingWithCredit(bookingId: string, creditAmount: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, tours(title), tour_dates(date)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) return { error: '예약을 찾을 수 없습니다.' }
  if (creditAmount < booking.total_amount_krw) return { error: '크레딧이 부족합니다.' }

  const tourDate = (booking as any).tour_dates
  const dateLabel = tourDate?.date
    ? new Date(tourDate.date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 미정'

  const deductResult = await deductCredit(supabase, user.id, booking.total_amount_krw, bookingId)
  if (deductResult.error) return { error: deductResult.error }

  await supabase.from('payments').insert({
    booking_id: bookingId,
    payment_method: 'credit',
    portone_payment_id: `credit_${bookingId}`,
    amount_krw: 0,
    currency: 'KRW',
    status: 'paid',
    paid_at: new Date().toISOString(),
  })

  await supabase
    .from('bookings')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  await sendBookingConfirmedNotification({
    phone: booking.contact_phone,
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    tourTitle: (booking as any).tours?.title ?? '',
    date: dateLabel,
    participants: booking.participants,
    totalAmount: booking.total_amount_krw,
  }).catch(console.error)

  revalidatePath('/my/bookings')
  revalidatePath('/my')
  return { success: true, bookingNumber: booking.booking_number }
}

// ── 내 예약 목록 조회 ──────────────────────────────────────
export async function getMyBookings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.', data: [] }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours ( id, title, slug, thumbnail_url, meeting_point ),
      tour_dates ( date, start_time ),
      payments ( status, receipt_url, payment_method )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

// ── 예약 취소 ──────────────────────────────────────────────
export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: booking } = await supabase
    .from('bookings')
    .select('booking_number, contact_name, contact_phone, tours(title)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .single()

  if (!booking) return { error: '취소할 수 없는 예약입니다.' }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) return { error: '취소에 실패했습니다.' }

  await sendBookingCancelledNotification({
    phone: booking.contact_phone,
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    tourTitle: (booking as any).tours?.title ?? '',
  }).catch(console.error)

  revalidatePath('/my/bookings')
  revalidatePath('/my')
  return { success: true }
}

// ── 취소 요청 (고객) ───────────────────────────────────────────
export async function requestCancellation(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: booking } = await supabase
    .from('bookings')
    .select('booking_number, contact_name, contact_phone, total_amount_krw, tours(title)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .single()

  if (!booking) return { error: '취소 요청할 수 없는 예약입니다.' }

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancel_requested',
      cancellation_reason: reason ?? null,
      cancellation_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (error) return { error: '취소 요청에 실패했습니다.' }

  await sendCancellationRequestedAdminNotification({
    bookingNumber: booking.booking_number,
    tourTitle: (booking as any).tours?.title ?? '',
    contactName: booking.contact_name,
    contactPhone: booking.contact_phone,
    totalAmount: booking.total_amount_krw,
    reason,
  }).catch(console.error)

  revalidatePath('/my/bookings')
  revalidatePath('/my')
  return { success: true }
}

// ── 취소 승인 (관리자) — PortOne 환불 API 호출 ─────────────────
export async function approveCancellation(bookingId: string, refundPercentage: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '권한이 없습니다.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return { error: '관리자만 사용 가능합니다.' }

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, status, total_amount_krw,
      contact_name, contact_phone, cancellation_reason,
      tours(title),
      tour_dates(date),
      payments(portone_payment_id, amount_krw, payment_method)
    `)
    .eq('id', bookingId)
    .single()

  if (!booking || booking.status !== 'cancel_requested') return { error: '취소 요청 상태가 아닙니다.' }

  const payments: any[] = (booking as any).payments ?? []
  const payment = payments[0]
  const refundAmount = Math.round(booking.total_amount_krw * refundPercentage / 100)

  // PortOne 결제건이면 환불 API 호출
  if (payment?.portone_payment_id && !payment.portone_payment_id.startsWith('credit_') && refundAmount > 0) {
    const body: Record<string, unknown> = { reason: '고객 요청 취소' }
    if (refundAmount < (payment.amount_krw ?? booking.total_amount_krw)) {
      body.amount = refundAmount
    }
    const portoneRes = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(payment.portone_payment_id)}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    if (!portoneRes.ok) {
      const err = await portoneRes.json().catch(() => ({}))
      return { error: `PortOne 환불 실패: ${(err as any).message ?? portoneRes.status}` }
    }
  }

  await supabase.from('bookings').update({
    status: 'cancelled',
    refund_amount_krw: refundAmount,
    refund_percentage: refundPercentage,
    updated_at: new Date().toISOString(),
  }).eq('id', bookingId)

  await supabase.from('payments').update({ status: 'refunded' }).eq('booking_id', bookingId)

  await sendCancellationApprovedNotification({
    phone: booking.contact_phone,
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    tourTitle: (booking as any).tours?.title ?? '',
    refundAmount,
    refundPercentage,
  }).catch(console.error)

  revalidatePath('/admin/bookings')
  revalidatePath('/my/bookings')
  return { success: true, refundAmount, refundPercentage }
}

// ── 취소 거절 (관리자) ─────────────────────────────────────────
export async function rejectCancellation(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '권한이 없습니다.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return { error: '관리자만 사용 가능합니다.' }

  const { data: booking } = await supabase
    .from('bookings')
    .select('booking_number, contact_name, contact_phone, status, tours(title)')
    .eq('id', bookingId)
    .single()

  if (!booking || booking.status !== 'cancel_requested') return { error: '취소 요청 상태가 아닙니다.' }

  await supabase.from('bookings').update({
    status: 'confirmed',
    cancellation_reason: null,
    cancellation_requested_at: null,
    updated_at: new Date().toISOString(),
  }).eq('id', bookingId)

  await sendCancellationRejectedNotification({
    phone: booking.contact_phone,
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    tourTitle: (booking as any).tours?.title ?? '',
    reason,
  }).catch(console.error)

  revalidatePath('/admin/bookings')
  revalidatePath('/my/bookings')
  return { success: true }
}

// ── 취소 요청 시 환불 예상 % 계산 헬퍼 (서버 액션) ───────────────
export async function getExpectedRefundPercentage(bookingId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select('total_amount_krw, tour_dates(date)')
    .eq('id', bookingId)
    .single()

  if (!data) return { percentage: 0, amount: 0 }
  const tourDate = (data as any).tour_dates?.date
  const percentage = calcRefundPercentageFromDate(tourDate)
  return { percentage, amount: Math.round(data.total_amount_krw * percentage / 100) }
}
