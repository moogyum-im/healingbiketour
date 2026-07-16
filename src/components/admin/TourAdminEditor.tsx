'use client'

import { useSession } from '@/providers/SessionProvider'
import { useState, useRef, useTransition } from 'react'
import { Camera, Pencil, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { revalidateTours } from '@/lib/actions/admin'
import type { Tour } from '@/types'

interface Props {
  tour: Tour
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// tours 테이블 upsert — DB에 없으면 INSERT, 있으면 UPDATE
async function saveTourUpdate(baseTour: Tour, patch: Record<string, unknown>) {
  const supabase = getSupabase()
  const payload = {
    slug:              baseTour.slug,
    title:             baseTour.title,
    title_en:          baseTour.title_en ?? null,
    description:       baseTour.description,
    short_description: baseTour.short_description,
    category:          baseTour.category,
    difficulty:        baseTour.difficulty,
    duration_hours:    baseTour.duration_hours,
    distance_km:       baseTour.distance_km,
    max_participants:  baseTour.max_participants,
    price_krw:         baseTour.price_krw,
    price_usd:         baseTour.price_usd ?? null,
    thumbnail_url:     baseTour.thumbnail_url || null,
    images:            baseTour.images ?? [],
    meeting_point:     baseTour.meeting_point,
    meeting_point_lat: baseTour.meeting_point_lat ?? null,
    meeting_point_lng: baseTour.meeting_point_lng ?? null,
    includes:          baseTour.includes ?? [],
    excludes:          baseTour.excludes ?? [],
    requirements:      baseTour.requirements ?? [],
    highlights:        baseTour.highlights ?? [],
    options:           baseTour.options ?? null,
    sort_order:        baseTour.sort_order ?? 999,
    is_active:         baseTour.is_active,
    updated_at:        new Date().toISOString(),
    ...patch,
  }
  const { error } = await supabase
    .from('tours')
    .upsert(payload, { onConflict: 'slug' })
  if (error) throw error
  await revalidateTours(baseTour.slug)
}

// ── 사진 교체 버튼 ──────────────────────────────────────────
function PhotoEditButton({ baseTour, onDone }: { baseTour: Tour; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = getSupabase()
      const ext = file.name.split('.').pop()
      const path = `tours/${baseTour.slug}/thumbnail.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('tours')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('tours').getPublicUrl(path)
      const urlWithBuster = `${publicUrl}?t=${Date.now()}`
      await saveTourUpdate(baseTour, { thumbnail_url: urlWithBuster })
      toast.success('사진이 업데이트됐습니다')
      onDone()
    } catch (err) {
      toast.error('업로드 실패: ' + (err as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-emerald-600 disabled:opacity-60 transition-colors"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        {uploading ? '업로드 중...' : '사진 교체'}
      </button>
    </>
  )
}

// ── 텍스트 편집 패널 ────────────────────────────────────────
function TextEditPanel({
  baseTour, onClose, onDone,
}: {
  baseTour: Tour
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = useState({
    title:       baseTour.title,
    description: baseTour.description,
    highlights:  baseTour.highlights.join('\n'),
  })
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveTourUpdate(baseTour, {
          title:       form.title,
          description: form.description,
          highlights:  form.highlights.split('\n').map(h => h.trim()).filter(Boolean),
        })
        toast.success('저장됐습니다')
        onDone()
        onClose()
      } catch (err) {
        toast.error('저장 실패: ' + (err as Error).message)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="font-black text-zinc-900">투어 내용 수정</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">투어 제목</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">투어 소개</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
              하이라이트 <span className="text-zinc-400 font-normal">(한 줄에 하나씩)</span>
            </label>
            <textarea
              rows={6}
              value={form.highlights}
              onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-mono focus:border-emerald-400 focus:outline-none resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 border-t border-zinc-100 px-6 py-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isPending ? '저장 중...' : '저장'}
          </button>
          <button onClick={onClose} className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ───────────────────────────────────────────
export default function TourAdminEditor({ tour }: Props) {
  const { role } = useSession()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (role !== 'admin') return null

  const refresh = () => router.refresh()

  return (
    <>
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <PhotoEditButton baseTour={tour} onDone={refresh} />
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-blue-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              내용 수정
            </button>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1.5 text-[11px] font-bold text-white/70 backdrop-blur-sm hover:text-white transition-colors"
        >
          {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          {collapsed ? '관리자 도구' : '접기'}
        </button>
      </div>

      {editing && (
        <TextEditPanel
          baseTour={tour}
          onClose={() => setEditing(false)}
          onDone={refresh}
        />
      )}
    </>
  )
}
