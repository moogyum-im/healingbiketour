'use client'

import { useActionState, useEffect, useState } from 'react'
import { X, Gift, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { grantCredit } from '@/lib/actions/admin'

interface Props {
  userName: string
  userEmail: string
}

export default function GrantCreditModal({ userName, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(grantCredit, null)

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => setOpen(false), 1500)
      return () => clearTimeout(t)
    }
  }, [state?.success])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
      >
        크레딧 지급
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-zinc-900">크레딧 지급</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-800">{userName}</p>
              <p className="text-xs text-zinc-500">{userEmail}</p>
            </div>

            <form action={action} className="space-y-4">
              <input type="hidden" name="email" value={userEmail} />

              {state?.error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {state.error}
                </div>
              )}
              {state?.success && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {state.success}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">크레딧 금액</label>
                <div className="relative">
                  <input
                    type="number" name="amount" required min="1" max="100000"
                    placeholder="예: 5000"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 pr-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">C</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">지급 사유</label>
                <select
                  name="reason"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="이벤트 당첨">이벤트 당첨</option>
                  <option value="불편 보상">불편 보상</option>
                  <option value="프로모션">프로모션</option>
                  <option value="VIP 혜택">VIP 혜택</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  취소
                </Button>
                <Button type="submit" className="flex-1" loading={pending}>
                  지급하기
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
