'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, FileText, CheckCircle, Gift } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import Button from '@/components/ui/Button'
import { formatPrice, formatDuration, formatDistance } from '@/utils/format'
import Image from 'next/image'
import { createBooking, confirmBooking, confirmBookingWithCredit } from '@/lib/actions/booking'
import toast from 'react-hot-toast'
import type { Tour } from '@/types'
import { PAYMENT_LABEL_CARD, PAYMENT_LABEL_PAYPAL } from '@/lib/constants'

const ALL_PAYMENT_METHODS = [
  { ...PAYMENT_LABEL_CARD,   channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD,   currency: 'CURRENCY_KRW' as const },
  { ...PAYMENT_LABEL_PAYPAL, channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_PAYPAL, currency: 'CURRENCY_USD' as const },
]

// 채널키가 설정된 수단만 노출
const PAYMENT_METHODS = ALL_PAYMENT_METHODS.filter(
  (m) => m.channelKey && !m.channelKey.startsWith('your_')
)

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
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]?.id ?? 'card')
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', requests: '' })
  const [creditBalance, setCreditBalance] = useState(0)
  const [useCredit, setUseCredit] = useState(false)
  const [creditToUse, setCreditToUse] = useState(0)

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

  // 로그인 유저 정보 + 크레딧 잔액 로드
  useEffect(() => {
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      if (!resumeId) {
        const meta = user.user_metadata ?? {}
        setForm((prev) => ({
          ...prev,
          name:  prev.name  || meta.full_name || meta.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || meta.phone || '',
        }))
      }
      // 크레딧 잔액 조회
      sb.from('credit_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setCreditBalance(data?.balance ?? 0))
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
  const maxCredit = Math.min(creditBalance, total)
  const actualCreditToUse = useCredit ? Math.min(creditToUse, maxCredit) : 0
  const payAmount = total - actualCreditToUse
  const isFullCredit = payAmount <= 0

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

      // 크레딧 전액 결제 (PortOne 생략)
      if (isFullCredit) {
        const confirmResult = await confirmBookingWithCredit(bookingId, actualCreditToUse)
        if (confirmResult.error) {
          toast.error(confirmResult.error)
          setLoading(false)
          return
        }
        toast.success('크레딧으로 결제가 완료되었습니다!')
        router.push('/my?booked=success')
        return
      }

      const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)
      if (!selectedMethod?.channelKey) {
        toast.error('결제 수단 채널키가 설정되지 않았습니다. 관리자에게 문의해 주세요.')
        setLoading(false)
        return
      }
      const isPayPal = paymentMethod === 'paypal'
      // PayPal은 USD 센트 단위 (1 USD = 1,350 KRW 기준)
      const payAmountUsd = Math.round((payAmount / 1350) * 100)

      const PortOne = await import('@portone/browser-sdk/v2')
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: selectedMethod?.channelKey ?? '',
        // KG 이니시스 oid 최대 40자 제한 — UUID 하이픈 제거 후 bk 접두사 사용 (34자)
        // resume 재시도는 r + 압축 UUID 22자 + timestamp 7자 = 30자
        paymentId: resumeId
          ? `r${bookingId.replace(/-/g, '').slice(0, 22)}${Date.now().toString(36).slice(-7)}`
          : `bk${bookingId.replace(/-/g, '')}`,
        orderName: tour.title,
        totalAmount: isPayPal ? payAmountUsd : payAmount,
        currency: isPayPal ? 'CURRENCY_USD' : 'CURRENCY_KRW',
        payMethod: paymentMethod === 'card' ? 'CARD' : isPayPal ? 'PAYPAL' : 'EASY_PAY',
        customer: {
          fullName: form.name,
          email: form.email,
          phoneNumber: form.phone.replace(/-/g, ''),
        },
        customData: { bookingId },
      })

      if (!response || response.code !== undefined) {
        toast.error((response as { message?: string })?.message ?? '결제에 실패했습니다.')
        setLoading(false)
        return
      }

      const confirmResult = await confirmBooking(bookingId, {
        paymentId: (response as { paymentId: string }).paymentId,
        method: paymentMethod,
        creditAmount: actualCreditToUse,
      })

      if (confirmResult.error) {
        toast.error(confirmResult.error)
        setLoading(false)
        return
      }

      toast.success('결제가 완료되었습니다! 카카오톡 알림을 확인해주세요.')
      router.push('/my?booked=success')
    } catch (err) {
      console.error('[BookingForm] 결제 오류:', err)
      toast.error(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.')
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

          {/* 크레딧 사용 */}
          {creditBalance > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-zinc-900">크레딧 사용</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-zinc-500">보유 {creditBalance.toLocaleString()}C</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !useCredit
                      setUseCredit(next)
                      if (next) setCreditToUse(maxCredit)
                      else setCreditToUse(0)
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useCredit ? 'bg-emerald-500' : 'bg-zinc-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      useCredit ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>
              </div>
              {useCredit && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={maxCredit}
                      step={100}
                      value={creditToUse}
                      onChange={(e) => setCreditToUse(Number(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="text-sm font-bold text-emerald-700 w-24 text-right shrink-0">
                      {actualCreditToUse.toLocaleString()}C 사용
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setCreditToUse(maxCredit)}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      전액 사용 ({maxCredit.toLocaleString()}C)
                    </button>
                    <span className="text-zinc-500">
                      할인 후 결제금액:{' '}
                      <span className="font-bold text-zinc-900">
                        {isFullCredit ? '0원 (크레딧 전액 결제)' : `${payAmount.toLocaleString()}원`}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 결제 수단 */}
          <div className={`rounded-2xl border border-zinc-200 bg-white p-6 ${isFullCredit ? 'opacity-40 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-zinc-900 mb-4">결제 수단</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 cursor-pointer rounded-xl border-2 p-4 transition-all ${
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
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div>
                    <p className={`text-sm font-bold ${paymentMethod === method.id ? 'text-emerald-800' : 'text-zinc-800'}`}>
                      {method.label}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">{method.sublabel}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {isFullCredit
              ? `크레딧 ${actualCreditToUse.toLocaleString()}C로 결제하기`
              : `${formatPrice(payAmount)} 결제하기${actualCreditToUse > 0 ? ` (${actualCreditToUse.toLocaleString()}C 할인)` : ''}`
            }
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
            <div className="border-t border-zinc-100 pt-4 space-y-2">
              {actualCreditToUse > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" />
                    크레딧 할인
                  </span>
                  <span>-{actualCreditToUse.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-zinc-900">
                <span>총 결제금액</span>
                <div className="text-right">
                  {actualCreditToUse > 0 && (
                    <p className="text-xs text-zinc-400 line-through font-normal">{formatPrice(total)}</p>
                  )}
                  <span className="text-emerald-700">{isFullCredit ? '0원' : formatPrice(payAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
