'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, ExternalLink } from 'lucide-react'
import { createPopup, updatePopup } from '@/lib/actions/popups'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import Image from 'next/image'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const POSITIONS = [
  { value: 'all',    label: '전체 페이지' },
  { value: 'home',   label: '홈' },
  { value: 'tours',  label: '투어 목록' },
  { value: 'rental', label: '자전거 렌탈' },
  { value: 'about',  label: '회사소개' },
]

interface PopupData {
  id?: string
  title?: string
  image_url?: string
  link_url?: string
  position?: string
  is_active?: boolean
  start_date?: string
  end_date?: string
}

export default function PopupForm({ initial }: { initial?: PopupData }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = getSupabase()
      const ext = file.name.split('.').pop()
      const path = `popups/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('tours')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('tours').getPublicUrl(path)
      setImageUrl(publicUrl)
      toast.success('이미지 업로드 완료')
    } catch (err) {
      toast.error('업로드 실패: ' + (err as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!imageUrl) { toast.error('이미지를 업로드해주세요'); return }
    setSaving(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('image_url', imageUrl)
      fd.set('is_active', String(isActive))
      if (initial?.id) {
        await updatePopup(initial.id, fd)
        toast.success('수정 완료')
      } else {
        await createPopup(fd)
        toast.success('팝업 등록 완료')
      }
      router.push('/admin/popups')
    } catch {
      toast.error('저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* 팝업명 */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">팝업명 (관리용)</label>
        <input name="title" defaultValue={initial?.title} required placeholder="예: 6월 이벤트 팝업" className={inputCls} />
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">팝업 이미지</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? '업로드 중...' : '이미지 선택'}
        </button>
        <p className="mt-1.5 text-xs text-zinc-400">원본 해상도 그대로 표시됩니다. 권장: 800×600 이하 (최대 90vw × 85vh)</p>

        {imageUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 inline-block">
            <Image
              src={imageUrl}
              alt="팝업 미리보기"
              width={400}
              height={300}
              className="object-contain max-h-64"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* 링크 URL */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">클릭 시 이동 URL (선택)</label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input name="link_url" defaultValue={initial?.link_url ?? ''} placeholder="https://... 또는 /tours" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {/* 표시 위치 */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">표시 위치</label>
        <select name="position" defaultValue={initial?.position ?? 'all'} className={inputCls}>
          {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* 기간 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">시작일 (선택)</label>
          <input type="date" name="start_date" defaultValue={initial?.start_date ?? ''} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">종료일 (선택)</label>
          <input type="date" name="end_date" defaultValue={initial?.end_date ?? ''} className={inputCls} />
        </div>
      </div>
      <p className="text-xs text-zinc-400 -mt-4">기간을 비워두면 수동으로 비활성화할 때까지 표시됩니다.</p>

      {/* 활성화 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(v => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-sm font-medium text-zinc-700">{isActive ? '활성화' : '비활성화'}</span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial?.id ? '수정 저장' : '팝업 등록'}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
          취소
        </button>
      </div>
    </form>
  )
}
