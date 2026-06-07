'use client'

import { useActionState } from 'react'
import { createNotice } from '@/lib/actions/notices'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewNoticePage() {
  const [state, action, pending] = useActionState(createNotice, null)

  return (
    <div className="max-w-2xl">
      <Link href="/admin/notices" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ChevronLeft className="h-4 w-4" />
        목록으로
      </Link>
      <h1 className="text-2xl font-black text-zinc-900 mb-8">새 공지 작성</h1>

      <form action={action} className="space-y-5">
        {state?.error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>
        )}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">제목</label>
          <input name="title" required className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">내용</label>
          <textarea name="content" required rows={12} className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none resize-none" />
        </div>
        <div className="flex items-center gap-3">
          <input type="hidden" name="is_published" value="false" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_published"
              value="true"
              defaultChecked
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-semibold text-zinc-700">즉시 공개</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? '저장 중...' : '저장'}
          </button>
          <Link href="/admin/notices" className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
