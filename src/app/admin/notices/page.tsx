import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { deleteNotice } from '@/lib/actions/notices'

export default async function AdminNoticesPage() {
  const supabase = await createClient()
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">공지사항 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">총 {notices?.length ?? 0}개</p>
        </div>
        <Link
          href="/admin/notices/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          새 공지 작성
        </Link>
      </div>

      {!notices?.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
          작성된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600">제목</th>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600">상태</th>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600">작성일</th>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {notices.map((n) => (
                <tr key={n.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3.5 font-medium text-zinc-800 max-w-xs truncate">{n.title}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      n.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {n.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {n.is_published ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">{new Date(n.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/notices/${n.id}/edit`}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        수정
                      </Link>
                      <form action={deleteNotice.bind(null, n.id)}>
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          onClick={(e) => { if (!confirm('삭제하시겠습니까?')) e.preventDefault() }}
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
