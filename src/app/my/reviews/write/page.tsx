'use client'

import { useActionState, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Star, Gift, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { submitReview } from '@/lib/actions/reviews'
import { Suspense } from 'react'

function WriteReviewForm() {
  const params = useSearchParams()
  const router = useRouter()
  const bookingId = params.get('booking') ?? ''
  const tourId    = params.get('tour') ?? ''
  const tourTitle = params.get('title') ?? '투어'

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [state, action, pending] = useActionState(submitReview, null)

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900">리뷰가 등록되었습니다!</h2>
          <p className="mt-2 text-zinc-500">소중한 후기 감사합니다.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4">
          <Gift className="h-6 w-6 text-emerald-600 shrink-0" />
          <div className="text-left">
            <p className="font-bold text-emerald-800">2,000 크레딧이 적립되었습니다!</p>
            <p className="text-sm text-emerald-600">다음 투어 예약 시 2,000원 할인으로 사용하실 수 있습니다.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/my/bookings" className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            예약 목록으로
          </Link>
          <Link href="/tours" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            다른 투어 보기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl py-12 px-4">
      <div className="mb-8">
        <Link href="/my/bookings" className="text-sm text-zinc-400 hover:text-zinc-600">← 예약 목록</Link>
        <h1 className="mt-3 text-2xl font-black text-zinc-900">리뷰 작성</h1>
        <p className="mt-1 text-zinc-500 text-sm">{tourTitle}</p>
      </div>

      {/* 크레딧 안내 */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <Gift className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          리뷰를 작성하시면 <strong>2,000 크레딧</strong>을 적립해 드립니다.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-6">
        <input type="hidden" name="booking_id" value={bookingId} />
        <input type="hidden" name="tour_id" value={tourId} />
        <input type="hidden" name="rating" value={rating} />

        {/* 별점 */}
        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-3">별점</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-200'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 self-center text-sm font-semibold text-amber-600">
                {['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">
            리뷰 내용 <span className="text-zinc-400 font-normal">(10자 이상)</span>
          </label>
          <textarea
            name="content"
            required
            minLength={10}
            rows={5}
            placeholder="투어는 어떠셨나요? 다른 분들에게 도움이 되는 솔직한 후기를 남겨주세요."
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={pending} disabled={rating === 0}>
          리뷰 등록하기
        </Button>
      </form>
    </div>
  )
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-zinc-400">로딩 중...</div>}>
      <WriteReviewForm />
    </Suspense>
  )
}
