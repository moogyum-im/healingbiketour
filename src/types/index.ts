// ============================================================
// 투어 관련 타입
// ============================================================
export interface Tour {
  id: string
  title: string
  title_en?: string
  slug: string
  description: string
  short_description: string
  category: TourCategory
  difficulty: TourDifficulty
  duration_hours: number
  distance_km: number
  max_participants: number
  price_krw: number
  price_usd?: number
  thumbnail_url: string
  images: string[]
  meeting_point: string
  meeting_point_lat?: number
  meeting_point_lng?: number
  includes: string[]
  excludes: string[]
  requirements: string[]
  highlights: string[]
  options?: TourOption[]
  translations?: Partial<Record<string, Partial<TourTranslation>>>
  sort_order?: number
  rating: number
  review_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TourCategory =
  | 'city'      // 도심 투어
  | 'coastal'   // 해안 투어
  | 'mountain'  // 산악 투어
  | 'cultural'  // 문화 투어
  | 'night'     // 야간 투어
  | 'family'    // 가족 투어
  | 'national'  // 국토종주

export type TourDifficulty = 'easy' | 'moderate' | 'hard'

export interface TourTranslation {
  title: string
  short_description: string
  description: string
  highlights: string[]
  includes: string[]
  excludes: string[]
  requirements: string[]
  meeting_point: string
}

export interface TourOption {
  id: string
  label: string
  label_en?: string
  description?: string
  price_modifier_krw: number   // 인당 추가금액
  flat_fee_krw?: number        // 1회 고정 추가금액 (예: 용달비)
  duration_hours?: number      // 해당 옵션의 소요시간
}

// ============================================================
// 투어 일정 타입
// ============================================================
export interface TourDate {
  id: string
  tour_id: string
  date: string           // YYYY-MM-DD
  start_time: string     // HH:MM
  end_time: string       // HH:MM
  available_slots: number
  booked_slots: number
  is_available: boolean
  created_at: string
}

// ============================================================
// 예약 관련 타입
// ============================================================
export interface Booking {
  id: string
  booking_number: string  // 예약번호 (BK-YYYYMMDD-XXXX)
  user_id: string
  tour_id: string
  tour_date_id: string
  status: BookingStatus
  participants: number
  total_amount_krw: number
  total_amount_usd?: number
  currency: 'KRW' | 'USD'
  contact_name: string
  contact_email: string
  contact_phone: string
  special_requests?: string
  tour?: Tour
  tour_date?: TourDate
  payment?: Payment
  created_at: string
  updated_at: string
}

export type BookingStatus =
  | 'pending'    // 결제 대기
  | 'confirmed'  // 예약 확정
  | 'cancelled'  // 취소됨
  | 'completed'  // 완료

// ============================================================
// 결제 관련 타입
// ============================================================
export interface Payment {
  id: string
  booking_id: string
  payment_method: PaymentMethod
  payment_key: string     // PortOne/PayPal 결제 키
  amount_krw: number
  amount_original?: number
  currency: string
  status: PaymentStatus
  paid_at?: string
  failed_reason?: string
  receipt_url?: string
  created_at: string
}

export type PaymentMethod =
  | 'kakaopay'
  | 'naverpay'
  | 'card'        // 신용카드/체크카드
  | 'paypal'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partial_refunded'

// ============================================================
// 사용자 타입
// ============================================================
export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  phone?: string
  nationality?: string
  provider: 'google' | 'kakao' | 'email'
  created_at: string
  updated_at: string
}

// ============================================================
// 리뷰 타입
// ============================================================
export interface Review {
  id: string
  tour_id: string
  user_id: string
  booking_id?: string | null
  rating: number          // 1-5
  content: string
  images?: string[]
  user?: UserProfile
  created_at: string
}

// ============================================================
// 크레딧 타입
// ============================================================
export type CreditType = 'review_reward' | 'admin_grant' | 'purchase_used' | 'refund' | 'expired'

export interface Credit {
  id: string
  user_id: string
  amount: number
  type: CreditType
  description?: string
  reference_id?: string
  expires_at?: string
  created_at: string
}

// ============================================================
// API 응답 타입
// ============================================================
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ============================================================
// 검색/필터 타입
// ============================================================
export interface TourFilters {
  category?: TourCategory
  difficulty?: TourDifficulty
  minPrice?: number
  maxPrice?: number
  duration?: string
  date?: string
  participants?: number
  search?: string
}
