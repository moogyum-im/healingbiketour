'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface AvailInfo {
  available: number
  remaining: number
  isOpen: boolean
}

interface RentalCalendarPickerProps {
  value: string
  onChange: (date: string) => void
  bikeId: string
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function ymd(year: number, month1: number, day: number) {
  return `${year}-${String(month1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayStr() {
  const d = new Date()
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export default function RentalCalendarPicker({ value, onChange, bikeId }: RentalCalendarPickerProps) {
  const today = todayStr()
  const minDate = today

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed
  const [availMap, setAvailMap] = useState<Record<string, AvailInfo>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bikeId) { setAvailMap({}); return }
    let cancelled = false
    setLoading(true)

    ;(async () => {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const month1 = viewMonth + 1
      const monthStart = ymd(viewYear, month1, 1)
      const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate()
      const monthEnd = ymd(viewYear, month1, lastDay)
      const bookingFetchStart = addDays(monthStart, -4)

      const [availRes, bookingsRes] = await Promise.all([
        client.from('rental_availability')
          .select('date, available_count, is_available')
          .eq('bike_id', bikeId)
          .gte('date', monthStart)
          .lte('date', monthEnd),
        client.rpc('get_rental_booked_slots', {
          p_bike_id: bikeId,
          p_start:   bookingFetchStart,
          p_end:     monthEnd,
        }),
      ])

      if (cancelled) return

      const bookedMap: Record<string, number> = {}
      for (const b of (bookingsRes.data ?? [])) {
        for (let i = 0; i < b.duration_days; i++) {
          const d = addDays(b.start_date, i)
          bookedMap[d] = (bookedMap[d] ?? 0) + 1
        }
      }
      const DEFAULT_COUNT = 10
      const combined: Record<string, AvailInfo> = {}

      // 관리자가 명시적으로 설정한 날짜
      for (const a of (availRes.data ?? [])) {
        const booked = bookedMap[a.date] ?? 0
        combined[a.date] = {
          available: a.available_count,
          remaining: Math.max(0, a.available_count - booked),
          isOpen: a.is_available,
        }
      }

      // 설정 없는 날짜는 기본 10대로 채움
      const cur = new Date(monthStart + 'T00:00:00')
      const end = new Date(monthEnd + 'T00:00:00')
      while (cur <= end) {
        const ds = ymd(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())
        if (!combined[ds]) {
          const booked = bookedMap[ds] ?? 0
          combined[ds] = {
            available: DEFAULT_COUNT,
            remaining: Math.max(0, DEFAULT_COUNT - booked),
            isOpen: true,
          }
        }
        cur.setDate(cur.getDate() + 1)
      }

      setAvailMap(combined)
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [viewYear, viewMonth, bikeId])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const month1 = viewMonth + 1
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevDisabled =
    viewYear < now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth <= now.getMonth())
  const nextDisabled = viewYear > now.getFullYear() + 1

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function getDateStr(day: number) {
    return ymd(viewYear, month1, day)
  }

  type CellState = 'past' | 'no-config' | 'full' | 'low' | 'ok' | 'selected'

  function getCellState(day: number): CellState {
    const dateStr = getDateStr(day)
    if (dateStr === value) return 'selected'
    if (dateStr < minDate) return 'past'
    const a = availMap[dateStr]
    if (!a || !a.isOpen) return 'no-config'
    if (a.remaining <= 0) return 'full'
    if (a.remaining <= 2) return 'low'
    return 'ok'
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden select-none">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <button type="button" onClick={prevMonth} disabled={prevDisabled}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-zinc-800">
          {viewYear}년 {MONTHS[viewMonth]}
          {loading && <span className="ml-2 text-[10px] font-normal text-zinc-400">로딩 중</span>}
        </span>
        <button type="button" onClick={nextMonth} disabled={nextDisabled}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {DAYS.map((d, i) => (
          <div key={d} className={`py-2 text-center text-[11px] font-semibold ${
            i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-400'
          }`}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 p-1.5 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const state = getCellState(day)
          const dateStr = getDateStr(day)
          const isToday = dateStr === today
          const avail = availMap[dateStr]
          const col = i % 7

          const isClickable = state === 'ok' || state === 'low' || state === 'selected'

          let dayColor = ''
          if (state === 'selected') dayColor = ''
          else if (state === 'past' || state === 'no-config') dayColor = 'text-zinc-300'
          else if (state === 'full') dayColor = 'text-zinc-400'
          else if (col === 0) dayColor = 'text-red-500'
          else if (col === 6) dayColor = 'text-blue-500'
          else dayColor = 'text-zinc-700'

          return (
            <button
              key={day}
              type="button"
              onClick={() => isClickable && onChange(dateStr)}
              className={`
                flex flex-col items-center justify-center rounded-lg py-1 transition-colors
                ${state === 'selected' ? 'bg-emerald-600 text-white' : ''}
                ${isToday && state !== 'selected' ? 'ring-1 ring-emerald-400' : ''}
                ${isClickable && state !== 'selected' ? 'hover:bg-zinc-100 cursor-pointer' : 'cursor-not-allowed'}
                ${dayColor}
              `}
            >
              <span className="text-xs font-semibold leading-none">{day}</span>
              {state === 'selected' && avail && (
                <span className="text-[9px] mt-0.5 text-emerald-100 leading-none">{avail.remaining}대</span>
              )}
              {(state === 'ok') && avail && (
                <span className="text-[9px] mt-0.5 leading-none font-medium text-emerald-500">{avail.remaining}대</span>
              )}
              {state === 'low' && avail && (
                <span className="text-[9px] mt-0.5 leading-none font-medium text-amber-500">{avail.remaining}대</span>
              )}
              {state === 'full' && (
                <span className="text-[9px] mt-0.5 text-red-300 leading-none">마감</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="border-t border-zinc-100 px-4 py-2 flex items-center gap-4 text-[10px] text-zinc-400">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" />여유</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber-400" />1–2대</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-zinc-300" />마감/비운영</span>
      </div>

      {value && (
        <div className="border-t border-zinc-100 px-4 py-2 text-center text-xs text-zinc-500">
          선택:{' '}
          <span className="font-semibold text-emerald-700">
            {new Date(value + 'T00:00:00').toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
            })}
          </span>
        </div>
      )}
    </div>
  )
}
