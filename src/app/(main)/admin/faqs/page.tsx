'use client'

import { useState, useEffect, useActionState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { upsertFaq, deleteFaq } from '@/lib/actions/faqs'
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react'

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
}

function FaqModal({ faq, onClose }: { faq: Faq | null; onClose: () => void }) {
  const [state, action, pending] = useActionState(upsertFaq, null)

  useEffect(() => {
    if (state?.success) onClose()
  }, [state, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="font-black text-zinc-900">{faq ? 'FAQ 수정' : '새 FAQ 추가'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
        </div>
        <form action={action} className="p-6 space-y-4">
          {faq && <input type="hidden" name="id" value={faq.id} />}
          {state?.error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">카테고리</label>
              <input name="category" defaultValue={faq?.category ?? '일반'} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">표시 순서</label>
              <input name="display_order" type="number" defaultValue={faq?.display_order ?? 0} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">질문</label>
            <input name="question" required defaultValue={faq?.question} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">답변</label>
            <textarea name="answer" required rows={5} defaultValue={faq?.answer} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none resize-none" />
          </div>
          <div>
            <input type="hidden" name="is_active" value="false" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" value="true" defaultChecked={faq?.is_active ?? true} className="rounded border-zinc-300 text-emerald-600" />
              <span className="text-sm font-semibold text-zinc-700">활성화</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={pending} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {pending ? '저장 중...' : '저장'}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [editTarget, setEditTarget] = useState<Faq | null | undefined>(undefined)

  const load = () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.from('faqs').select('*').order('display_order').then(({ data }) => setFaqs(data ?? []))
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await deleteFaq(id)
    load()
  }

  const handleClose = () => {
    setEditTarget(undefined)
    load()
  }

  return (
    <div>
      {editTarget !== undefined && (
        <FaqModal faq={editTarget} onClose={handleClose} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">FAQ 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">총 {faqs.length}개</p>
        </div>
        <button
          onClick={() => setEditTarget(null)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          새 FAQ 추가
        </button>
      </div>

      {!faqs.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
          FAQ가 없습니다. 추가해 보세요.
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-zinc-300 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">{faq.category}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${faq.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {faq.is_active ? '활성' : '비활성'}
                    </span>
                    <span className="text-xs text-zinc-400">순서 {faq.display_order}</span>
                  </div>
                  <p className="font-semibold text-zinc-900 text-sm">{faq.question}</p>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditTarget(faq)} className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
                    <Pencil className="h-3.5 w-3.5" />
                    수정
                  </button>
                  <button onClick={() => handleDelete(faq.id)} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
