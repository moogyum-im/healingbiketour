'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  sendBookingPendingNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendAdminNewBookingNotification,
} from '@/lib/notify/kakao'

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
}

// ── 예약 생성 ──────────────────────────────────────────────
export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // 투어 정보 확인
  const { data: tour } = await supabase
    .from('tours')
    .select('id, title, price_krw, max_participants')
    .eq('id', input.tourId)
    .single()

  if (!tour) return { error: '투어 정보를 찾을 수 없습니다.' }

  // 예약번호 생성
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().split('T')[0])

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  const bookingNumber = `BK-${today}-${seq}`

  // 예약 생성
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      user_id: user.id,
      tour_id: input.tourId,
      tour_date_id: input.tourDateId ?? null,
      participants: input.participants,
      total_amount_krw: input.totalAmountKrw,
      currency: 'KRW',
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      special_requests: input.specialRequests ?? null,
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
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, tours(title), tour_dates(date)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) return { error: '예약을 찾을 수 없습니다.' }

  const creditAmount = paymentData.creditAmount ?? 0
  const paidAmount = booking.total_amount_krw - creditAmount
  const tourDate = (booking as any).tour_dates
  const dateLabel = tourDate?.date
    ? new Date(tourDate.date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 미정'

  // 크레딧 차감 (사용한 경우)
  if (creditAmount > 0) {
    const result = await deductCredit(supabase, user.id, creditAmount, bookingId)
    if (result.error) return { error: result.error }
  }

  await supabase.from('payments').insert({
    booking_id: bookingId,
    payment_method: paymentData.method,
    portone_payment_id: paymentData.paymentId,
    amount_krw: paidAmount,
    currency: 'KRW',
    status: 'paid',
    paid_at: new Date().toISOString(),
    receipt_url: paymentData.receiptUrl ?? null,
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
