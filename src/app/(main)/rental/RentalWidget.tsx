'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bike, Calendar, Clock, CheckCircle, MessageSquare, Phone } from 'lucide-react'
import Link from 'next/link'
import { RENTAL_PRICES, type BikeRentalPrice } from '@/lib/rental-prices'
import { BANK_ACCOUNT, PAYMENT_LABEL_CARD, PAYMENT_LABEL_PAYPAL, PAYMENT_LABEL_BANK } from '@/lib/constants'
import { createRentalBooking, confirmRentalBooking } from '@/lib/actions/rental'
import RentalCalendarPicker from '@/components/ui/RentalCalendarPicker'
import toast from 'react-hot-toast'

const FMT = new Intl.NumberFormat('ko-KR')

const DURATION_OPTIONS = [
  { id: '24h',     label: '24시간', sublabel: '1일', days: 1 },
  { id: '48h',     label: '48시간', sublabel: '2일', days: 2 },
  { id: '72h',     label: '72시간', sublabel: '3일', days: 3 },
  { id: 'inquiry', label: '장기',   sublabel: '4일+', days: 0 },
]

function getBikeRate(bike: BikeRentalPrice, days: number): number {
  if (days >= 3) return bike.h72
  if (days >= 2) return bike.h48
  return bike.h24
}

// ── 결제수단 정의 ──────────────────────────────────────────
const CARD_METHOD = {
  ...PAYMENT_LABEL_CARD,
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD,
  currency: 'KRW' as const,
}

const PAYPAL_METHOD = {
  ...PAYMENT_LABEL_PAYPAL,
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_PAYPAL,
  currency: 'USD' as const,
}

// 결제 처리용 — channelKey 유효한 것만
const ONLINE_PAYMENT_METHODS = [CARD_METHOD, PAYPAL_METHOD]
  .filter((m) => m.channelKey && !m.channelKey.startsWith('your_'))

// 표시용 — 계좌이체 상단, 이니시스·페이팔은 테스트 섹션(하단)으로 별도 처리
const ALL_PAYMENT_OPTIONS = [
  { ...PAYMENT_LABEL_BANK },
  CARD_METHOD,
  PAYPAL_METHOD,
]

export default function RentalWidget({
  isLoggedIn,
  userInfo,
  initialBikeId,
}: {
  isLoggedIn: boolean
  userInfo?: { name: string; email: string; phone: string }
  initialBikeId?: string
}) {
  const router = useRouter()

  const [selectedBikeId, setSelectedBikeId]   = useState(initialBikeId ?? '')
  const [startDate, setStartDate]             = useState('')
  const [durationId, setDurationId]           = useState<string>('24h')
  const [wantExtraBattery, setWantExtraBattery] = useState(false)
  const [showForm, setShowForm]               = useState(false)
  const [name, setName]                       = useState(userInfo?.name ?? '')
  const [phone, setPhone]                     = useState(userInfo?.phone ?? '')
  const [email, setEmail]                     = useState(userInfo?.email ?? '')
  const [requests, setRequests]               = useState('')
  const [paymentMethod, setPaymentMethod]     = useState<string>(ALL_PAYMENT_OPTIONS[0]?.id ?? 'card')
  const [loading, setLoading]                 = useState(false)
  const [bookingNumber, setBookingNumber]     = useState('')

  const selectedBike  = RENTAL_PRICES.find((b) => b.bikeId === selectedBikeId)
  const duration      = DURATION_OPTIONS.find((d) => d.id === durationId)!
  const isInquiry     = durationId === 'inquiry'
  const dailyRate     = (!isInquiry && selectedBike) ? getBikeRate(selectedBike, duration.days) : 0
  const batteryFee    = (selectedBike?.isEbike && wantExtraBattery && selectedBike.extraBattery > 0)
    ? selectedBike.extraBattery : 0
  const total         = dailyRate * duration.days + batteryFee

  const isPayPal      = paymentMethod === 'paypal'
  const isBankTransfer = paymentMethod === 'bank'
  const totalUsdCents = Math.round((total / 1350) * 100)

  const needsPhone = isLoggedIn && !userInfo?.phone

  function handleBookClick() {
    if (!selectedBikeId) { toast.error('자전거를 선택해 주세요.'); return }
    if (!startDate)      { toast.error('시작일을 선택해 주세요.'); return }
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBike) return
    if (!name.trim())  { toast.error('이름을 입력해 주세요.'); return }
    if (!phone.trim()) { toast.error('연락처를 입력해 주세요.'); return }
    if (!email.trim()) { toast.error('이메일을 입력해 주세요.'); return }

    setLoading(true)
    try {
      const bookingResult = await createRentalBooking({
        bikeId: selectedBike.bikeId,
        bikeName: selectedBike.model,
        bikeBrand: selectedBike.brand,
        startDate,
        durationDays: duration.days,
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
        specialRequests: requests || undefined,
        isBankTransfer,
      })
      if (bookingResult.error || !bookingResult.data) {
        toast.error(bookingResult.error ?? '예약 생성 실패')
        setLoading(false)
        return
      }
      const bookingId = bookingResult.data.id

      // 계좌 입금: PortOne 없이 예약 생성만 하고 종료
      if (isBankTransfer) {
        setBookingNumber(bookingResult.data.booking_number)
        toast.success('입금 예약 신청이 완료되었습니다!')
        return
      }

      const selectedMethod = ONLINE_PAYMENT_METHODS.find((m) => m.id === paymentMethod)
      if (!selectedMethod?.channelKey) {
        toast.error('결제 수단 채널키가 설정되지 않았습니다. 관리자에게 문의해 주세요.')
        setLoading(false)
        return
      }
      const PortOne = await import('@portone/browser-sdk/v2')
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: selectedMethod?.channelKey ?? '',
        paymentId: `rn${bookingId.replace(/-/g, '')}`,
        orderName: `${selectedBike.brand} ${selectedBike.model} 렌탈 ${duration.label}`,
        totalAmount: isPayPal ? totalUsdCents : total,
        currency: isPayPal ? 'CURRENCY_USD' : 'CURRENCY_KRW',
        payMethod: isPayPal ? 'PAYPAL' : 'CARD',
        customer: {
          fullName: name,
          email,
          phoneNumber: phone.replace(/-/g, ''),
        },
        customData: { bookingId },
      })

      if (!response || (response as { code?: string }).code !== undefined) {
        toast.error((response as { message?: string })?.message ?? '결제에 실패했습니다.')
        setLoading(false)
        return
      }

      const confirmResult = await confirmRentalBooking(bookingId, {
        paymentId: (response as { paymentId: string }).paymentId,
        method: paymentMethod,
        expectedAmount: isPayPal ? totalUsdCents : total,
        currency: isPayPal ? 'USD' : 'KRW',
      })

      if (confirmResult.error) {
        toast.error(confirmResult.error)
        setLoading(false)
        return
      }

      setBookingNumber(confirmResult.bookingNumber ?? bookingResult.data.booking_number)
      toast.success('결제가 완료되었습니다!')
    } catch (err) {
      console.error('[RentalWidget] 결제 오류:', err)
      toast.error(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ── 결제 완료 ───────────────────────────────────────────
  if (bookingNumber) {
    const resetForm = () => {
      setBookingNumber(''); setShowForm(false); setSelectedBikeId(''); setStartDate('')
      setDurationId('24h'); setWantExtraBattery(false)
      setName(userInfo?.name ?? ''); setPhone(userInfo?.phone ?? '')
      setEmail(userInfo?.email ?? ''); setRequests('')
      setPaymentMethod(ALL_PAYMENT_OPTIONS[0]?.id ?? 'card')
    }
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
        <h3 className="text-lg font-black text-zinc-900">
          {isBankTransfer ? '입금 예약 신청 완료!' : '결제 완료!'}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          예약번호 <span className="font-mono font-bold text-zinc-800">{bookingNumber}</span>
        </p>
        {isBankTransfer ? (
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 text-left space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-2">입금 계좌 정보</p>
            <p className="text-sm font-bold text-zinc-900">{BANK_ACCOUNT.bank}  {BANK_ACCOUNT.account}</p>
            <p className="text-xs text-zinc-500">예금주: {BANK_ACCOUNT.holder}</p>
            <p className="mt-3 rounded-lg bg-amber-50 border border-amber-100 p-2.5 text-xs text-amber-700 font-medium">
              입금 확인 후 관리자가 예약을 확정합니다.<br />카카오톡으로 확정 안내를 드립니다.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-zinc-400">예약이 확정되었습니다. 카카오톡 알림을 확인해 주세요.</p>
        )}

        {!isLoggedIn && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-left text-xs text-blue-700">
            <p className="font-semibold mb-1">예약번호를 꼭 기억해 두세요!</p>
            <p>
              나중에{' '}
              <Link href="/booking-lookup" className="font-semibold underline">예약조회</Link>
              에서 예약번호 + 연락처로 확인할 수 있고,{' '}
              <Link href={`/auth/signup?email=${encodeURIComponent(email)}`} className="font-semibold underline">회원가입</Link>
              하면 마이페이지에서 계속 관리할 수 있어요.
            </p>
          </div>
        )}

        <button onClick={resetForm} className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
          새 예약하기
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-md space-y-5">
      {!showForm ? (
        <>
          {/* 가격 헤더 */}
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">기간별 단가</p>
            <p className="text-3xl font-black text-zinc-900">
              {selectedBike && !isInquiry ? `${FMT.format(dailyRate)}원` : isInquiry ? '문의 필요' : '자전거 선택'}
            </p>
            {selectedBike && !isInquiry && (
              <p className="text-sm text-zinc-400 mt-0.5">
                {selectedBike.brand} {selectedBike.model} · 일 기준
              </p>
            )}
          </div>

          {/* 자전거 선택 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
              <Bike className="h-4 w-4 text-emerald-600" />
              자전거 선택
            </label>
            <select
              value={selectedBikeId}
              onChange={(e) => { setSelectedBikeId(e.target.value); setStartDate('') }}
              className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="">자전거를 선택하세요</option>
              {RENTAL_PRICES.map((b) => (
                <option key={b.bikeId} value={b.bikeId}>
                  {b.brand} {b.model} ({b.material} · {b.size})
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 선택 — 자전거 선택 후에만 표시 */}
          {selectedBikeId && (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              시작일
            </label>
            <RentalCalendarPicker value={startDate} onChange={setStartDate} bikeId={selectedBikeId} />
          </div>
          )}

          {/* 렌탈 시간 선택 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              렌탈 시간
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const rate = (!isInquiry && selectedBike && opt.days > 0)
                  ? getBikeRate(selectedBike, opt.days) * opt.days
                  : null
                const isSelected = durationId === opt.id
                const isInq = opt.id === 'inquiry'
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDurationId(opt.id)}
                    className={`flex flex-col items-center rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? isInq
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-sm font-black">{opt.label}</span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? (isInq ? 'text-amber-500' : 'text-emerald-500') : 'text-zinc-400'}`}>
                      {opt.sublabel}
                    </span>
                    {rate !== null && (
                      <span className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-emerald-600' : 'text-zinc-400'}`}>
                        {FMT.format(rate)}원
                      </span>
                    )}
                    {isInq && (
                      <span className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-amber-600' : 'text-zinc-400'}`}>
                        문의
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 추가 배터리 옵션 (전기자전거만) */}
          {selectedBike?.isEbike && selectedBike.extraBattery > 0 && !isInquiry && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 transition-all hover:border-amber-300">
                <input
                  type="checkbox"
                  checked={wantExtraBattery}
                  onChange={(e) => setWantExtraBattery(e.target.checked)}
                  className="h-4 w-4 accent-amber-500 shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-amber-800">추가 배터리 (+{FMT.format(selectedBike.extraBattery)}원)</p>
                  <p className="text-xs text-amber-600 mt-0.5">여분 배터리 1개 추가 제공</p>
                </div>
              </label>
            </div>
          )}

          {/* 금액 요약 (24/48/72h) */}
          {selectedBike && !isInquiry && (
            <div className="rounded-xl bg-zinc-50 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>{selectedBike.model} · {duration.label}({duration.sublabel})</span>
                <span>{FMT.format(dailyRate)}원 × {duration.days}일</span>
              </div>
              {batteryFee > 0 && (
                <div className="flex items-center justify-between text-sm text-amber-600">
                  <span>추가 배터리</span>
                  <span>+{FMT.format(batteryFee)}원</span>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-1.5 flex items-center justify-between font-black text-zinc-900">
                <span>합계</span>
                <span className="text-lg text-emerald-700">{FMT.format(total)}원</span>
              </div>
              <p className="text-[11px] text-zinc-400">헬멧 · 자물쇠 · 펌프 · 거치대 무상 포함</p>
            </div>
          )}

          {/* 72시간+ 문의 안내 */}
          {isInquiry && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-800 mb-1">4일 이상 장기 렌탈</p>
              <p className="text-xs text-amber-700 mb-3">별도 협의가 필요합니다. 아래로 바로 문의해 주세요.</p>
              <div className="flex flex-col gap-2">
                <a
                  href="tel:010-0000-0000"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  전화 문의
                </a>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-amber-300 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  채팅 / 온라인 문의
                </Link>
              </div>
            </div>
          )}

          {/* 예약하기 버튼 (24/48/72h만) */}
          {!isInquiry && (
            <button
              type="button"
              onClick={handleBookClick}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99]"
            >
              예약하기
            </button>
          )}

          {!isInquiry && (
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-zinc-200 py-3 text-sm font-bold text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              문의하기
            </Link>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-zinc-900">예약자 정보</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
              ← 돌아가기
            </button>
          </div>

          {/* 예약 요약 */}
          <div className="rounded-xl bg-zinc-50 p-3 text-sm space-y-1">
            <p className="font-semibold text-zinc-800">{selectedBike?.brand} {selectedBike?.model}</p>
            <p className="text-zinc-500">{startDate} · {duration.label}({duration.sublabel})</p>
            <p className="font-black text-emerald-700">{FMT.format(total)}원</p>
          </div>

          {isLoggedIn ? (
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 space-y-0.5">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">예약자 정보 (계정 기준)</p>
              <p className="text-sm font-semibold text-zinc-800">{name || '(이름 없음)'}</p>
              <p className="text-xs text-zinc-500">{email}</p>
              {phone && <p className="text-xs text-zinc-500">{phone}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">이름 *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                  className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">연락처 *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000"
                  className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">이메일 *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com"
                  className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </>
          )}
          {needsPhone && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600">연락처 *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000"
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600">요청사항</label>
            <textarea value={requests} onChange={(e) => setRequests(e.target.value)} placeholder="사이즈 문의, 픽업 장소 등" rows={2}
              className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none resize-none" />
          </div>

          {/* 결제 수단 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-600">결제 수단</p>

            {/* 계좌 입금 — 상단 */}
            <label className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${paymentMethod === 'bank' ? 'border-blue-400 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 bg-white'}`}>
              <input type="radio" name="rentalPayment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="mt-0.5 accent-blue-600" />
              <div>
                <p className={`text-sm font-bold ${paymentMethod === 'bank' ? 'text-blue-800' : 'text-zinc-800'}`}>{PAYMENT_LABEL_BANK.label}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{PAYMENT_LABEL_BANK.sublabel}</p>
              </div>
            </label>

            {/* 테스트 결제 섹션 — 하단 */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">🧪 테스트 결제 운영 중</p>
              <p className="text-[11px] text-amber-600">아래 결제 수단은 현재 테스트 중입니다. 결제를 완료하더라도 실결제 없이 즉시 취소 처리됩니다.</p>

              {/* 이니시스 (카드) */}
              <label className={`flex items-start gap-3 cursor-pointer rounded-lg border-2 px-3 py-2.5 transition-all ${paymentMethod === 'card' ? 'border-emerald-500 bg-white' : 'border-amber-200 bg-white hover:border-amber-300'}`}>
                <input type="radio" name="rentalPayment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="mt-0.5 accent-emerald-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-black" style={{background:'#FEE500',color:'#3A1D1D'}}>K pay</span>
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-black bg-[#03C75A] text-white">N pay</span>
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-black bg-[#0064FF] text-white">toss</span>
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-200 text-zinc-700">카드</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">테스트</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">카카오페이 · 네이버페이 · 토스 · 신용카드</p>
                </div>
              </label>

              {/* PayPal */}
              <label className={`flex items-start gap-3 cursor-pointer rounded-lg border-2 px-3 py-2.5 transition-all ${paymentMethod === 'paypal' ? 'border-emerald-500 bg-white' : 'border-amber-200 bg-white hover:border-amber-300'}`}>
                <input type="radio" name="rentalPayment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="mt-0.5 accent-emerald-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-black bg-[#003087] text-white">PayPal</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">테스트</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    PayPal · USD 환산 결제 (해외 카드)
                    {paymentMethod === 'paypal' && ` · 약 $${(totalUsdCents / 100).toFixed(2)}`}
                  </p>
                </div>
              </label>
            </div>
            {isBankTransfer && (
              <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 space-y-0.5">
                <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wide mb-1">입금 계좌</p>
                <p className="text-sm font-bold text-zinc-900">{BANK_ACCOUNT.bank}  {BANK_ACCOUNT.account}</p>
                <p className="text-xs text-zinc-500">예금주: {BANK_ACCOUNT.holder}</p>
                <p className="mt-2 text-xs text-amber-700">예약 신청 후 입금하시면 관리자가 확인 후 예약을 확정합니다.</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '처리 중...' : isBankTransfer ? `입금 예약 신청하기 (${FMT.format(total)}원)` : `${FMT.format(total)}원 결제하기`}
          </button>
        </form>
      )}
    </div>
  )
}
