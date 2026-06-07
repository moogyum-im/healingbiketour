'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [deleted, setDeleted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (deleted) return null

  const handleDelete = async () => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    if (error) {
      toast.error('삭제 실패')
    } else {
      toast.success('리뷰가 삭제되었습니다.')
      setDeleted(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors shrink-0"
    >
      <Trash2 className="h-3.5 w-3.5" />
      삭제
    </button>
  )
}
