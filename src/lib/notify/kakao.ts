/**
 * 카카오톡 알림톡 발송 (SOLAPI 사용)
 * https://solapi.com
 *
 * 설정 방법:
 * 1. SOLAPI 가입 후 API Key/Secret 발급
 * 2. 카카오 채널 연결 (카카오 비즈니스 채널 필요)
 * 3. 알림톡 템플릿 등록/승인
 * 4. .env.local에 아래 변수 추가:
 *    SOLAPI_API_KEY=...
 *    SOLAPI_API_SECRET=...
 *    SOLAPI_SENDER_NUMBER=070-xxxx-xxxx
 *    SOLAPI_KAKAO_PF_ID=_xxxxx  (카카오 채널 검색용 ID)
 *    SOLAPI_TEMPLATE_BOOKING_CONFIRMED=KA01TP...
 */

import crypto from 'crypto'

interface AlimtalkMessage {
  to: string
  templateId: string
  variables: Record<string, string>
  failoverSms?: {
    content: string
  }
}

async function sendAlimtalk(msg: AlimtalkMessage): Promise<void> {
  const apiKey = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET

  if (!apiKey || !apiSecret) {
    console.warn('[KakaoNotify] SOLAPI credentials not set – skipping notification')
    return
  }

  const date = new Date().toISOString()
  const salt = crypto.randomBytes(16).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')

  const payload = {
    message: {
      to: msg.to.replace(/-/g, ''),
      from: process.env.SOLAPI_SENDER_NUMBER,
      kakaoOptions: {
        pfId: process.env.SOLAPI_KAKAO_PF_ID,
        templateId: msg.templateId,
        variables: msg.variables,
      },
      ...(msg.failoverSms && {
        type: 'ATA', // 알림톡 + SMS fallback
        text: msg.failoverSms.content,
      }),
    },
  }

  const res = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[KakaoNotify] SOLAPI error:', err)
  }
}

// ── 예약 확정 알림 ─────────────────────────────────────────
export async function sendBookingConfirmedNotification(params: {
  phone: string
  name: string
  bookingNumber: string
  tourTitle: string
  date: string
  participants: number
  totalAmount: number
}) {
  await sendAlimtalk({
    to: params.phone,
    templateId: process.env.SOLAPI_TEMPLATE_BOOKING_CONFIRMED ?? '',
    variables: {
      '#{고객명}': params.name,
      '#{예약번호}': params.bookingNumber,
      '#{투어명}': params.tourTitle,
      '#{날짜}': params.date,
      '#{인원}': `${params.participants}명`,
      '#{결제금액}': new Intl.NumberFormat('ko-KR').format(params.totalAmount) + '원',
    },
    failoverSms: {
      content: `[바이크투어] ${params.name}님, 예약이 확정되었습니다.\n예약번호: ${params.bookingNumber}\n투어: ${params.tourTitle}\n날짜: ${params.date}\n인원: ${params.participants}명\n결제금액: ${new Intl.NumberFormat('ko-KR').format(params.totalAmount)}원`,
    },
  })
}

// ── 예약 취소 알림 ─────────────────────────────────────────
export async function sendBookingCancelledNotification(params: {
  phone: string
  name: string
  bookingNumber: string
  tourTitle: string
}) {
  await sendAlimtalk({
    to: params.phone,
    templateId: process.env.SOLAPI_TEMPLATE_BOOKING_CANCELLED ?? '',
    variables: {
      '#{고객명}': params.name,
      '#{예약번호}': params.bookingNumber,
      '#{투어명}': params.tourTitle,
    },
    failoverSms: {
      content: `[바이크투어] ${params.name}님, ${params.bookingNumber} 예약이 취소되었습니다.`,
    },
  })
}
