'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronLeft, ChevronRight, Bike, ToggleLeft, ToggleRight, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { RENTAL_PRICES } from '@/lib/rental-prices'

// ── 타입 ──────────────────────────────────────────────────
interface AvailEntry { available_count: number; is_available: boolean }
type AvailByDate  = Record<string, Record<string, AvailEntry>>  // date → bikeId → entry
type BookedByDate = Record<string, Record<string, number>>      // date → bikeId → count
interface EditRow  { count: number; isOpen: boolean }

// ── 상수 ──────────────────────────────────────────────────
const DAYS   = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// ── 유틸 ──────────────────────────────────────────────────
function ymd(year: number, m1: number, day: number) {
  return `${year}-${String(m1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}
function addDays(s: string, n: number) {
  const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n)
  return ymd(d.getFullYear(), d.getMonth()+1, d.getDate())
}
function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
function fmtDate(s: string) {
  return new Date(s+'T00:00:00').toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' })
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function RentalAvailabilityManager() {
  const today = new Date().toISOString().split('T')[0]
  const now   = new Date()

  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())   // 0-indexed
  const [selected,  setSelected]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [saving,    setSaving]    = useState(false)

  const [availData,  setAvailData]  = useState<AvailByDate>({})
  const [bookedData, setBookedData] = useState<BookedByDate>({})
  const [editRows,   setEditRows]   = useState<Record<string, EditRow>>({})
  const [bulkEndDate, setBulkEndDate] = useState('')
  const [bulkSaving,  setBulkSaving]  = useState(false)

  // ── 월 데이터 fetch ──────────────────────────────────────
  const fetchMonth = useCallback(async () => {
    setLoading(true)
    const m1 = viewMonth + 1
    const mStart = ymd(viewYear, m1, 1)
    const mEnd   = ymd(viewYear, m1, new Date(viewYear, viewMonth+1, 0).getDate())

    const [ar, br] = await Promise.all([
      sb().from('rental_availability')
          .select('date,bike_id,available_count,is_available')
          .gte('date', mStart).lte('date', mEnd),
      sb().from('rental_bookings')
          .select('start_date,duration_days,bike_id')
          .gte('start_date', addDays(mStart, -4))
          .lte('start_date', mEnd)
          .in('status', ['pending','pending_transfer','confirmed']),
    ])

    const avail: AvailByDate = {}
    for (const a of (ar.data ?? [])) {
      if (!avail[a.date]) avail[a.date] = {}
      avail[a.date][a.bike_id] = { available_count: a.available_count, is_available: a.is_available }
    }

    const booked: BookedByDate = {}
    for (const b of (br.data ?? [])) {
      for (let i = 0; i < b.duration_days; i++) {
        const d = addDays(b.start_date, i)
        if (!booked[d]) booked[d] = {}
        booked[d][b.bike_id] = (booked[d][b.bike_id] ?? 0) + 1
      }
    }

    setAvailData(avail)
    setBookedData(booked)
    setLoading(false)
  }, [viewYear, viewMonth])

  useEffect(() => { fetchMonth() }, [fetchMonth])

  // ── 날짜 선택 시 편집 상태 초기화 ──────────────────────
  useEffect(() => {
    if (!selected) return
    const init: Record<string, EditRow> = {}
    for (const bike of RENTAL_PRICES) {
      const e = availData[selected]?.[bike.bikeId]
      init[bike.bikeId] = { count: e?.available_count ?? 0, isOpen: e?.is_available ?? true }
    }
    setEditRows(init)
  }, [selected, availData])

  // ── 저장 ────────────────────────────────────────────────
  async function handleSave() {
    if (!selected) return
    setSaving(true)

    const upserts = RENTAL_PRICES
      .filter(b => editRows[b.bikeId]?.count > 0)
      .map(b => ({
        date: selected,
        bike_id: b.bikeId,
        available_count: editRows[b.bikeId].count,
        is_available: editRows[b.bikeId].isOpen,
        updated_at: new Date().toISOString(),
      }))

    const deleteIds = RENTAL_PRICES
      .filter(b => (editRows[b.bikeId]?.count ?? 0) === 0 && availData[selected]?.[b.bikeId])
      .map(b => b.bikeId)

    let errMsg: string | null = null

    if (upserts.length > 0) {
      const { error } = await sb().from('rental_availability').upsert(upserts, { onConflict: 'date,bike_id' })
      if (error) errMsg = error.message
    }
    if (!errMsg && deleteIds.length > 0) {
      const { error } = await sb().from('rental_availability').delete().eq('date', selected).in('bike_id', deleteIds)
      if (error) errMsg = error.message
    }

    if (errMsg) toast.error('저장 실패: ' + errMsg)
    else { toast.success('저장되었습니다.'); await fetchMonth() }

    setSaving(false)
  }

  // ── 날짜 범위 일괄 저장 ──────────────────────────────────
  async function handleBulkSave() {
    if (!selected || !bulkEndDate || bulkEndDate <= selected) return
    setBulkSaving(true)

    const allUpserts: object[] = []
    let cur = addDays(selected, 1)
    while (cur <= bulkEndDate) {
      for (const b of RENTAL_PRICES) {
        const row = editRows[b.bikeId]
        if (row?.count > 0) {
          allUpserts.push({
            date: cur,
            bike_id: b.bikeId,
            available_count: row.count,
            is_available: row.isOpen,
            updated_at: new Date().toISOString(),
          })
        }
      }
      cur = addDays(cur, 1)
    }

    let errMsg: string | null = null
    if (allUpserts.length > 0) {
      const { error } = await sb().from('rental_availability').upsert(allUpserts, { onConflict: 'date,bike_id' })
      if (error) errMsg = error.message
    }

    if (errMsg) toast.error('일괄 저장 실패: ' + errMsg)
    else {
      toast.success(`${selected} ~ ${bulkEndDate} 일괄 저장 완료!`)
      setBulkEndDate('')
      await fetchMonth()
    }
    setBulkSaving(false)
  }

  // ── 달력 계산 ────────────────────────────────────────────
  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11) }
    else setViewMonth(m => m-1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0) }
    else setViewMonth(m => m+1)
  }

  const m1       = viewMonth + 1
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const lastDay  = new Date(viewYear, viewMonth+1, 0).getDate()
  const cells: (number|null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i+1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function getRemaining(dateStr: string) {
    const avail  = availData[dateStr]
    const booked = bookedData[dateStr]
    if (!avail) return null
    let total = 0, b = 0
    for (const bike of RENTAL_PRICES) {
      const a = avail[bike.bikeId]
      if (a?.is_available) total += a.available_count
      b += booked?.[bike.bikeId] ?? 0
    }
    return Math.max(0, total - b)
  }

  // ── 렌더 ────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

      {/* ── 달력 ──────────────────────────────────────────── */}
      <div className="xl:col-span-3 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <button type="button" onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-zinc-900">
            {viewYear}년 {MONTHS[viewMonth]}
            {loading && <span className="ml-2 text-xs font-normal text-zinc-400">로딩 중</span>}
          </span>
          <button type="button" onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-zinc-50 border-b border-zinc-100">
          {DAYS.map((d, i) => (
            <div key={d} className={`py-2.5 text-center text-xs font-semibold ${
              i===0 ? 'text-red-400' : i===6 ? 'text-blue-400' : 'text-zinc-400'
            }`}>{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return (
              <div key={`e-${i}`} className="h-[4.5rem] border-b border-r border-zinc-50" />
            )

            const dateStr   = ymd(viewYear, m1, day)
            const remaining = getRemaining(dateStr)
            const isSelected = selected === dateStr
            const isPast    = dateStr < today
            const isToday   = dateStr === today
            const col       = i % 7

            const dotColor = remaining === null ? 'bg-zinc-200'
              : remaining === 0 ? 'bg-red-400'
              : remaining <= 3  ? 'bg-amber-400'
              : 'bg-emerald-400'

            return (
              <button key={day} type="button"
                onClick={() => setSelected(isSelected ? null : dateStr)}
                className={`
                  h-[4.5rem] border-b border-r border-zinc-50
                  flex flex-col items-center pt-2 gap-1 transition-colors
                  ${isSelected ? 'bg-emerald-50' : isPast ? 'bg-zinc-50/60 hover:bg-zinc-100/60' : 'hover:bg-zinc-50'}
                `}
              >
                <span className={`
                  flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                  ${isSelected ? 'bg-emerald-600 text-white'
                    : isToday  ? 'ring-2 ring-emerald-500 text-emerald-700'
                    : isPast   ? 'text-zinc-300'
                    : col===0  ? 'text-red-500'
                    : col===6  ? 'text-blue-500'
                    : 'text-zinc-800'}
                `}>{day}</span>

                {/* 수량 인디케이터 */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
                  {remaining !== null && (
                    <span className={`text-[9px] font-medium leading-none ${
                      remaining === 0 ? 'text-red-400'
                      : remaining <= 3 ? 'text-amber-500'
                      : 'text-emerald-600'
                    }`}>
                      {remaining === 0 ? '마감' : `${remaining}대`}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* 범례 */}
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center gap-5 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />여유</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />3대↓</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />마감</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-200 inline-block" />미설정</span>
        </div>
      </div>

      {/* ── 우측 입력 패널 ─────────────────────────────────── */}
      <div className="xl:col-span-2 sticky top-6">
        {selected ? (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 bg-zinc-50 border-b border-zinc-100">
              <div>
                <p className="font-bold text-zinc-900">{fmtDate(selected)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">기종별 가용 대수 입력</p>
              </div>
              <button type="button" onClick={() => setSelected(null)}
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">✕</button>
            </div>

            {/* 기종별 입력 */}
            <div className="divide-y divide-zinc-50 max-h-[60vh] overflow-y-auto">
              {RENTAL_PRICES.map((bike) => {
                const row    = editRows[bike.bikeId] ?? { count: 0, isOpen: true }
                const booked = bookedData[selected]?.[bike.bikeId] ?? 0

                return (
                  <div key={bike.bikeId}
                    className={`flex items-center gap-3 px-5 py-3.5 transition-opacity ${!row.isOpen ? 'opacity-40' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{bike.brand} {bike.model}</p>
                      <p className="text-[11px] text-zinc-400">{bike.material} · {bike.size}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {booked > 0 && (
                        <span className="text-[11px] text-zinc-400 bg-zinc-100 rounded px-1.5 py-0.5">{booked}예약</span>
                      )}
                      <input
                        type="number"
                        value={row.count}
                        min={booked}
                        max={20}
                        onChange={(e) => setEditRows(prev => ({
                          ...prev,
                          [bike.bikeId]: { ...prev[bike.bikeId], count: Math.max(booked, Number(e.target.value)) },
                        }))}
                        className="w-14 rounded-lg border border-zinc-200 px-2 py-1.5 text-center text-sm font-bold focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
                      />
                      <span className="text-xs text-zinc-400">대</span>
                      <button type="button"
                        onClick={() => setEditRows(prev => ({
                          ...prev,
                          [bike.bikeId]: { ...prev[bike.bikeId], isOpen: !prev[bike.bikeId]?.isOpen },
                        }))}
                        className="text-zinc-400 hover:text-emerald-600 transition-colors">
                        {row.isOpen
                          ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                          : <ToggleLeft  className="h-5 w-5 text-zinc-400" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 저장 버튼 */}
            <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50 space-y-3">
              <button type="button" onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                <Save className="h-4 w-4" />
                {saving ? '저장 중...' : `${fmtDate(selected)} 저장`}
              </button>

              {/* 날짜 범위 일괄 적용 */}
              <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                <p className="text-[11px] font-bold text-zinc-500">이 설정을 날짜 범위에 일괄 적용</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 shrink-0">{selected} ~</span>
                  <input
                    type="date"
                    value={bulkEndDate}
                    min={addDays(selected, 1)}
                    onChange={(e) => setBulkEndDate(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleBulkSave}
                  disabled={!bulkEndDate || bulkEndDate <= selected || bulkSaving}
                  className="w-full rounded-lg border border-emerald-300 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {bulkSaving ? '적용 중...' : '범위 전체에 동일 수량 적용'}
                </button>
              </div>

              <p className="text-center text-[11px] text-zinc-400">0대로 설정하면 해당 기종은 비활성화됩니다</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white flex items-center justify-center py-20 text-center">
            <div>
              <Bike className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-400">달력에서 날짜를 선택하면</p>
              <p className="text-sm text-zinc-300">기종별 수량을 입력할 수 있습니다</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
