import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: notice } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!notice) notFound()

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/notice" className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
          <ChevronLeft className="h-4 w-4" />
          공지사항 목록
        </Link>
        <article className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <header className="border-b border-zinc-100 pb-6 mb-6">
            <h1 className="text-2xl font-black text-zinc-900 leading-tight">{notice.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </header>
          <div className="prose prose-zinc max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </article>
      </div>
    </div>
  )
}
