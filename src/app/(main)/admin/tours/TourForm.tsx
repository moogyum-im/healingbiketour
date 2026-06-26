'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { revalidateTours } from '@/lib/actions/admin'
import type { TourOption } from '@/types'

interface TourFormData {
  title: string
  title_en: string
  slug: string
  description: string
  short_description: string
  category: string
  difficulty: string
  duration_hours: string
  distance_km: string
  max_participants: string
  price_krw: string
  price_usd: string
  thumbnail_url: string
  images: string[]
  meeting_point: string
  meeting_point_lat: string
  meeting_point_lng: string
  includes: string
  excludes: string
  requirements: string
  highlights: string
  options: TourOption[]
  is_active: boolean
}

interface TourFormProps {
  initialData?: Record<string, unknown>
}

const CATEGORIES = [
  { value: 'city', label: '도심 투어' },
  { value: 'coastal', label: '해안 투어' },
  { value: 'mountain', label: '산악 투어' },
  { value: 'cultural', label: '문화 투어' },
  { value: 'night', label: '야간 투어' },
  { value: 'family', label: '가족 투어' },
  { value: 'national', label: '국토종주' },
]
const DIFFICULTIES = [
  { value: 'easy', label: '초급' },
  { value: 'moderate', label: '중급' },
  { value: 'hard', label: '상급' },
]

function arrToText(arr: unknown): string {
  if (Array.isArray(arr)) return arr.join('\n')
  if (typeof arr === 'string') return arr
  return ''
}

function newOption(): TourOption {
  return { id: crypto.randomUUID(), label: '', price_modifier_krw: 0 }
}

export default function TourForm({ initialData }: TourFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const isEdit = !!initialData?.id

  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<TourFormData>({
    title:             String(initialData?.title ?? ''),
    title_en:          String(initialData?.title_en ?? ''),
    slug:              String(initialData?.slug ?? ''),
    description:       String(initialData?.description ?? ''),
    short_description: String(initialData?.short_description ?? ''),
    category:          String(initialData?.category ?? 'city'),
    difficulty:        String(initialData?.difficulty ?? 'easy'),
    duration_hours:    String(initialData?.duration_hours ?? ''),
    distance_km:       String(initialData?.distance_km ?? ''),
    max_participants:  String(initialData?.max_participants ?? '10'),
    price_krw:         String(initialData?.price_krw ?? ''),
    price_usd:         String(initialData?.price_usd ?? ''),
    thumbnail_url:     String(initialData?.thumbnail_url ?? ''),
    images:            Array.isArray(initialData?.images) ? (initialData!.images as string[]) : [],
    meeting_point:     String(initialData?.meeting_point ?? ''),
    meeting_point_lat: String(initialData?.meeting_point_lat ?? ''),
    meeting_point_lng: String(initialData?.meeting_point_lng ?? ''),
    includes:          arrToText(initialData?.includes),
    excludes:          arrToText(initialData?.excludes),
    requirements:      arrToText(initialData?.requirements),
    highlights:        arrToText(initialData?.highlights),
    options:           Array.isArray(initialData?.options) ? (initialData!.options as TourOption[]) : [],
    is_active:         Boolean(initialData?.is_active ?? true),
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const set = (key: keyof TourFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from('tours').upload(path, file, { upsert: true })
    if (error) { toast.error('업로드 실패: ' + error.message); return null }
    const { data: { publicUrl } } = supabase.storage.from('tours').getPublicUrl(path)
    return publicUrl
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `thumbnails/${form.slug || 'new'}-${Date.now()}.${ext}`
    const url = await uploadFile(file, path)
    if (url) setForm((f) => ({ ...f, thumbnail_url: url }))
    setUploading(false)
    e.target.value = ''
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `gallery/${form.slug || 'new'}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const url = await uploadFile(file, path)
      if (url) urls.push(url)
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
    e.target.value = ''
  }

  const removeGalleryImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  // Options helpers
  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, newOption()] }))
  const removeOption = (idx: number) => setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))
  const setOption = (idx: number, key: keyof TourOption, value: string | number) => {
    setForm((f) => {
      const options = [...f.options]
      options[idx] = { ...options[idx], [key]: value }
      return { ...f, options }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      title:             form.title,
      title_en:          form.title_en || null,
      slug:              form.slug,
      description:       form.description,
      short_description: form.short_description,
      category:          form.category,
      difficulty:        form.difficulty,
      duration_hours:    parseFloat(form.duration_hours),
      distance_km:       parseFloat(form.distance_km),
      max_participants:  parseInt(form.max_participants),
      price_krw:         parseInt(form.price_krw),
      price_usd:         form.price_usd ? parseFloat(form.price_usd) : null,
      thumbnail_url:     form.thumbnail_url || null,
      images:            form.images,
      meeting_point:     form.meeting_point,
      meeting_point_lat: form.meeting_point_lat ? parseFloat(form.meeting_point_lat) : null,
      meeting_point_lng: form.meeting_point_lng ? parseFloat(form.meeting_point_lng) : null,
      includes:          form.includes.split('\n').map((s) => s.trim()).filter(Boolean),
      excludes:          form.excludes.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements:      form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      highlights:        form.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      options:           form.options.length > 0 ? form.options : null,
      is_active:         form.is_active,
      updated_at:        new Date().toISOString(),
    }

    let error
    if (isEdit) {
      ;({ error } = await supabase.from('tours').update(payload).eq('id', String(initialData!.id)))
    } else {
      ;({ error } = await supabase.from('tours').insert(payload))
    }

    if (error) {
      toast.error(error.message)
    } else {
      await revalidateTours(form.slug)
      toast.success(isEdit ? '투어가 수정되었습니다.' : '투어가 등록되었습니다.')
      router.push('/admin/tours')
      router.refresh()
    }
    setLoading(false)
  }

  const inputCls = 'w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
  const labelCls = 'block mb-1.5 text-sm font-medium text-zinc-700'
  const textareaCls = `${inputCls} resize-none`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="font-bold text-zinc-900 text-lg">기본 정보</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>투어명 (한국어) *</label>
            <input type="text" required value={form.title} onChange={set('title')} className={inputCls} placeholder="한강 라이딩 & 야경 투어" />
          </div>
          <div>
            <label className={labelCls}>투어명 (영어)</label>
            <input type="text" value={form.title_en} onChange={set('title_en')} className={inputCls} placeholder="Han River Night Cycling Tour" />
          </div>
        </div>

        <div>
          <label className={labelCls}>슬러그 (URL 경로) *</label>
          <input type="text" required value={form.slug} onChange={set('slug')} className={inputCls} placeholder="hangang-night-tour" />
          <p className="mt-1 text-xs text-zinc-400">영문 소문자와 하이픈만 사용. 예: hangang-night-tour</p>
        </div>

        <div>
          <label className={labelCls}>짧은 설명 *</label>
          <input type="text" required value={form.short_description} onChange={set('short_description')} className={inputCls} placeholder="한강을 따라 서울의 아름다운 야경을 즐기는 저녁 라이딩" />
        </div>

        <div>
          <label className={labelCls}>상세 설명 *</label>
          <textarea required rows={5} value={form.description} onChange={set('description')} className={textareaCls} placeholder="투어에 대한 자세한 설명을 입력하세요..." />
        </div>
      </section>

      {/* 투어 속성 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="font-bold text-zinc-900 text-lg">투어 속성</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>카테고리 *</label>
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>난이도 *</label>
            <select value={form.difficulty} onChange={set('difficulty')} className={inputCls}>
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>소요 시간 (시간) *</label>
            <input type="number" required step="any" min="0" value={form.duration_hours} onChange={set('duration_hours')} className={inputCls} placeholder="3" />
          </div>
          <div>
            <label className={labelCls}>거리 (km) *</label>
            <input type="number" required step="any" min="0" value={form.distance_km} onChange={set('distance_km')} className={inputCls} placeholder="20" />
          </div>
          <div>
            <label className={labelCls}>최대 인원 *</label>
            <input type="number" required min="1" max="50" value={form.max_participants} onChange={set('max_participants')} className={inputCls} placeholder="12" />
          </div>
        </div>
      </section>

      {/* 가격 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="font-bold text-zinc-900 text-lg">가격</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>가격 (원) *</label>
            <input type="number" required min="0" value={form.price_krw} onChange={set('price_krw')} className={inputCls} placeholder="49000" />
          </div>
          <div>
            <label className={labelCls}>가격 (USD)</label>
            <input type="number" step="0.01" min="0" value={form.price_usd} onChange={set('price_usd')} className={inputCls} placeholder="37" />
          </div>
        </div>
      </section>

      {/* 이미지 & 집결지 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
        <h2 className="font-bold text-zinc-900 text-lg">이미지 & 집결지</h2>

        {/* 썸네일 */}
        <div>
          <label className={labelCls}>대표 썸네일 이미지</label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={form.thumbnail_url}
                onChange={set('thumbnail_url')}
                className={inputCls}
                placeholder="URL을 직접 입력하거나 파일을 업로드하세요"
              />
            </div>
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 shrink-0"
            >
              <Upload className="h-4 w-4" />
              파일 업로드
            </button>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailUpload}
            />
          </div>
          {form.thumbnail_url && (
            <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
              <Image src={form.thumbnail_url} alt="썸네일 미리보기" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* 갤러리 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-700">갤러리 이미지</label>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              이미지 추가
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
          </div>
          {form.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                  <Image src={url} alt={`갤러리 ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 italic">갤러리 이미지가 없습니다.</p>
          )}
          {uploading && <p className="text-xs text-emerald-600 mt-2 animate-pulse">업로드 중...</p>}
        </div>

        {/* 집결지 */}
        <div>
          <label className={labelCls}>집결지 *</label>
          <input type="text" required value={form.meeting_point} onChange={set('meeting_point')} className={inputCls} placeholder="여의도 한강공원 자전거 대여소" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>위도</label>
            <input type="number" step="any" value={form.meeting_point_lat} onChange={set('meeting_point_lat')} className={inputCls} placeholder="37.5283" />
          </div>
          <div>
            <label className={labelCls}>경도</label>
            <input type="number" step="any" value={form.meeting_point_lng} onChange={set('meeting_point_lng')} className={inputCls} placeholder="126.9324" />
          </div>
        </div>
      </section>

      {/* 코스 옵션 (왕복/편도 등) */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 text-lg">코스 옵션 (왕복/편도 등)</h2>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            옵션 추가
          </button>
        </div>
        {form.options.length === 0 && (
          <p className="text-sm text-zinc-400 italic">코스 옵션이 없습니다. 왕복/편도 구분이 있는 경우 추가하세요.</p>
        )}
        {form.options.map((opt, idx) => (
          <div key={opt.id} className="rounded-xl border border-zinc-200 p-4 space-y-3 bg-zinc-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">옵션 {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>옵션명 (한국어) *</label>
                <input
                  type="text"
                  required
                  value={opt.label}
                  onChange={(e) => setOption(idx, 'label', e.target.value)}
                  className={inputCls}
                  placeholder="왕복"
                />
              </div>
              <div>
                <label className={labelCls}>옵션명 (영어)</label>
                <input
                  type="text"
                  value={opt.label_en ?? ''}
                  onChange={(e) => setOption(idx, 'label_en', e.target.value)}
                  className={inputCls}
                  placeholder="Round Trip"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>설명</label>
                <input
                  type="text"
                  value={opt.description ?? ''}
                  onChange={(e) => setOption(idx, 'description', e.target.value)}
                  className={inputCls}
                  placeholder="당산역 → 임진각 → 당산역 (150km)"
                />
              </div>
              <div>
                <label className={labelCls}>소요 시간 (시간)</label>
                <input
                  type="text"
                  value={opt.duration_hours ?? ''}
                  onChange={(e) => setOption(idx, 'duration_hours', e.target.value)}
                  className={inputCls}
                  placeholder="10시간~15시간"
                />
              </div>
              <div>
                <label className={labelCls}>인당 추가금액 (원)</label>
                <input
                  type="number"
                  min="0"
                  value={opt.price_modifier_krw}
                  onChange={(e) => setOption(idx, 'price_modifier_krw', parseInt(e.target.value) || 0)}
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelCls}>고정 추가금액 (원, 예: 용달비)</label>
                <input
                  type="number"
                  min="0"
                  value={opt.flat_fee_krw ?? ''}
                  onChange={(e) => setOption(idx, 'flat_fee_krw', parseInt(e.target.value) || 0)}
                  className={inputCls}
                  placeholder="100000"
                />
                <p className="mt-1 text-xs text-zinc-400">편도 시 용달비 등 1회 고정 추가비용</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 포함/불포함/조건/하이라이트 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="font-bold text-zinc-900 text-lg">세부 내용 (각 항목을 줄바꿈으로 구분)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>포함 항목</label>
            <textarea rows={4} value={form.includes} onChange={set('includes')} className={textareaCls} placeholder={'자전거 대여\n헬멧 및 안전장비\n전문 가이드'} />
          </div>
          <div>
            <label className={labelCls}>불포함 항목</label>
            <textarea rows={4} value={form.excludes} onChange={set('excludes')} className={textareaCls} placeholder={'개인 간식\n추가 음료'} />
          </div>
          <div>
            <label className={labelCls}>참가 조건</label>
            <textarea rows={4} value={form.requirements} onChange={set('requirements')} className={textareaCls} placeholder={'기본 자전거 탑승 가능자\n만 12세 이상'} />
          </div>
          <div>
            <label className={labelCls}>하이라이트</label>
            <textarea rows={4} value={form.highlights} onChange={set('highlights')} className={textareaCls} placeholder={'한강 야경 감상\n여의도 불꽃놀이 포인트'} />
          </div>
        </div>
      </section>

      {/* 활성 상태 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="h-4 w-4 rounded accent-emerald-600"
          />
          <div>
            <p className="font-medium text-zinc-900">투어 활성화</p>
            <p className="text-sm text-zinc-500">체크 해제 시 사이트에 노출되지 않습니다</p>
          </div>
        </label>
      </section>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? '투어 수정 완료' : '투어 등록'}
        </Button>
      </div>
    </form>
  )
}
