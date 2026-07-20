'use server'

import { createAdminClient } from '@/lib/supabase/admin'

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, '')
}

// ── 비회원 예약 조회 (예약번호 + 연락처로 본인 확인) ─────────────
// RLS로 열어두면 anon key로 전체 비회원 예약이 조회되므로,
// admin client로 예약번호를 먼저 찾은 뒤 연락처가 일치할 때만 반환한다.
export async function getGuestBooking(bookingNumber: string, phone: string) {
  const number = bookingNumber.trim().toUpperCase()
  const digits = normalizePhone(phone)
  if (!number || !digits) return { error: '예약번호와 연락처를 입력해주세요.' }

  const admin = createAdminClient()
  const notFoundError = { error: '일치하는 예약을 찾을 수 없습니다. 예약번호와 연락처를 다시 확인해주세요.' }

  if (number.startsWith('RN-')) {
    const { data } = await admin
      .from('rental_bookings')
      .select('*')
      .eq('booking_number', number)
      .maybeSingle()

    if (!data || normalizePhone(data.contact_phone) !== digits) return notFoundError
    return { data: { type: 'rental' as const, booking: data } }
  }

  if (number.startsWith('BK-')) {
    const { data } = await admin
      .from('bookings')
      .select('*, tours(title, thumbnail_url, meeting_point), tour_dates(date, start_time), payments(status, receipt_url, payment_method)')
      .eq('booking_number', number)
      .maybeSingle()

    if (!data || normalizePhone(data.contact_phone) !== digits) return notFoundError
    return { data: { type: 'tour' as const, booking: data } }
  }

  return { error: '예약번호 형식이 올바르지 않습니다.' }
}

// ── 비회원 예약을 신규/기존 계정에 연결 ──────────────────────────
// 로그인·회원가입 직후 호출한다. 같은 이메일로 남아있던 user_id가
// null인 비회원 예약을 해당 계정으로 귀속시켜, 이후 마이페이지에서
// 볼 수 있게 한다.
export async function linkGuestBookingsToUser(userId: string, email: string) {
  if (!userId || !email) return

  const admin = createAdminClient()
  await Promise.all([
    admin.from('bookings').update({ user_id: userId }).is('user_id', null).eq('contact_email', email),
    admin.from('rental_bookings').update({ user_id: userId }).is('user_id', null).eq('contact_email', email),
  ])
}
