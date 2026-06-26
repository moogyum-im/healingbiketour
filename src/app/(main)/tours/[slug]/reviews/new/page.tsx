'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ChevronLeft, X, ImagePlus, Loader2, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const LABELS = ['매우 별로', '별로예요', '보통이에요', '좋아요', '최고예요']

export default function NewReviewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [user, setUser] = useState<{ id: string } | null>(null)
  const [tourId, setTourId] = useState<string | null>(null)
  const [tourTitle, setTourTitle] = useState('')

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase
      .from('tours')
      .select('id, title')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setTourId(data.id)
          setTourTitle(data.title)
        }
      })
  }, [slug])

  function addPhotos(files: FileList | null) {
    if (!files) return
    const next = Array.from(files).slice(0, 5 - photos.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos((prev) => [...prev, ...next])
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(photos[i].preview)
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!user) { setError('로그인이 필요합니다.'); return }
    if (!tourId) { setError('투어 정보를 불러오는 중입니다.'); return }
    if (rating === 0) { setError('별점을 선택해 주세요.'); return }
    if (content.trim().length < 10) { setError('리뷰는 10자 이상 작성해 주세요.'); return }

    setUploading(true)
    try {
      const imageUrls: string[] = []

      for (const { file } of photos) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('reviews')
          .upload(path, file, { upsert: true })
        if (uploadErr) throw uploadErr
        const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(path)
        imageUrls.push(urlData.publicUrl)
      }

      const { error: insertErr } = await supabase.from('reviews').insert({
        tour_id: tourId,
        user_id: user.id,
        booking_id: null,
        rating,
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : null,
      })
      if (insertErr) throw insertErr

      setDone(true)
      setTimeout(() => router.push(`/tours/${slug}/reviews`), 1500)
    } catch {
      setError('리뷰 등록 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
          <p className="text-xl font-bold text-zinc-900">리뷰가 등록되었습니다!</p>
          <p className="text-sm text-zinc-400 mt-2">잠시 후 이동합니다...</p>
        </div>
      </div>
    )
  }

  const displayed = hovered || rating

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href={`/tours/${slug}/reviews`}
          className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          리뷰 목록
        </Link>

        <h1 className="text-2xl font-bold text-zinc-900 mb-1">리뷰 작성</h1>
        {tourTitle && <p className="text-sm text-zinc-400 mb-8">{tourTitle}</p>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 별점 */}
          <div>
            <p className="text-sm font-semibold text-zinc-800 mb-3">별점 *</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= displayed
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              {displayed > 0 && (
                <span className="ml-2 text-sm font-medium text-amber-600">{LABELS[displayed - 1]}</span>
              )}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-2">
              리뷰 내용 * <span className="font-normal text-zinc-400">(최소 10자)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="투어를 경험하며 느낀 점을 자유롭게 작성해 주세요."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors resize-none"
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{content.length}자</p>
          </div>

          {/* 사진 첨부 */}
          <div>
            <p className="text-sm font-semibold text-zinc-800 mb-2">
              사진 첨부 <span className="font-normal text-zinc-400">(최대 5장)</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {photos.map(({ preview }, i) => (
                <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-zinc-200 group">
                  <Image src={preview} alt={`사진 ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">사진 추가</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />
          </div>

          {/* 에러 */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {/* 제출 */}
          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                업로드 중...
              </>
            ) : '리뷰 등록하기'}
          </button>

          {!user && (
            <p className="text-center text-sm text-zinc-400">
              <Link href="/auth/login" className="text-emerald-600 hover:underline">로그인</Link> 후 리뷰를 작성할 수 있습니다.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
