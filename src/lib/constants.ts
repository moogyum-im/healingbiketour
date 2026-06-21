// 사이트 전역 공통 상수 — 한 곳만 수정하면 전체에 반영됩니다

export const BANK_ACCOUNT = {
  bank: '우리은행',
  account: '1005-804-894785',
  holder: '주식회사 힐링바이크투어',
} as const

// 결제수단 공통 라벨 (currency / channelKey 등은 각 파일에서 추가)
export const PAYMENT_LABEL_CARD = {
  id: 'card',
  label: '카카오페이 · 네이버페이 · 토스 · 신용카드',
  sublabel: 'KG이니시스 통합결제',
} as const

export const PAYMENT_LABEL_PAYPAL = {
  id: 'paypal',
  label: 'PayPal',
  sublabel: 'USD 환산 결제 (해외 카드)',
} as const

export const PAYMENT_LABEL_BANK = {
  id: 'bank',
  label: '계좌 입금',
  sublabel: '관리자 확인 후 예약 확정',
} as const
