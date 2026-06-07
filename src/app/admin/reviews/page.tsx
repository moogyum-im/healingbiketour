import { createClient } from '@/lib/supabase/server'
import DeleteReviewButton from './DeleteReviewButton'
import { Star } from 'lucide-react'

export const metadata = { title: '리뷰 관리 | 관리자' }

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, content, created_at, user_id,
      tours ( title )
    `)
    .order('created_at', { ascending: false })

  // 프로필 이름 별도 조회
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id).filter(Boolean))]
  let profileMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds)
    profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.name ?? '(이름 없음)']))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">리뷰 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">총 {reviews?.length ?? 0}개의 리뷰</p>
      </div>

      <div className="space-y-3">
        {(reviews ?? []).length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-400">
            리뷰가 없습니다.
          </div>
        ) : (
          (reviews ?? []).map((review) => {
            const tour = (review as any).tours
            const name = profileMap[review.user_id] ?? '(이름 없음)'
            return (
              <div key={review.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {name} · {tour?.title ?? '-'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed">{review.content}</p>
                  </div>
                  <DeleteReviewButton reviewId={review.id} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
