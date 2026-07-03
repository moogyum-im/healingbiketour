import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ChevronLeft, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 0

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: tour } = await supabase.from('tours').select('title').eq('slug', slug).maybeSingle()
  return { title: tour ? `${tour.title} 리뷰` : '리뷰' }
}

export default async function TourReviewsPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: dbTour } = await supabase
    .from('tours')
    .select('id, title, is_active')
    .eq('slug', slug)
    .maybeSingle()

  if (!dbTour || dbTour.is_active === false) notFound()

  // reviews 쿼리 - profiles join 없이 (RLS 무관하게 동작)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, content, images, created_at')
    .eq('tour_id', dbTour.id)
    .order('created_at', { ascending: false })

  const all = reviews ?? []
  const total = all.length
  const avgRating = total > 0 ? all.reduce((s, r) => s + r.rating, 0) / total : 0

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: all.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* 뒤로가기 */}
        <Link
          href={`/tours/${slug}`}
          className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {dbTour.title}
        </Link>

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">리뷰</h1>
            {total > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-zinc-900">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-zinc-400">· {total}개의 리뷰</span>
              </div>
            )}
          </div>
          <Link
            href={`/tours/${slug}/reviews/new`}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <PenLine className="h-4 w-4" />
            리뷰 작성
          </Link>
        </div>

        {/* 별점 분포 */}
        {total > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 mb-8">
            <p className="text-sm font-semibold text-zinc-700 mb-3">별점 분포</p>
            <div className="space-y-2">
              {dist.map(({ star, count }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-4 text-xs text-zinc-500 text-right">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-zinc-400 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 리뷰 목록 */}
        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-20 text-center">
            <p className="text-zinc-400 text-sm">아직 작성된 리뷰가 없습니다.</p>
            <p className="text-zinc-300 text-xs mt-1">첫 번째 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {all.map((review) => {
              const images: string[] = (review.images as string[] | null) ?? []
              return (
                <div key={review.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400">
                        {new Date(review.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">{review.content}</p>
                  {images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {images.map((url, i) => (
                        <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-zinc-200">
                          <Image src={url} alt={`리뷰 사진 ${i + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
