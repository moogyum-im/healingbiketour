'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Calendar, Users, Minus, Plus, Bike, Gift, ArrowLeftRight, Clock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { Tour } from '@/types'
import Button from '@/components/ui/Button'
import CalendarPicker from '@/components/ui/CalendarPicker'
import { formatPrice, type Currency } from '@/utils/format'

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

const BIKE_OPTION_IDS = [
  { id: 'city', labelKey: 'mini_road', emoji: '🚲', extra: 0 },
  { id: 'mtb', labelKey: 'mtb', emoji: '🏔️', extra: 10000 },
  { id: 'ebike', labelKey: 'ebike', emoji: '⚡', extra: 15000 },
] as const

export default function BookingWidget({ tour }: BookingWidgetProps) {
  const router = useRouter()
  const t = useTranslations('booking')
  const locale = useLocale()

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [participants, setParticipants] = useState(1)
  const [bikeType, setBikeType] = useState('city')
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    tour.options?.[0]?.id ?? ''
  )
  const [useCredits, setUseCredits] = useState(false)
  const MOCK_CREDIT_BALANCE = 0

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

  const selectedOption = tour.options?.find((o) => o.id === selectedOptionId)
  const selectedBike = BIKE_OPTION_IDS.find((b) => b.id === bikeType)
  const bikeExtra = (selectedBike?.extra ?? 0) * participants
  const optionFlatFee = selectedOption?.flat_fee_krw ?? 0
  const creditDiscount = useCredits ? Math.min(MOCK_CREDIT_BALANCE, tour.price_krw * participants + bikeExtra + optionFlatFee) : 0
  const total = tour.price_krw * participants + bikeExtra + optionFlatFee - creditDiscount

  const localeCurrency = ({ ko: 'KRW', en: 'USD', ja: 'JPY', 'zh-CN': 'CNY', 'zh-TW': 'TWD' } as Record<string, Currency>)[locale] ?? 'KRW'
  const krwRate = tour.price_usd ? tour.price_usd / tour.price_krw : 1 / 1350
  const fxRates: Record<Currency, number> = { KRW: 1, USD: krwRate, JPY: krwRate * 150, CNY: krwRate * 7.2, TWD: krwRate * 32 }
  const fx = fxRates[localeCurrency]

  const toLocal = (krw: number) => {
    const amount = (localeCurrency === 'KRW' || localeCurrency === 'JPY')
      ? Math.round(krw * fx)
      : Math.round(krw * fx * 100) / 100
    return formatPrice(amount, localeCurrency)
  }

  const handleBooking = () => {
    if (!selectedDate) {
      alert(t('date_required'))
      return
    }
    if (timeSlots.length > 0 && !selectedSlotId) {
      alert(t('time_required'))
      return
    }
    const selectedSlot = timeSlots.find((s) => s.id === selectedSlotId)
    if (selectedSlot && selectedSlot.available_slots - selectedSlot.booked_slots < participants) {
      alert(t('not_enough_bikes', { n: selectedSlot.available_slots - selectedSlot.booked_slots }))
      return
    }
    const params = new URLSearchParams({
      tour: tour.id,
      date: selectedDate,
      slot: selectedSlotId,
      participants: String(participants),
      bike: bikeType,
    })
    router.push(`/booking?${params}`)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-md">
      {/* Price */}
      <div className="mb-5">
        <p className="text-xs text-zinc-400 mb-0.5">{t('per_person')}</p>
        <p className="text-3xl font-black text-zinc-900">{toLocal(tour.price_krw)}</p>
      </div>

      <div className="space-y-5">
        {/* Tour Options */}
        {tour.options && tour.options.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2">
              <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
              {t('course_option')}
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
                      ? `+${t('transport_fee_one')} ${toLocal(option.flat_fee_krw)}`
                      : t('no_extra')}
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
            {t('bike_type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BIKE_OPTION_IDS.map((b) => (
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
                <span>{t(b.labelKey)}</span>
                {b.extra > 0 && (
                  <span className={`text-[10px] font-bold ${bikeType === b.id ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    +{toLocal(b.extra)}
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
            {t('date')}
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
              {t('time_slot')}
            </label>
            {loadingSlots ? (
              <div className="rounded-xl border border-zinc-200 py-4 text-center text-xs text-zinc-400">
                {t('loading_slots')}
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 py-4 text-center text-xs text-zinc-400">
                {t('no_slots')}
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
                        {isFull ? t('sold_out') : t('remaining', { n: remaining })}
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
            {t('participants')}
          </label>
          <div className="flex items-center justify-between rounded-xl border border-zinc-300 px-3 py-2">
            <button
              onClick={() => setParticipants(Math.max(1, participants - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              disabled={participants <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-base font-bold text-zinc-900">{t('people_count', { n: participants })}</span>
            <button
              onClick={() => setParticipants(Math.min(tour.max_participants, participants + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              disabled={participants >= tour.max_participants}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Credits */}
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
              <p className={`text-sm font-bold ${useCredits ? 'text-amber-700' : 'text-zinc-800'}`}>{t('use_credits')}</p>
              <p className="text-xs text-zinc-400">{t('credit_balance', { balance: toLocal(MOCK_CREDIT_BALANCE) })}</p>
            </div>
            {useCredits && <span className="text-sm font-bold text-amber-600">-{toLocal(creditDiscount)}</span>}
          </button>
        )}

        {/* Total */}
        <div className="rounded-xl bg-zinc-50 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>{t('base', { price: toLocal(tour.price_krw), n: participants })}</span>
            <span>{toLocal(tour.price_krw * participants)}</span>
          </div>
          {bikeExtra > 0 && (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>{t('bike_surcharge', { label: t(selectedBike!.labelKey) })}</span>
              <span>+{toLocal(bikeExtra)}</span>
            </div>
          )}
          {optionFlatFee > 0 && (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>{t('transport_fee_one')}</span>
              <span>+{toLocal(optionFlatFee)}</span>
            </div>
          )}
          {useCredits && creditDiscount > 0 && (
            <div className="flex items-center justify-between text-sm text-amber-600">
              <span>{t('credit_discount')}</span>
              <span>-{toLocal(creditDiscount)}</span>
            </div>
          )}
          <div className="border-t border-zinc-200 pt-1.5 flex items-center justify-between font-black text-zinc-900">
            <span>{t('total')}</span>
            <span className="text-lg text-emerald-700">{toLocal(total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleBooking}>
          {t('book_now')}
        </Button>

        <p className="text-center text-xs text-zinc-400">
          {t('no_charge_until')}
        </p>

        {/* Payment notice */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 space-y-1.5">
          <p className="text-xs font-bold text-zinc-700">{t('payment_title')}</p>
          <p className="text-xs text-zinc-600">{t('payment_bank_only')}</p>
          <p className="text-[11px] text-zinc-400">{t('payment_coming')}</p>
        </div>
      </div>
    </div>
  )
}
