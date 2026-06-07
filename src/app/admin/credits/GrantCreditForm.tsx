'use client'

import { useActionState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { grantCredit } from '@/lib/actions/admin'

export default function GrantCreditForm() {
  const [state, action, pending] = useActionState(grantCredit, null)

  return (
    <form action={action} className="space-y-4">
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
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">회원 이메일</label>
        <input
          type="email" name="email" required
          placeholder="member@example.com"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">크레딧 금액</label>
        <div className="relative">
          <input
            type="number" name="amount" required min="1" max="100000"
            placeholder="예: 5000"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">크레딧 (= 원)</span>
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

      <Button type="submit" className="w-full" loading={pending}>
        크레딧 지급하기
      </Button>
    </form>
  )
}
