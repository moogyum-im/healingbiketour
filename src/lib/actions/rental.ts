'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDailyRate, getRentalPriceByBikeId } from '@/lib/rental-prices'

export interface CreateRentalBookingInput {
  bikeId: string
  bikeName: string
  bikeBrand: string
  startDate: string  // YYYY-MM-DD
  durationDays: number
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests?: string
  isBankTransfer?: boolean
}

export async function createRentalBooking(input: CreateRentalBookingInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const prices = getRentalPriceByBikeId(input.bikeId)
  if (!prices) return { error: '선택한 자전거의 가격 정보를 찾을 수 없습니다.' }

  const dailyRate = getDailyRate(prices, input.durationDays)
  const totalAmount = dailyRate * input.durationDays

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const { count } = await supabase
    .from('rental_bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().split('T')[0])

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  const bookingNumber = `RN-${today}-${seq}`

  const { data: booking, error } = await supabase
    .from('rental_bookings')
    .insert({
      booking_number: bookingNumber,
      user_id: user.id,
      status: input.isBankTransfer ? 'pending_transfer' : 'pending',
      ...(input.isBankTransfer && { payment_method: 'bank_transfer' }),
      bike_id: input.bikeId,
      bike_name: input.bikeName,
      bike_brand: input.bikeBrand,
      start_date: input.startDate,
      duration_days: input.durationDays,
      daily_rate_krw: dailyRate,
      total_amount_krw: totalAmount,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      special_requests: input.specialRequests ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[createRentalBooking]', error)
    return { error: '예약 생성에 실패했습니다.' }
  }

  revalidatePath('/admin/rental-bookings')
  return { data: booking }
}

export async function getMyRentalBookings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.', data: [] }

  const { data, error } = await supabase
    .from('rental_bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

// ── 결제 완료 후 예약 확정 ─────────────────────────────────
export async function confirmRentalBooking(bookingId: string, paymentData: {
  paymentId: string
  method: string
  expectedAmount: number  // KRW 또는 USD cents (PayPal)
  currency: 'KRW' | 'USD'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: booking } = await supabase
    .from('rental_bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) return { error: '예약을 찾을 수 없습니다.' }

  // PortOne V2 결제 검증
  const portoneRes = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(paymentData.paymentId)}`,
    { headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` } }
  )
  if (!portoneRes.ok) return { error: '결제 정보를 확인할 수 없습니다.' }
  const payment = await portoneRes.json()
  if (payment.status !== 'PAID') return { error: '결제가 완료되지 않았습니다.' }
  if (payment.amount.total !== paymentData.expectedAmount) return { error: '결제 금액이 일치하지 않습니다.' }

  const { error } = await supabase
    .from('rental_bookings')
    .update({
      status: 'confirmed',
      payment_method: paymentData.method,
      portone_payment_id: paymentData.paymentId,
      payment_currency: paymentData.currency,
      paid_amount: paymentData.expectedAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (error) return { error: '예약 확정에 실패했습니다.' }

  revalidatePath('/admin/rental-bookings')
  revalidatePath('/my/bookings')
  return { success: true, bookingNumber: booking.booking_number }
}

export async function updateRentalBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '권한이 없습니다.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return { error: '관리자만 사용 가능합니다.' }

  const { error } = await supabase
    .from('rental_bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) return { error: '상태 변경에 실패했습니다.' }

  revalidatePath('/admin/rental-bookings')
  return { success: true }
}
