'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendBookingConfirmedNotification } from '@/lib/notify/kakao'

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

  return { data: booking }
}

// ── 결제 완료 후 예약 확정 ─────────────────────────────────
export async function confirmBooking(bookingId: string, paymentData: {
  paymentId: string
  method: string
  receiptUrl?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // 결제 레코드 생성
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, tours(title)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) return { error: '예약을 찾을 수 없습니다.' }

  await supabase.from('payments').insert({
    booking_id: bookingId,
    payment_method: paymentData.method,
    portone_payment_id: paymentData.paymentId,
    amount_krw: booking.total_amount_krw,
    currency: 'KRW',
    status: 'paid',
    paid_at: new Date().toISOString(),
    receipt_url: paymentData.receiptUrl ?? null,
  })

  // 예약 상태 → confirmed
  await supabase
    .from('bookings')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  // 카카오톡 알림 발송
  await sendBookingConfirmedNotification({
    phone: booking.contact_phone,
    name: booking.contact_name,
    bookingNumber: booking.booking_number,
    tourTitle: booking.tours?.title ?? '',
    date: booking.tour_date_id ?? '',
    participants: booking.participants,
    totalAmount: booking.total_amount_krw,
  }).catch(console.error)

  revalidatePath('/my/bookings')
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

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')

  if (error) return { error: '취소에 실패했습니다.' }

  revalidatePath('/my/bookings')
  return { success: true }
}
