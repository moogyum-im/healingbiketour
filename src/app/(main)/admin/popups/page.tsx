import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil } from 'lucide-react'
import Image from 'next/image'
import PopupActions from './PopupActions'

const POSITION_LABEL: Record<string, string> = {
  all: '전체', home: '홈', tours: '투어', rental: '렌탈', about: '회사소개',
}

export default async function PopupsAdminPage() {
  const supabase = await createClient()
  const { data: popups } = await supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">팝업 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">홈페이지에 표시될 팝업을 관리합니다.</p>
        </div>
        <Link
          href="/admin/popups/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> 새 팝업 추가
        </Link>
      </div>

      {(!popups || popups.length === 0) ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center text-zinc-400">
          등록된 팝업이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popups.map((popup) => {
            const expired = popup.end_date && popup.end_date < today
            const notStarted = popup.start_date && popup.start_date > today

            return (
              <div
                key={popup.id}
                className={`rounded-2xl border bg-white overflow-hidden shadow-sm ${popup.is_active && !expired ? 'border-emerald-200' : 'border-zinc-200 opacity-60'}`}
              >
                {/* 이미지 */}
                <div className="relative h-40 bg-zinc-100">
                  <Image src={popup.image_url} alt={popup.title} fill className="object-contain p-2" unoptimized />
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-zinc-900 text-sm">{popup.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                      expired ? 'bg-zinc-100 text-zinc-400' :
                      notStarted ? 'bg-amber-100 text-amber-600' :
                      popup.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
                    }`}>
                      {expired ? '기간만료' : notStarted ? '예약됨' : popup.is_active ? '활성' : '비활성'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-0.5 text-xs text-zinc-400">
                    <p>위치: <span className="font-semibold text-zinc-600">{POSITION_LABEL[popup.position] ?? popup.position}</span></p>
                    {(popup.start_date || popup.end_date) && (
                      <p>기간: {popup.start_date ?? '∞'} ~ {popup.end_date ?? '∞'}</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <PopupActions id={popup.id} isActive={popup.is_active} />
                    <Link
                      href={`/admin/popups/${popup.id}`}
                      className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      <Pencil className="h-3 w-3" /> 편집
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
