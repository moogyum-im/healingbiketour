'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Minus, Plus, User, Bike, Gift, ArrowLeftRight, Clock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { Tour } from '@/types'
import Button from '@/components/ui/Button'
import CalendarPicker from '@/components/ui/CalendarPicker'
import { formatPrice } from '@/utils/format'

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  available_slots: number
  booked_slots: number
  is_available: boolean
}

interface BookingWidgetProps {
  tour: Tour
}

const BIKE_OPTIONS = [
  { id: 'city', label: '미니로드 / 로드', label_en: 'Mini Road / Road', emoji: '🚲', extra: 0 },
  { id: 'mtb', label: 'MTB', label_en: 'MTB', emoji: '🏔️', extra: 10000 },
  { id: 'ebike', label: '전기자전거', label_en: 'E-Bike', emoji: '⚡', extra: 15000 },
]

const ADDONS = [
  {
    id: 'guide',
    icon: User,
    label: '전문 영어 가이드',
    label_en: 'Expert English Guide',
    desc: '최대 10인 그룹, 영어 가능',
    price: 100000,
  },
]

export default function BookingWidget({ tour }: BookingWidgetProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [participants, setParticipants] = useState(1)
  const [bikeType, setBikeType] = useState('city')
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    tour.options?.[0]?.id ?? ''
  )
  const [addons, setAddons] = useState<Set<string>>(new Set())
  const [useCredits, setUseCredits] = useState(false)
  const MOCK_CREDIT_BALANCE = 0

  // 날짜 변경 시 시간 슬롯 로드
  useEffect(() => {
    setSelectedSlotId('')
    setTimeSlots([])
    if (!selectedDate) return

    setLoadingSlots(true)
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    sb.from('tour_dates')
      .select('id, start_time, end_time, available_slots, booked_slots, is_available')
      .eq('tour_id', tour.id)
      .eq('date', selectedDate)
      .eq('is_available', true)
      .order('start_time', { ascending: true })
      .then(({ data }) => {
        setTimeSlots(data ?? [])
        setLoadingSlots(false)
      })
  }, [selectedDate, tour.id])

  const toggleAddon = (id: string) => {
    setAddons((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedOption = tour.options?.find((o) => o.id === selectedOptionId)
  const selectedBike = BIKE_OPTIONS.find((b) => b.id === bikeType)
  const bikeExtra = (selectedBike?.extra ?? 0) * participants
  const addonTotal = ADDONS.filter((a) => addons.has(a.id)).reduce((sum, a) => {
    return sum + (a.id === 'guide' ? a.price : a.price * participants)
  }, 0)
  const optionFlatFee = selectedOption?.flat_fee_krw ?? 0
  const creditDiscount = useCredits ? Math.min(MOCK_CREDIT_BALANCE, tour.price_krw * participants + bikeExtra + addonTotal + optionFlatFee) : 0
  const total = tour.price_krw * participants + bikeExtra + addonTotal + optionFlatFee - creditDiscount

  const handleBooking = () => {
    if (!selectedDate) {
      alert('날짜를 선택해주세요.')
      return
    }
    if (timeSlots.length > 0 && !selectedSlotId) {
      alert('시간대를 선택해주세요.')
      return
    }
    const selectedSlot = timeSlots.find((s) => s.id === selectedSlotId)
    if (selectedSlot && selectedSlot.available_slots - selectedSlot.booked_slots < participants) {
      alert(`선택한 시간대의 남은 자전거가 부족합니다. (남은 대수: ${selectedSlot.available_slots - selectedSlot.booked_slots}대)`)
      return
    }
    const params = new URLSearchParams({
      tour: tour.id,
      date: selectedDate,
      slot: selectedSlotId,
      participants: String(participants),
      bike: bikeType,
      addons: Array.from(addons).join(','),
    })
    router.push(`/booking?${params}`)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-md">
      {/* Price */}
      <div className="mb-5">
        <p className="text-xs text-zinc-400 mb-0.5">1인 기준</p>
        <p className="text-3xl font-black text-zinc-900">{formatPrice(tour.price_krw)}</p>
        {tour.price_usd && (
          <p className="text-sm text-zinc-400 mt-0.5">≈ ${tour.price_usd} USD</p>
        )}
      </div>

      <div className="space-y-5">
        {/* Tour Options (왕복/편도 등) */}
        {tour.options && tour.options.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
              <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
              코스 옵션
            </label>
            <div className="space-y-2">
              {tour.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all ${
                    selectedOptionId === option.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-xs">
                    {option.flat_fee_krw
                      ? `+용달비 ${option.flat_fee_krw.toLocaleString()}원`
                      : '추가 없음'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bike Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
            <Bike className="h-4 w-4 text-emerald-600" />
            자전거 선택
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BIKE_OPTIONS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBikeType(b.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                  bikeType === b.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <span className="text-xl">{b.emoji}</span>
                <span>{b.label}</span>
                {b.extra > 0 && (
                  <span className={`text-[10px] font-bold ${bikeType === b.id ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    +{b.extra.toLocaleString()}원
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            날짜 선택
          </label>
          <CalendarPicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDaysAhead={1}
            maxDaysAhead={90}
          />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              시간 선택
            </label>
            {loadingSlots ? (
              <div className="rounded-xl border border-zinc-200 py-4 text-center text-xs text-zinc-400">
                불러오는 중...
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 py-4 text-center text-xs text-zinc-400">
                이 날짜에는 예약 가능한 시간대가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {timeSlots.map((slot) => {
                  const remaining = slot.available_slots - slot.booked_slots
                  const isSelected = selectedSlotId === slot.id
                  const isFull = remaining < participants
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => !isFull && setSelectedSlotId(slot.id)}
                      disabled={isFull}
                      className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : isFull
                            ? 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <span className="font-semibold">
                        {slot.start_time} ~ {slot.end_time}
                      </span>
                      <span className={`text-xs font-medium ${
                        isFull ? 'text-red-400' : remaining <= 3 ? 'text-amber-500' : 'text-emerald-600'
                      }`}>
                        <Bike className="inline h-3 w-3 mr-0.5" />
                        {isFull ? '마감' : `${remaining}대 남음`}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Participants */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
            <Users className="h-4 w-4 text-emerald-600" />
            인원 선택
          </label>
          <div className="flex items-center justify-between rounded-xl border border-zinc-300 px-3 py-2">
            <button
              onClick={() => setParticipants(Math.max(1, participants - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              disabled={participants <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-base font-bold text-zinc-900">{participants}명</span>
            <button
              onClick={() => setParticipants(Math.min(tour.max_participants, participants + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              disabled={participants >= tour.max_participants}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <p className="text-sm font-bold text-zinc-700 mb-2">선택 추가</p>
          <div className="space-y-2">
            {ADDONS.map(({ id, icon: Icon, label, desc, price }) => (
              <button
                key={id}
                onClick={() => toggleAddon(id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  addons.has(id)
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${addons.has(id) ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${addons.has(id) ? 'text-emerald-700' : 'text-zinc-800'}`}>{label}</p>
                  <p className="text-xs text-zinc-400 truncate">{desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${addons.has(id) ? 'text-emerald-600' : 'text-zinc-600'}`}>
                    +{formatPrice(price)}
                  </p>
                  {id === 'guide' && <p className="text-[10px] text-zinc-400">그룹당</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 크레딧 사용 */}
        {MOCK_CREDIT_BALANCE > 0 && (
          <button
            type="button"
            onClick={() => setUseCredits(!useCredits)}
            className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
              useCredits ? 'border-amber-400 bg-amber-50' : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${useCredits ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}>
              <Gift className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${useCredits ? 'text-amber-700' : 'text-zinc-800'}`}>크레딧 사용</p>
              <p className="text-xs text-zinc-400">보유: {formatPrice(MOCK_CREDIT_BALANCE)}</p>
            </div>
            {useCredits && <span className="text-sm font-bold text-amber-600">-{formatPrice(creditDiscount)}</span>}
          </button>
        )}

        {/* Total */}
        <div className="rounded-xl bg-zinc-50 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>기본 ({formatPrice(tour.price_krw)} × {participants}명)</span>
            <span>{formatPrice(tour.price_krw * participants)}</span>
          </div>
          {bikeExtra > 0 && (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>{selectedBike?.label} 추가금</span>
              <span>+{formatPrice(bikeExtra)}</span>
            </div>
          )}
          {optionFlatFee > 0 && (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>용달비 (1회)</span>
              <span>+{formatPrice(optionFlatFee)}</span>
            </div>
          )}
          {ADDONS.filter((a) => addons.has(a.id)).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm text-zinc-500">
              <span>{a.label}</span>
              <span>+{formatPrice(a.id === 'guide' ? a.price : a.price * participants)}</span>
            </div>
          ))}
          {useCredits && creditDiscount > 0 && (
            <div className="flex items-center justify-between text-sm text-amber-600">
              <span>크레딧 할인</span>
              <span>-{formatPrice(creditDiscount)}</span>
            </div>
          )}
          <div className="border-t border-zinc-200 pt-1.5 flex items-center justify-between font-black text-zinc-900">
            <span>총 금액</span>
            <span className="text-lg text-emerald-700">{formatPrice(total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleBooking}>
          예약하기
        </Button>

        <p className="text-center text-xs text-zinc-400">
          예약 확정 전까지 결제가 청구되지 않습니다
        </p>

      </div>
    </div>
  )
}
