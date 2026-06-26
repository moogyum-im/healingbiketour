'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'

export default function AdminRoleToggle({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!confirm(`이 회원을 ${role === 'admin' ? '일반 사용자' : '관리자'}로 변경하시겠습니까?`)) return
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const newRole = role === 'admin' ? 'user' : 'admin'
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)

    if (error) {
      toast.error('권한 변경 실패')
    } else {
      setRole(newRole)
      toast.success(`${newRole === 'admin' ? '관리자' : '일반 사용자'}로 변경되었습니다.`)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
        role === 'admin'
          ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
      }`}
    >
      {role === 'admin' ? '관리자' : '일반'}
    </button>
  )
}
