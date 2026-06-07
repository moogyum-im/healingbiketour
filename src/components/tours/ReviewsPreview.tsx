import Link from 'next/link'
import { Star, ChevronRight, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface ReviewsPreviewProps {
  tourId: string
  slug: string
}

export default async function ReviewsPreview({ tourId, slug }: ReviewsPreviewProps) {
  const supabase = await createClient()

  // reviews 쿼리 - profiles join 없이 (RLS 무관하게 동작)
  const [{ data: reviews }, { data: stats }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, content, created_at, user_id')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('reviews')
      .select('rating')
      .eq('tour_id', tourId),
  ])

  const all = stats ?? []
  const total = all.length
  const avgRating = total > 0 ? all.reduce((s, r) => s + r.rating, 0) / total : 0

  // 프로필 이름 별도 조회 (실패해도 익명으로 폴백)
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id).filter(Boolean))]
  let profileMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds)
    profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.name ?? '익명']))
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-zinc-900">리뷰</h2>
          {total > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-zinc-800">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-zinc-400">({total})</span>
            </div>
          )}
        </div>
        <Link
          href={`/tours/${slug}/reviews/new`}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          <PenLine className="h-3.5 w-3.5" />
          리뷰 작성
        </Link>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
          <p className="text-sm text-zinc-400">아직 리뷰가 없습니다.</p>
          <p className="text-xs text-zinc-300 mt-1">첫 번째 리뷰를 남겨보세요!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {(reviews ?? []).map((review) => {
              const name = profileMap[review.user_id] ?? '익명'
              return (
                <div key={review.id} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <div className="flex gap-0.5 shrink-0 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700 line-clamp-1">{review.content}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {name} · {new Date(review.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {total > 3 ? (
            <Link
              href={`/tours/${slug}/reviews`}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-zinc-200 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              전체 리뷰 {total}개 보기
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/tours/${slug}/reviews`}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-zinc-200 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              리뷰 전체보기
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </>
      )}
    </section>
  )
}
