import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const body = await request.json()
  const { type, data } = body

  if (!type || !data?.paymentId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const paymentId = data.paymentId

  const portoneRes = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
    }
  )
  if (!portoneRes.ok) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }
  const payment = await portoneRes.json()

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // paymentId 형식: booking_{id} 또는 booking_{id}_r{timestamp}
  const bookingId = payment.customData?.bookingId
    ?? paymentId.replace(/^booking_/, '').replace(/_r\d+$/, '')

  if (payment.status === 'PAID') {
    await admin.from('payments').upsert({
      booking_id: bookingId,
      portone_payment_id: paymentId,
      payment_method: payment.method?.type ?? 'unknown',
      amount_krw: payment.amount.total,
      currency: payment.currency,
      status: 'paid',
      paid_at: payment.paidAt,
      receipt_url: payment.receiptUrl ?? null,
    }, { onConflict: 'portone_payment_id' })

    await admin
      .from('bookings')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
  } else if (payment.status === 'CANCELLED') {
    await admin
      .from('payments')
      .update({ status: 'refunded' })
      .eq('portone_payment_id', paymentId)

    await admin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
  }

  return NextResponse.json({ success: true })
}
