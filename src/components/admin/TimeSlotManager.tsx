'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Trash2, ToggleLeft, ToggleRight, Bike, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  available_slots: number
  booked_slots: number
  is_available: boolean
}

interface TimeSlotManagerProps {
  tourId: string
  tourTitle: string
}

function supabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function TimeSlotManager({ tourId, tourTitle }: TimeSlotManagerProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: today,
    start_time: '09:00',
    end_time: '13:00',
    available_slots: 10,
  })

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const sb = supabaseClient()
    const { data } = await sb
      .from('tour_dates')
      .select('id, date, start_time, end_time, available_slots, booked_slots, is_available')
      .eq('tour_id', tourId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    setSlots(data ?? [])
    setLoading(false)
  }, [tourId])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  async function addSlot(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const sb = supabaseClient()
    const { error } = await sb.from('tour_dates').insert({
      tour_id: tourId,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      available_slots: form.available_slots,
      booked_slots: 0,
      is_available: true,
    })
    if (error) {
      toast.error('슬롯 추가 실패: ' + error.message)
    } else {
      toast.success('시간 슬롯이 추가되었습니다')
      setShowForm(false)
      await fetchSlots()
    }
    setSaving(false)
  }

  async function toggleAvailable(slot: Slot) {
    const sb = supabaseClient()
    const { error } = await sb
      .from('tour_dates')
      .update({ is_available: !slot.is_available })
      .eq('id', slot.id)
    if (error) {
      toast.error('상태 변경 실패')
    } else {
      setSlots((prev) =>
        prev.map((s) => s.id === slot.id ? { ...s, is_available: !s.is_available } : s)
      )
    }
  }

  async function updateCapacity(slotId: string, newCapacity: number) {
    if (newCapacity < 1) return
    const sb = supabaseClient()
    const { error } = await sb
      .from('tour_dates')
      .update({ available_slots: newCapacity })
      .eq('id', slotId)
    if (error) {
      toast.error('수정 실패')
    } else {
      setSlots((prev) =>
        prev.map((s) => s.id === slotId ? { ...s, available_slots: newCapacity } : s)
      )
      toast.success('자전거 대수 수정됨')
    }
  }

  async function deleteSlot(slotId: string) {
    if (!confirm('이 시간 슬롯을 삭제하시겠습니까?')) return
    const sb = supabaseClient()
    const { error } = await sb.from('tour_dates').delete().eq('id', slotId)
    if (error) {
      toast.error('삭제 실패')
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
      toast.success('삭제되었습니다')
    }
  }

  // 날짜별 그룹
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <div>
          <h2 className="font-bold text-zinc-900">시간 슬롯 관리</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{tourTitle} · 날짜·시간별 자전거 대수 설정</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          슬롯 추가
        </button>
      </div>

      {/* 추가 폼 */}
      {showForm && (
        <form onSubmit={addSlot} className="border-b border-zinc-100 bg-emerald-50 px-6 py-5">
          <p className="text-sm font-semibold text-zinc-800 mb-4">새 시간 슬롯</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">날짜</label>
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">시작 시간</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">종료 시간</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">자전거 대수</label>
              <input
                type="number"
                value={form.available_slots}
                min={1}
                max={100}
                onChange={(e) => setForm((f) => ({ ...f, available_slots: Number(e.target.value) }))}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-zinc-300 px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 슬롯 목록 */}
      <div className="divide-y divide-zinc-100">
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-400">불러오는 중...</div>
        ) : sortedDates.length === 0 ? (
          <div className="py-14 text-center text-sm text-zinc-400">
            등록된 시간 슬롯이 없습니다.<br />
            <span className="text-xs text-zinc-300">위 버튼으로 슬롯을 추가하세요.</span>
          </div>
        ) : (
          sortedDates.map((date) => {
            const dateSlots = grouped[date]
            const isExpanded = expandedDate === date
            const isPast = date < today
            const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
            })
            const totalBikes = dateSlots.reduce((s, slot) => s + slot.available_slots, 0)
            const bookedBikes = dateSlots.reduce((s, slot) => s + slot.booked_slots, 0)

            return (
              <div key={date}>
                {/* 날짜 헤더 */}
                <button
                  type="button"
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                  className={`w-full flex items-center justify-between px-6 py-3 hover:bg-zinc-50 transition-colors ${isPast ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${isPast ? 'text-zinc-400' : 'text-zinc-800'}`}>
                      {dateLabel}
                    </span>
                    {isPast && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">지난 날짜</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Bike className="h-3.5 w-3.5" />
                      {bookedBikes}/{totalBikes}대 예약
                    </span>
                    <span className="text-zinc-400">{dateSlots.length}개 슬롯</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* 슬롯 상세 */}
                {isExpanded && (
                  <div className="bg-zinc-50 px-6 pb-4 space-y-2">
                    {dateSlots.map((slot) => {
                      const remaining = slot.available_slots - slot.booked_slots
                      return (
                        <div key={slot.id} className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3 ${!slot.is_available ? 'opacity-60' : ''}`}>
                          <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span className="text-sm font-semibold text-zinc-800 w-28 shrink-0">
                            {slot.start_time} ~ {slot.end_time}
                          </span>

                          {/* 자전거 대수 인라인 편집 */}
                          <div className="flex items-center gap-1.5 text-sm">
                            <Bike className="h-3.5 w-3.5 text-zinc-400" />
                            <input
                              type="number"
                              defaultValue={slot.available_slots}
                              min={slot.booked_slots}
                              max={100}
                              onBlur={(e) => {
                                const val = Number(e.target.value)
                                if (val !== slot.available_slots) updateCapacity(slot.id, val)
                              }}
                              className="w-14 rounded-lg border border-zinc-200 px-2 py-1 text-center text-sm focus:border-emerald-400 focus:outline-none"
                            />
                            <span className="text-zinc-500 text-xs">대 중</span>
                            <span className={`font-bold text-xs ${remaining <= 0 ? 'text-red-500' : remaining <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              {remaining}대 남음
                            </span>
                            <span className="text-zinc-400 text-xs">({slot.booked_slots}예약)</span>
                          </div>

                          <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleAvailable(slot)}
                              title={slot.is_available ? '예약 비활성화' : '예약 활성화'}
                              className="text-zinc-400 hover:text-emerald-600 transition-colors"
                            >
                              {slot.is_available
                                ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                                : <ToggleLeft className="h-6 w-6 text-zinc-400" />
                              }
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSlot(slot.id)}
                              disabled={slot.booked_slots > 0}
                              title={slot.booked_slots > 0 ? '예약이 있어 삭제 불가' : '삭제'}
                              className="text-zinc-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
