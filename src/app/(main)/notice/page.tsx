import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChevronRight, Megaphone } from 'lucide-react'

export const metadata = { title: '공지사항 | 힐링바이크투어' }

export default async function NoticePage() {
  const supabase = await createClient()
  const { data: notices } = await supabase
    .from('notices')
    .select('id, title, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Megaphone className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900">공지사항</h1>
        </div>

        {!notices?.length ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm divide-y divide-zinc-100">
            {notices.map((n, i) => (
              <Link
                key={n.id}
                href={`/notice/${n.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm text-zinc-400 w-8 shrink-0">{(notices.length - i).toString().padStart(2, '0')}</span>
                  <span className="text-sm font-semibold text-zinc-800 truncate group-hover:text-emerald-700">{n.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-zinc-400">
                    {new Date(n.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-emerald-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
