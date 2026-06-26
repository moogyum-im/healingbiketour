'use client'

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UserSearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    router.push(trimmed ? `/admin/users?q=${encodeURIComponent(trimmed)}` : '/admin/users')
  }

  const handleClear = () => {
    setValue('')
    router.push('/admin/users')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="이름, 이메일, 연락처로 검색"
          className="w-full rounded-xl border border-zinc-300 pl-9 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
      >
        검색
      </button>
      {defaultValue && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          초기화
        </button>
      )}
    </form>
  )
}
