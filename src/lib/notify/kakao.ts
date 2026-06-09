/**
 * 카카오톡 알림톡 발송 (SOLAPI)
 * https://solapi.com
 *
 * 필요한 환경변수 (.env.local):
 *   SOLAPI_API_KEY=...
 *   SOLAPI_API_SECRET=...
 *   SOLAPI_SENDER_NUMBER=070-xxxx-xxxx      (발신번호, 사전 등록 필요)
 *   SOLAPI_KAKAO_PF_ID=_xxxxxx              (카카오 채널 검색용 ID)
 *   SOLAPI_TEMPLATE_BOOKING_PENDING=KA01TP... (예약 접수 템플릿)
 *   SOLAPI_TEMPLATE_BOOKING_CONFIRMED=KA01TP...(결제 완료 템플릿)
 *   SOLAPI_TEMPLATE_BOOKING_CANCELLED=KA01TP..(예약 취소 템플릿)
 *   SOLAPI_ADMIN_PHONE=010-xxxx-xxxx        (사장님 연락처, 신규예약 알림용)
 */

import crypto from 'crypto'

interface AlimtalkMessage {
  to: string
  templateId: string
  variables: Record<string, string>
  failoverSms?: string
}

async function sendAlimtalk(msg: AlimtalkMessage): Promise<void> {
  const apiKey    = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET

  if (!apiKey || !apiSecret) {
    console.warn('[KakaoNotify] SOLAPI credentials not set – skipping')
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
        type: 'ATA',
        text: msg.failoverSms,
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
    console.error('[KakaoNotify] SOLAPI error:', await res.text())
  }
}

async function sendSms(to: string, content: string): Promise<void> {
  const apiKey    = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET
  if (!apiKey || !apiSecret) return

  const date = new Date().toISOString()
  const salt = crypto.randomBytes(16).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')

  const res = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({
      message: {
        to: to.replace(/-/g, ''),
        from: process.env.SOLAPI_SENDER_NUMBER,
        text: content,
      },
    }),
  })

  if (!res.ok) {
    console.error('[SMS] SOLAPI error:', await res.text())
  }
}

// ── 예약 접수 알림 (결제 전, 고객에게) ────────────────────────
export async function sendBookingPendingNotification(params: {
  phone: string
  name: string
  bookingNumber: string
  tourTitle: string
  date: string
  participants: number
  totalAmount: number
}) {
  const templateId = process.env.SOLAPI_TEMPLATE_BOOKING_PENDING
  const smsText = `[힐링바이크투어] ${params.name}님, 예약이 접수되었습니다.\n예약번호: ${params.bookingNumber}\n투어: ${params.tourTitle}\n날짜: ${params.date}\n인원: ${params.participants}명\n결제금액: ${params.totalAmount.toLocaleString('ko-KR')}원\n결제를 완료해 주세요.`

  if (templateId) {
    await sendAlimtalk({
      to: params.phone,
      templateId,
      variables: {
        '#{고객명}': params.name,
        '#{예약번호}': params.bookingNumber,
        '#{투어명}': params.tourTitle,
        '#{날짜}': params.date,
        '#{인원}': `${params.participants}명`,
        '#{결제금액}': `${params.totalAmount.toLocaleString('ko-KR')}원`,
      },
      failoverSms: smsText,
    })
  } else {
    // 템플릿 미등록 시 SMS fallback
    await sendSms(params.phone, smsText)
  }
}

// ── 결제 완료 / 예약 확정 알림 (고객에게) ──────────────────────
export async function sendBookingConfirmedNotification(params: {
  phone: string
  name: string
  bookingNumber: string
  tourTitle: string
  date: string
  participants: number
  totalAmount: number
}) {
  const templateId = process.env.SOLAPI_TEMPLATE_BOOKING_CONFIRMED
  const smsText = `[힐링바이크투어] ${params.name}님, 예약이 확정되었습니다!\n예약번호: ${params.bookingNumber}\n투어: ${params.tourTitle}\n날짜: ${params.date}\n인원: ${params.participants}명\n결제금액: ${params.totalAmount.toLocaleString('ko-KR')}원`

  if (templateId) {
    await sendAlimtalk({
      to: params.phone,
      templateId,
      variables: {
        '#{고객명}': params.name,
        '#{예약번호}': params.bookingNumber,
        '#{투어명}': params.tourTitle,
        '#{날짜}': params.date,
        '#{인원}': `${params.participants}명`,
        '#{결제금액}': `${params.totalAmount.toLocaleString('ko-KR')}원`,
      },
      failoverSms: smsText,
    })
  } else {
    await sendSms(params.phone, smsText)
  }
}

// ── 예약 취소 알림 (고객에게) ──────────────────────────────────
export async function sendBookingCancelledNotification(params: {
  phone: string
  name: string
  bookingNumber: string
  tourTitle: string
}) {
  const templateId = process.env.SOLAPI_TEMPLATE_BOOKING_CANCELLED
  const smsText = `[힐링바이크투어] ${params.name}님, ${params.bookingNumber} 예약이 취소되었습니다. 문의: 카카오채널 힐링바이크투어`

  if (templateId) {
    await sendAlimtalk({
      to: params.phone,
      templateId,
      variables: {
        '#{고객명}': params.name,
        '#{예약번호}': params.bookingNumber,
        '#{투어명}': params.tourTitle,
      },
      failoverSms: smsText,
    })
  } else {
    await sendSms(params.phone, smsText)
  }
}

// ── 신규 문의 알림 (사장님에게) ────────────────────────────────
export async function sendAdminContactNotification(params: {
  name?: string
  phone?: string
  message: string
}) {
  const adminPhone = process.env.SOLAPI_ADMIN_PHONE
  if (!adminPhone) return

  const preview = params.message.length > 60
    ? params.message.slice(0, 60) + '...'
    : params.message

  await sendSms(
    adminPhone,
    `[힐링바이크투어 신규문의]\n이름: ${params.name || '익명'}\n연락처: ${params.phone || '미입력'}\n내용: ${preview}`,
  )
}

// ── 신규 채팅 상담 알림 (사장님에게) ───────────────────────────
export async function sendAdminChatNotification(params: {
  name?: string
  phone?: string
  sourcePage?: string
}) {
  const adminPhone = process.env.SOLAPI_ADMIN_PHONE
  if (!adminPhone) return

  await sendSms(
    adminPhone,
    `[힐링바이크투어 채팅상담 요청]\n이름: ${params.name || '익명'}\n연락처: ${params.phone || '미입력'}\n페이지: ${params.sourcePage || '알 수 없음'}\n관리자 페이지에서 확인해 주세요.`,
  )
}

// ── 신규 예약 알림 (사장님에게) ────────────────────────────────
export async function sendAdminNewBookingNotification(params: {
  bookingNumber: string
  tourTitle: string
  date: string
  participants: number
  totalAmount: number
  contactName: string
  contactPhone: string
}) {
  const adminPhone = process.env.SOLAPI_ADMIN_PHONE
  if (!adminPhone) return

  await sendSms(
    adminPhone,
    `[힐링바이크투어 신규예약]\n예약번호: ${params.bookingNumber}\n투어: ${params.tourTitle}\n날짜: ${params.date}\n인원: ${params.participants}명\n금액: ${params.totalAmount.toLocaleString('ko-KR')}원\n고객: ${params.contactName} ${params.contactPhone}`,
  )
}
