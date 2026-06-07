/**
 * PortOne Webhook 엔드포인트
 * PortOne 대시보드 > 연동 > 웹훅 URL에 등록:
 * https://your-domain.com/api/portone/webhook
 */
import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const body = await request.json()
  const { imp_uid, merchant_uid, status } = body

  if (!imp_uid || !merchant_uid) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // PortOne API로 결제 검증
  const portoneToken = await getPortoneToken()
  if (!portoneToken) {
    return NextResponse.json({ error: 'PortOne auth failed' }, { status: 500 })
  }

  const paymentRes = await fetch(
    `https://api.iamport.kr/payments/${imp_uid}`,
    { headers: { Authorization: portoneToken } }
  )
  const { response: payment } = await paymentRes.json()

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // merchant_uid에서 booking_id 추출 (형식: booking_{id})
  const bookingId = merchant_uid.replace('booking_', '')

  if (payment.status === 'paid') {
    // 결제 완료 처리
    await admin.from('payments').upsert({
      booking_id: bookingId,
      portone_payment_id: imp_uid,
      payment_method: payment.pay_method,
      amount_krw: payment.amount,
      status: 'paid',
      paid_at: new Date(payment.paid_at * 1000).toISOString(),
      receipt_url: payment.receipt_url,
    }, { onConflict: 'portone_payment_id' })

    await admin
      .from('bookings')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
  } else if (payment.status === 'cancelled') {
    await admin
      .from('payments')
      .update({ status: 'refunded' })
      .eq('portone_payment_id', imp_uid)

    await admin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
  }

  return NextResponse.json({ success: true })
}

async function getPortoneToken(): Promise<string | null> {
  const res = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: process.env.PORTONE_API_KEY,
      imp_secret: process.env.PORTONE_API_SECRET,
    }),
  })
  const { response } = await res.json()
  return response?.access_token ?? null
}
