'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { Camera, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { RouteStop, TourRoute } from '@/types'

interface Props {
  slug: string
  value: TourRoute
  onChange: (route: TourRoute) => void
}

const COLOR_PRESETS = [
  { label: '초록 (출발/도착)', value: 'bg-emerald-500' },
  { label: '하늘', value: 'bg-sky-500' },
  { label: '파랑', value: 'bg-blue-500' },
  { label: '보라', value: 'bg-violet-500' },
  { label: '자주', value: 'bg-purple-500' },
  { label: '핑크', value: 'bg-pink-500' },
  { label: '빨강', value: 'bg-rose-500' },
  { label: '주황', value: 'bg-orange-500' },
  { label: '노랑 (강조)', value: 'bg-amber-400 text-zinc-900' },
  { label: '호박', value: 'bg-amber-500' },
  { label: '청록', value: 'bg-teal-500' },
  { label: '시안', value: 'bg-cyan-500' },
  { label: '남색', value: 'bg-indigo-500' },
  { label: '연두', value: 'bg-lime-500' },
]

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function newStop(num: number): RouteStop {
  return {
    id: crypto.randomUUID(),
    num,
    name: '',
    name_en: '',
    sub: '',
    sub_en: '',
    photo: '',
    badge_text: '',
    badge_color: 'bg-sky-500',
  }
}

function StopPhoto({ stop, slug, onUploaded }: { stop: RouteStop; slug: string; onUploaded: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = getSupabase()
      const ext = file.name.split('.').pop()
      const path = `tours/${slug || 'draft'}/route-stops/${stop.id}.${ext}`
      const { error } = await supabase.storage.from('tours').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('tours').getPublicUrl(path)
      onUploaded(`${publicUrl}?t=${Date.now()}`)
    } catch (err) {
      toast.error('업로드 실패: ' + (err as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group shrink-0 sm:w-72">
      {stop.photo && <Image src={stop.photo} alt={stop.name || '스팟 사진'} fill className="object-cover" />}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 group-hover:bg-black/50 text-transparent group-hover:text-white transition-colors disabled:bg-black/50 disabled:text-white"
      >
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        <span className="text-[11px] font-bold">{uploading ? '업로드 중...' : '사진 변경'}</span>
      </button>
      {!stop.photo && !uploading && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-zinc-400">
          사진 없음
        </div>
      )}
    </div>
  )
}

export default function RouteStopsEditor({ slug, value, onChange }: Props) {
  const stops = value.stops ?? []
  const summary = value.summary ?? []

  const updateStop = (idx: number, patch: Partial<RouteStop>) => {
    const next = stops.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    onChange({ ...value, stops: next })
  }

  const removeStop = (idx: number) => {
    const next = stops.filter((_, i) => i !== idx).map((s, i) => ({ ...s, num: i + 1 }))
    onChange({ ...value, stops: next })
  }

  const moveStop = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= stops.length) return
    const next = [...stops]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange({ ...value, stops: next.map((s, i) => ({ ...s, num: i + 1 })) })
  }

  const addStop = () => {
    onChange({ ...value, stops: [...stops, newStop(stops.length + 1)] })
  }

  const setSummaryLines = (field: 'text' | 'text_en', text: string) => {
    const lines = text.split('\n')
    const maxLen = Math.max(lines.length, summary.length)
    const next = Array.from({ length: maxLen }, (_, i) => ({
      ...summary[i],
      text: field === 'text' ? (lines[i] ?? summary[i]?.text ?? '') : (summary[i]?.text ?? ''),
      text_en: field === 'text_en' ? (lines[i] ?? summary[i]?.text_en ?? '') : summary[i]?.text_en,
    })).filter((b, i) => i < lines.length || b.text)
    onChange({ ...value, summary: next })
  }

  const inputCls = 'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
  const labelCls = 'block mb-1 text-xs font-medium text-zinc-500'

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>코스 섹션 제목 (한국어)</label>
          <input
            className={inputCls}
            value={value.title ?? ''}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="투어 코스"
          />
        </div>
        <div>
          <label className={labelCls}>코스 섹션 제목 (영어)</label>
          <input
            className={inputCls}
            value={value.title_en ?? ''}
            onChange={(e) => onChange({ ...value, title_en: e.target.value })}
            placeholder="Tour Route"
          />
        </div>
        <div>
          <label className={labelCls}>
            요약 배지 (한국어) <span className="text-zinc-400">— 한 줄에 하나씩, 예: 21.2km 순환</span>
          </label>
          <textarea
            rows={2}
            className={`${inputCls} resize-none`}
            value={summary.map((b) => b.text).join('\n')}
            onChange={(e) => setSummaryLines('text', e.target.value)}
            placeholder={'21.2km 순환'}
          />
        </div>
        <div>
          <label className={labelCls}>요약 배지 (영어)</label>
          <textarea
            rows={2}
            className={`${inputCls} resize-none`}
            value={summary.map((b) => b.text_en ?? '').join('\n')}
            onChange={(e) => setSummaryLines('text_en', e.target.value)}
            placeholder={'21.2km loop'}
          />
        </div>
      </div>

      <div className="space-y-3">
        {stops.length === 0 && (
          <p className="text-sm text-zinc-400 italic">아직 등록된 코스 스팟이 없습니다.</p>
        )}
        {stops.map((stop, idx) => (
          <div key={stop.id} className="rounded-xl border border-zinc-200 p-4 bg-zinc-50">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white">{idx + 1}</span>
                스팟 {idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveStop(idx, -1)} disabled={idx === 0} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 disabled:opacity-30">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveStop(idx, 1)} disabled={idx === stops.length - 1} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 disabled:opacity-30">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => removeStop(idx)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <StopPhoto stop={stop} slug={slug} onUploaded={(url) => updateStop(idx, { photo: url })} />

              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>장소 이름 (한국어) *</label>
                  <input className={inputCls} value={stop.name} onChange={(e) => updateStop(idx, { name: e.target.value })} placeholder="반포대교 분수" />
                </div>
                <div>
                  <label className={labelCls}>장소 이름 (영어)</label>
                  <input className={inputCls} value={stop.name_en ?? ''} onChange={(e) => updateStop(idx, { name_en: e.target.value })} placeholder="Banpo Bridge Fountain" />
                </div>
                <div>
                  <label className={labelCls}>구간/거리 설명 (한국어) *</label>
                  <input className={inputCls} value={stop.sub} onChange={(e) => updateStop(idx, { sub: e.target.value })} placeholder="+4.3km · 달빛무지개분수" />
                </div>
                <div>
                  <label className={labelCls}>구간/거리 설명 (영어)</label>
                  <input className={inputCls} value={stop.sub_en ?? ''} onChange={(e) => updateStop(idx, { sub_en: e.target.value })} placeholder="+4.3km · Moonlight Rainbow Fountain" />
                </div>
                <div>
                  <label className={labelCls}>배지 텍스트 (사진 우상단) *</label>
                  <input className={inputCls} value={stop.badge_text} onChange={(e) => updateStop(idx, { badge_text: e.target.value })} placeholder="4.3km / START / FINISH" />
                </div>
                <div>
                  <label className={labelCls}>배지 색상</label>
                  <select className={inputCls} value={stop.badge_color} onChange={(e) => updateStop(idx, { badge_color: e.target.value })}>
                    {COLOR_PRESETS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    {!COLOR_PRESETS.some((c) => c.value === stop.badge_color) && (
                      <option value={stop.badge_color}>{stop.badge_color}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>구간 묶음 라벨 <span className="text-zinc-400">(선택, 예: Day 1)</span></label>
                  <input className={inputCls} value={stop.day_label ?? ''} onChange={(e) => updateStop(idx, { day_label: e.target.value || undefined })} placeholder="여러 날짜로 나뉜 장거리 코스에만 사용" />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded accent-emerald-600" checked={!!stop.special} onChange={(e) => updateStop(idx, { special: e.target.checked })} />
                    리본 강조
                  </label>
                </div>
                {stop.special && (
                  <div>
                    <label className={labelCls}>리본 문구</label>
                    <input className={inputCls} value={stop.ribbon_text ?? ''} onChange={(e) => updateStop(idx, { ribbon_text: e.target.value })} placeholder="FREE!" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addStop}
        className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
      >
        <Plus className="h-4 w-4" />
        스팟 추가
      </button>
    </div>
  )
}
