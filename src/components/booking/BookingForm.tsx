'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, FileText, CheckCircle, Building2, CopyCheck, Copy, CreditCard, Globe } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import Button from '@/components/ui/Button'
import { formatPrice, formatDuration, formatDistance } from '@/utils/format'
import Image from 'next/image'
import { createBooking } from '@/lib/actions/booking'
import toast from 'react-hot-toast'
import type { Tour } from '@/types'
import { BANK_ACCOUNT, BANK_ACCOUNT_FOREIGN } from '@/lib/constants'
import { useLocale } from 'next-intl'

export default function BookingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const isKo = locale === 'ko'
  const account = isKo ? BANK_ACCOUNT : BANK_ACCOUNT_FOREIGN

  const tourId       = searchParams.get('tour') ?? ''
  const date         = searchParams.get('date') ?? ''
  const participants = Number(searchParams.get('participants') ?? 1)

  const [tour, setTour] = useState<Tour | null>(null)
  const [tourLoading, setTourLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', requests: '' })
  const [copied, setCopied] = useState(false)
  const [nationality, setNationality] = useState<'korean' | 'foreign'>('korean')
  const [passportNumber, setPassportNumber] = useState('')

  useEffect(() => {
    if (!tourId) { setTourLoading(false); return }
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    sb.from('tours').select('*').eq('id', tourId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTour(data as unknown as Tour)
          setSelectedOptionId((data as any).options?.[0]?.id ?? '')
        }
        setTourLoading(false)
      })
  }, [tourId])

  useEffect(() => {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
  }, [])

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
  const total = (tour.price_krw + (selectedOption?.price_modifier_krw ?? 0)) * participants +
    (selectedOption?.flat_fee_krw ?? 0)

  const copyAccount = () => {
    navigator.clipboard.writeText(account.account)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) {
      toast.error('필수 정보를 모두 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      if (nationality === 'foreign' && !passportNumber.trim()) {
        toast.error(isKo ? '여권 번호를 입력해주세요.' : 'Please enter your passport number.')
        return
      }
      const result = await createBooking({
        tourId: tour.id,
        participants,
        date,
        contactName: form.name,
        contactEmail: form.email,
        contactPhone: form.phone,
        specialRequests: form.requests,
        totalAmountKrw: total,
        nationality,
        passportNumber: nationality === 'foreign' ? passportNumber.trim() : undefined,
      })
      if (result.error || !result.data) {
        toast.error(result.error ?? '예약 신청 실패')
        return
      }
      setSubmitted(true)
    } catch (err) {
      console.error('[BookingForm]', err)
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /* ── 신청 완료 화면 ── */
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-black text-zinc-900">
            {isKo ? '예약 신청이 완료되었습니다!' : 'Booking Request Submitted!'}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {isKo
              ? <>아래 계좌로 입금해 주시면 확인 후 예약이 확정됩니다.<br />입금자명을 <span className="font-bold text-zinc-800">{form.name}</span>으로 해주세요.</>
              : <>Please transfer to the account below. Your booking will be confirmed once payment is verified.<br />Use your name <span className="font-bold text-zinc-800">{form.name}</span> as the sender name.</>
            }
          </p>
        </div>

        {/* 계좌 안내 */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-800">
            <Building2 className="h-4 w-4 text-emerald-600" />
            {isKo ? '입금 계좌 안내' : 'Bank Transfer Details'}
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">{isKo ? '은행' : 'Bank'}</span>
              <span className="font-semibold text-zinc-800">{account.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">{isKo ? '계좌번호' : 'Account No.'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-zinc-900 text-base tracking-wide">{account.account}</span>
                <button
                  onClick={copyAccount}
                  className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {copied ? <CopyCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '복사' : 'Copy')}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">{isKo ? '예금주' : 'Account Holder'}</span>
              <span className="font-semibold text-zinc-800">{account.holder}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 mt-2">
              <span className="text-zinc-500">{isKo ? '입금 금액' : 'Amount'}</span>
              <span className="font-black text-emerald-700 text-base">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 text-center leading-relaxed">
            {isKo
              ? <>입금 확인 후 카카오톡 또는 이메일로 예약 확정 안내를 드립니다.<br />문의: <a href="tel:02-6265-2600" className="text-emerald-600 font-semibold">02-6265-2600</a></>
              : <>Your booking will be confirmed by email once payment is received.<br />Inquiries: <a href="mailto:healingbiketour@gmail.com" className="text-emerald-600 font-semibold">healingbiketour@gmail.com</a></>
            }
          </p>
        </div>

        <Button
          className="mt-6 w-full"
          variant="outline"
          onClick={() => router.push('/tours')}
        >
          {isKo ? '투어 목록으로 돌아가기' : 'Back to Tours'}
        </Button>
      </div>
    )
  }

  /* ── 예약 입력 폼 ── */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 예약자 정보 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">{isKo ? '예약자 정보' : 'Booking Information'}</h2>
            <div className="space-y-4">
              {[
                { key: 'name',  label: isKo ? '예약자 이름' : 'Full Name', icon: User,  type: 'text',  placeholder: isKo ? '홍길동' : 'John Doe' },
                { key: 'email', label: isKo ? '이메일' : 'Email',        icon: Mail,  type: 'email', placeholder: 'example@email.com' },
                { key: 'phone', label: isKo ? '연락처' : 'Phone',        icon: Phone, type: 'tel',   placeholder: isKo ? '010-0000-0000' : '+82-10-0000-0000' },
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
              <div>
                {/* 국적 선택 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    {isKo ? '국적' : 'Nationality'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'korean' as const, icon: CreditCard, label: isKo ? '내국인 (한국인)' : 'Korean Citizen' },
                      { val: 'foreign' as const, icon: Globe,      label: isKo ? '외국인' : 'Foreign Visitor' },
                    ].map(({ val, icon: Icon, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNationality(val)}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                          nationality === val
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 신분증 / 여권 안내 */}
                {nationality === 'korean' ? (
                  <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                    <CreditCard className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <p>
                      {isKo
                        ? '보험 적용을 위해 투어 당일 반드시 신분증(주민등록증 또는 운전면허증)을 지참해 주세요.'
                        : 'Please bring your national ID (resident registration card or driver\'s license) on the day of the tour for insurance purposes.'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                      <Globe className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <p>
                        {isKo
                          ? '보험 적용을 위해 투어 당일 반드시 여권을 지참해 주세요.'
                          : 'Please bring your passport on the day of the tour for insurance purposes.'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                        {isKo ? '여권 번호' : 'Passport Number'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="text"
                          required
                          placeholder={isKo ? 'M12345678' : 'M12345678'}
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                          className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm font-mono uppercase focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </>
                )}

                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {isKo ? '특별 요청사항' : 'Special Requests'}{' '}
                  <span className="text-zinc-400 font-normal">{isKo ? '(선택)' : '(optional)'}</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <textarea
                    rows={3}
                    placeholder={isKo ? '알레르기, 신체적 제한 사항 등을 알려주세요' : 'Allergies, physical limitations, or other requests'}
                    value={form.requests}
                    onChange={(e) => setForm({ ...form, requests: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm resize-none focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 코스 옵션 */}
          {tour.options && tour.options.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">{isKo ? '코스 옵션' : 'Course Option'}</h2>
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

          {/* 결제 수단 — 계좌 입금 고정 안내 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-zinc-900">{isKo ? '결제 수단' : 'Payment Method'}</h2>
            </div>
            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-sm font-bold text-emerald-800">{isKo ? '계좌 입금' : 'Bank Transfer'}</span>
              </div>
              <div className="rounded-lg bg-white border border-emerald-200 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">{isKo ? '은행' : 'Bank'}</span>
                  <span className="font-semibold text-zinc-800">{account.bank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">{isKo ? '계좌번호' : 'Account No.'}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-zinc-900 tracking-wide">{account.account}</span>
                    <button
                      type="button"
                      onClick={copyAccount}
                      className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      {copied ? <CopyCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '복사' : 'Copy')}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{isKo ? '예금주' : 'Account Holder'}</span>
                  <span className="font-semibold text-zinc-800">{account.holder}</span>
                </div>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                {isKo
                  ? '입금 확인 후 예약이 확정됩니다 — 카카오톡 또는 이메일로 안내해 드립니다.'
                  : 'Your booking is confirmed once payment is verified — we\'ll notify you by email.'
                }
              </p>
            </div>
            <p className="mt-3 text-xs text-zinc-400 text-center">
              {isKo
                ? '카카오페이 · 네이버페이 · 토스 · 신용카드 · PayPal — 준비 중'
                : 'KakaoPay · NaverPay · Toss · Credit Card · PayPal — Coming Soon'
              }
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {isKo ? '예약 신청하기' : 'Submit Booking Request'}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            {isKo
              ? '신청 후 계좌로 입금하시면 확인 후 예약이 확정됩니다.'
              : 'Transfer to the account above — your booking is confirmed once payment is verified.'
            }
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
                [isKo ? '날짜' : 'Date', date ? new Date(date + 'T00:00:00').toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' }) : '-'],
                [isKo ? '인원' : 'Participants', isKo ? `${participants}명` : `${participants} person${participants > 1 ? 's' : ''}`],
                [isKo ? '소요 시간' : 'Duration', formatDuration(tour.duration_hours)],
                [isKo ? '거리' : 'Distance', formatDistance(tour.distance_km)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-medium text-zinc-700">{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 pt-4">
              <div className="flex justify-between font-bold text-zinc-900">
                <span>{isKo ? '총 결제금액' : 'Total'}</span>
                <span className="text-emerald-700">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
