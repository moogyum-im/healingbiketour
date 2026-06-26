import Link from 'next/link'
import { Plus, Pencil, AlertCircle } from 'lucide-react'
import ToggleTourActive from './ToggleTourActive'
import SortOrderInput from './SortOrderInput'
import { getToursWithOverrides } from '@/lib/tours'

export const metadata = { title: '투어 관리 | 관리자' }

const categoryLabel: Record<string, string> = {
  city: '도심', coastal: '해안', mountain: '산악',
  cultural: '문화', night: '야간', family: '가족', national: '국토종주',
}
const difficultyLabel: Record<string, string> = {
  easy: '초급', moderate: '중급', hard: '상급',
}

function isDbId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export default async function AdminToursPage() {
  const tours = await getToursWithOverrides()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">투어 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">총 {tours.length}개의 투어</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          새 투어 등록
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-center px-3 py-3.5 font-semibold text-zinc-600 w-20">순서</th>
                <th className="text-left px-5 py-3.5 font-semibold text-zinc-600">투어명</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">카테고리</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">난이도</th>
                <th className="text-right px-4 py-3.5 font-semibold text-zinc-600">가격</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">평점</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">상태</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tours.map((tour) => {
                const inDb = isDbId(tour.id)
                return (
                  <tr key={tour.id} className={`hover:bg-zinc-50 transition-colors ${!inDb ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-3 py-3.5">
                      {inDb ? (
                        <SortOrderInput tourId={tour.id} initialOrder={tour.sort_order ?? 999} />
                      ) : (
                        <div className="text-center text-xs text-zinc-300 font-semibold">{tour.sort_order ?? '—'}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-900 max-w-[220px] truncate">{tour.title}</p>
                        {!inDb && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 whitespace-nowrap">
                            <AlertCircle className="h-3 w-3" /> DB 미등록
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
                        {categoryLabel[tour.category] ?? tour.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                        tour.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                        tour.difficulty === 'moderate' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {difficultyLabel[tour.difficulty] ?? tour.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-zinc-900">
                      {new Intl.NumberFormat('ko-KR').format(tour.price_krw)}원
                    </td>
                    <td className="px-4 py-3.5 text-center text-zinc-600">
                      ⭐ {Number(tour.rating).toFixed(1)} ({tour.review_count})
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {inDb ? (
                        <ToggleTourActive tourId={tour.id} isActive={tour.is_active} />
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {inDb ? (
                          <Link
                            href={`/admin/tours/${tour.id}`}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" /> 수정
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/tours/new?slug=${tour.slug}`}
                            className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" /> DB 등록
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
