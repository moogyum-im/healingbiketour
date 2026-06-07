'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, FileText, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import Button from '@/components/ui/Button'
import { formatPrice, formatDuration, formatDistance } from '@/utils/format'
import Image from 'next/image'
import { createBooking, confirmBooking } from '@/lib/actions/booking'
import toast from 'react-hot-toast'
import type { Tour } from '@/types'

// ── 결제수단 로고 SVG ───────────────────────────────────────
function KakaoPayLogo() {
  return (
    <svg viewBox="0 0 60 24" fill="none" className="h-5 w-auto">
      <rect width="60" height="24" rx="4" fill="#FEE500"/>
      <text x="6" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="11" fill="#3A1D1D">kakao</text>
      <text x="37" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="11" fill="#3A1D1D">pay</text>
    </svg>
  )
}

function NaverPayLogo() {
  return (
    <svg viewBox="0 0 72 24" fill="none" className="h-5 w-auto">
      <rect width="72" height="24" rx="4" fill="#03C75A"/>
      <text x="6" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="11" fill="#FFFFFF">NAVER</text>
      <text x="44" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="11" fill="#FFFFFF">Pay</text>
    </svg>
  )
}

function CardLogo() {
  return (
    <svg viewBox="0 0 32 24" fill="none" className="h-5 w-auto">
      <rect width="32" height="24" rx="3" fill="#1A1F71"/>
      <rect y="6" width="32" height="5" fill="#F7B600"/>
      <rect x="3" y="16" width="8" height="2" rx="1" fill="white" fillOpacity="0.7"/>
      <rect x="13" y="16" width="5" height="2" rx="1" fill="white" fillOpacity="0.4"/>
    </svg>
  )
}

const PAYMENT_METHODS = [
  {
    id: 'kakaopay',
    label: '카카오페이',
    logo: <KakaoPayLogo />,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_KAKAOPAY,
  },
  {
    id: 'naverpay',
    label: '네이버페이',
    logo: <NaverPayLogo />,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_NAVERPAY,
  },
  {
    id: 'card',
    label: '일반 결제',
    logo: <CardLogo />,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD,
  },
]

export default function BookingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tourId      = searchParams.get('tour') ?? ''
  const date        = searchParams.get('date') ?? ''
  const participants = Number(searchParams.get('participants') ?? 1)
  const resumeId    = searchParams.get('resume') ?? ''   // 결제 이어하기

  const [tour, setTour] = useState<Tour | null>(null)
  const [tourLoading, setTourLoading] = useState(true)
  const [resumeAmount, setResumeAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('kakaopay')
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', requests: '' })

  // 투어 정보 로드 (또는 resume 시 기존 예약 로드)
  useEffect(() => {
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    if (resumeId) {
      // 기존 예약 정보로 투어/금액 복원
      sb.from('bookings')
        .select('total_amount_krw, contact_name, contact_email, contact_phone, tours(*)')
        .eq('id', resumeId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setTour((data as any).tours as Tour)
            setResumeAmount(data.total_amount_krw)
            setForm({
              name: data.contact_name ?? '',
              email: data.contact_email ?? '',
              phone: data.contact_phone ?? '',
              requests: '',
            })
          }
          setTourLoading(false)
        })
    } else {
      if (!tourId) { setTourLoading(false); return }
      sb.from('tours').select('*').eq('id', tourId).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setTour(data as unknown as Tour)
            setSelectedOptionId((data as any).options?.[0]?.id ?? '')
          }
          setTourLoading(false)
        })
    }
  }, [tourId, resumeId])

  // 로그인 유저 정보 자동 입력 (신규 예약 시만)
  useEffect(() => {
    if (resumeId) return
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata ?? {}
      setForm((prev) => ({
        ...prev,
        name:  prev.name  || meta.full_name || meta.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || meta.phone || '',
      }))
    })
  }, [resumeId])

  if (tourLoading) {
    return <div className="py-20 text-center text-zinc-400 text-sm">로딩 중...</div>
  }

  if (!tour) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">투어 정보를 찾을 수 없습니다.</p>
        <Button className="mt-4" onClick={() => router.push('/tours')} variant="outline">투어 목록으로</Button>
      </div>
    )
  }

  const selectedOption = tour.options?.find((o) => o.id === selectedOptionId)
  const total = resumeAmount ?? (
    (tour.price_krw + (selectedOption?.price_modifier_krw ?? 0)) * participants +
    (selectedOption?.flat_fee_krw ?? 0)
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) {
      toast.error('필수 정보를 모두 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      let bookingId: string

      if (resumeId) {
        // 기존 예약 이어하기 — 새로 생성하지 않음
        bookingId = resumeId
      } else {
        const bookingResult = await createBooking({
          tourId: tour.id,
          participants,
          date,
          contactName: form.name,
          contactEmail: form.email,
          contactPhone: form.phone,
          specialRequests: form.requests,
          totalAmountKrw: total,
        })
        if (bookingResult.error || !bookingResult.data) {
          toast.error(bookingResult.error ?? '예약 생성 실패')
          setLoading(false)
          return
        }
        bookingId = bookingResult.data.id
      }

      const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)
      const PortOne = await import('@portone/browser-sdk/v2')
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: selectedMethod?.channelKey ?? '',
        paymentId: `booking_${bookingId}${resumeId ? `_r${Date.now()}` : ''}`,
        orderName: tour.title,
        totalAmount: total,
        currency: 'CURRENCY_KRW' as const,
        payMethod: paymentMethod === 'card' ? 'CARD' : 'EASY_PAY',
        customer: {
          fullName: form.name,
          email: form.email,
          phoneNumber: form.phone.replace(/-/g, ''),
        },
      })

      if (!response || response.code !== undefined) {
        toast.error((response as { message?: string })?.message ?? '결제에 실패했습니다.')
        setLoading(false)
        return
      }

      const confirmResult = await confirmBooking(bookingId, {
        paymentId: (response as { paymentId: string }).paymentId,
        method: paymentMethod,
      })

      if (confirmResult.error) {
        toast.error(confirmResult.error)
        setLoading(false)
        return
      }

      toast.success('결제가 완료되었습니다! 카카오톡 알림을 확인해주세요.')
      router.push('/my/bookings?booked=success')
    } catch (err) {
      console.error(err)
      toast.error('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 폼 */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* resume 배너 */}
          {resumeId && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
              이전에 중단된 예약입니다. 결제 수단을 선택하고 결제를 완료해주세요.
            </div>
          )}

          {/* 예약자 정보 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">예약자 정보</h2>
            <div className="space-y-4">
              {[
                { key: 'name',  label: '예약자 이름', icon: User,     type: 'text',  placeholder: '홍길동' },
                { key: 'email', label: '이메일',       icon: Mail,     type: 'email', placeholder: 'example@email.com' },
                { key: 'phone', label: '연락처',       icon: Phone,    type: 'tel',   placeholder: '010-0000-0000' },
              ].map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              ))}
              {!resumeId && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    특별 요청사항 <span className="text-zinc-400 font-normal">(선택)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <textarea
                      rows={3}
                      placeholder="알레르기, 신체적 제한 사항 등을 알려주세요"
                      value={form.requests}
                      onChange={(e) => setForm({ ...form, requests: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm resize-none focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 코스 옵션 (신규 예약만) */}
          {!resumeId && tour.options && tour.options.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">코스 옵션</h2>
              <div className="space-y-3">
                {tour.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 cursor-pointer rounded-xl border border-zinc-200 p-4 hover:border-emerald-400 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="tourOption"
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={() => setSelectedOptionId(option.id)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-800">{option.label}</span>
                        <span className="text-sm font-semibold text-emerald-700">
                          {option.flat_fee_krw ? `+용달비 ${option.flat_fee_krw.toLocaleString()}원` : '추가 요금 없음'}
                        </span>
                      </div>
                      {option.description && <p className="mt-0.5 text-xs text-zinc-500">{option.description}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 결제 수단 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">결제 수단</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === method.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-emerald-600"
                  />
                  {method.logo}
                  <span className={`text-sm font-semibold ${paymentMethod === method.id ? 'text-emerald-800' : 'text-zinc-700'}`}>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {formatPrice(total)} 결제하기
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            결제 완료 후 카카오톡으로 예약 확인 알림이 발송됩니다.
          </div>
        </form>
      </div>

      {/* 예약 요약 */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          {tour.thumbnail_url && (
            <div className="relative h-44">
              <Image src={tour.thumbnail_url} alt={tour.title} fill className="object-cover" />
            </div>
          )}
          <div className="p-5 space-y-4">
            <h3 className="font-bold text-zinc-900">{tour.title}</h3>
            <div className="text-sm text-zinc-500 space-y-1.5">
              {[
                ['날짜', date ? new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) : (resumeId ? '기존 예약' : '-')],
                ['인원', `${participants}명`],
                ['소요 시간', formatDuration(tour.duration_hours)],
                ['거리', formatDistance(tour.distance_km)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-medium text-zinc-700">{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 pt-4">
              <div className="flex justify-between font-bold text-zinc-900">
                <span>총 결제금액</span>
                <span className="text-emerald-700">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
