'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarPickerProps {
  value: string        // YYYY-MM-DD
  onChange: (date: string) => void
  minDaysAhead?: number
  maxDaysAhead?: number
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function toYMD(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function CalendarPicker({
  value,
  onChange,
  minDaysAhead = 1,
  maxDaysAhead = 90,
}: CalendarPickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const minDate = new Date(today)
  minDate.setDate(today.getDate() + minDaysAhead)

  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + maxDaysAhead)

  const initDate = value ? new Date(value + 'T00:00:00') : minDate
  const [viewYear, setViewYear] = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // 이번 달 1일의 요일 (0=일)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  // 이번 달 마지막 날
  const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate()

  // 이전 달로 이동 가능한지 (minDate보다 이전 달이면 불가)
  const prevDisabled = (viewYear < minDate.getFullYear()) ||
    (viewYear === minDate.getFullYear() && viewMonth <= minDate.getMonth())
  const nextDisabled = (viewYear > maxDate.getFullYear()) ||
    (viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth())

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ]
  // 7의 배수로 패딩
  while (cells.length % 7 !== 0) cells.push(null)

  function cellDate(day: number) {
    return new Date(viewYear, viewMonth, day)
  }

  function isDisabled(day: number) {
    const d = cellDate(day)
    return d < minDate || d > maxDate
  }

  function isSelected(day: number) {
    return toYMD(cellDate(day)) === value
  }

  function isToday(day: number) {
    return toYMD(cellDate(day)) === toYMD(today)
  }

  function select(day: number) {
    if (isDisabled(day)) return
    onChange(toYMD(cellDate(day)))
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden select-none">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <button
          type="button"
          onClick={prevMonth}
          disabled={prevDisabled}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-zinc-800">
          {viewYear}년 {MONTHS[viewMonth]}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={nextDisabled}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-[11px] font-semibold ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 p-2 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const disabled = isDisabled(day)
          const selected = isSelected(day)
          const todayCell = isToday(day)
          const col = i % 7

          return (
            <button
              key={day}
              type="button"
              onClick={() => select(day)}
              disabled={disabled}
              className={`
                flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors
                ${selected
                  ? 'bg-emerald-600 text-white font-bold'
                  : todayCell
                    ? 'border border-emerald-400 text-emerald-700 font-semibold hover:bg-emerald-50'
                    : disabled
                      ? 'text-zinc-300 cursor-not-allowed'
                      : col === 0
                        ? 'text-red-500 hover:bg-zinc-100'
                        : col === 6
                          ? 'text-blue-500 hover:bg-zinc-100'
                          : 'text-zinc-700 hover:bg-zinc-100'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* 선택된 날짜 표시 */}
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
