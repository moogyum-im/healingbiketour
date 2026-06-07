'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'

export default function ToggleTourActive({ tourId, isActive }: { tourId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase
      .from('tours')
      .update({ is_active: !active })
      .eq('id', tourId)

    if (error) {
      toast.error('상태 변경 실패')
    } else {
      setActive(!active)
      toast.success(active ? '비활성화되었습니다' : '활성화되었습니다')
      // 모든 관련 페이지 캐시 갱신
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
      {active ? '활성' : '비활성'}
    </button>
  )
}
