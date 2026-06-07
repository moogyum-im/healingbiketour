import { createClient } from '@/lib/supabase/server'
import { Gift, TrendingUp, Users } from 'lucide-react'
import GrantCreditForm from './GrantCreditForm'

export const metadata = { title: '크레딧 관리' }

export default async function AdminCreditsPage() {
  const supabase = await createClient()

  const [
    { data: balances },
    { data: recent },
    { data: stats },
  ] = await Promise.all([
    // 크레딧 잔액 보유자 목록
    supabase
      .from('credit_balances')
      .select('user_id, balance')
      .gt('balance', 0)
      .order('balance', { ascending: false })
      .limit(50),
    // 최근 크레딧 거래
    supabase
      .from('credits')
      .select('id, user_id, amount, type, description, created_at, profiles(name, email)')
      .order('created_at', { ascending: false })
      .limit(20),
    // 전체 통계
    supabase
      .from('credits')
      .select('amount, type'),
  ])

  const totalIssued = (stats ?? []).filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0)
  const totalUsed = (stats ?? []).filter(c => c.amount < 0).reduce((s, c) => s + Math.abs(c.amount), 0)

  const typeLabel: Record<string, string> = {
    review_reward: '리뷰 적립',
    admin_grant: '관리자 지급',
    purchase_used: '결제 사용',
    refund: '환불',
    expired: '만료',
  }
  const typeColor: Record<string, string> = {
    review_reward: 'bg-emerald-100 text-emerald-700',
    admin_grant: 'bg-blue-100 text-blue-700',
    purchase_used: 'bg-red-100 text-red-700',
    refund: 'bg-amber-100 text-amber-700',
    expired: 'bg-zinc-100 text-zinc-500',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">크레딧 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">회원 크레딧 지급, 조회, 내역 관리</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '총 발행 크레딧', value: `${totalIssued.toLocaleString()}C`, icon: Gift, color: 'bg-emerald-50 text-emerald-600' },
          { label: '총 사용 크레딧', value: `${totalUsed.toLocaleString()}C`, icon: TrendingUp, color: 'bg-red-50 text-red-600' },
          { label: '잔액 보유 회원', value: `${(balances ?? []).length}명`, icon: Users, color: 'bg-blue-50 text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{value}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 크레딧 수동 지급 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-bold text-zinc-900 mb-4">크레딧 수동 지급</h2>
          <GrantCreditForm />
        </div>

        {/* 잔액 보유 회원 */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900">크레딧 잔액 보유 회원</h2>
          </div>
          <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
            {(balances ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-400">데이터 없음</p>
            ) : (
              (balances ?? []).map((b) => (
                <div key={b.user_id} className="flex items-center justify-between px-5 py-3">
                  <p className="text-xs text-zinc-500 font-mono truncate max-w-[200px]">{b.user_id}</p>
                  <span className="text-sm font-bold text-emerald-700">{(b.balance ?? 0).toLocaleString()}C</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 최근 거래 내역 */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">최근 크레딧 거래 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600 text-xs">회원</th>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600 text-xs">유형</th>
                <th className="px-5 py-3 text-left font-semibold text-zinc-600 text-xs">설명</th>
                <th className="px-5 py-3 text-right font-semibold text-zinc-600 text-xs">금액</th>
                <th className="px-5 py-3 text-right font-semibold text-zinc-600 text-xs">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(recent ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-zinc-400">거래 내역 없음</td>
                </tr>
              ) : (
                (recent ?? []).map((c) => {
                  const profile = (c as any).profiles
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50">
                      <td className="px-5 py-3 text-xs text-zinc-600">
                        {profile?.name ?? '-'}<br />
                        <span className="text-zinc-400">{profile?.email ?? c.user_id.slice(0, 8)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeColor[c.type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                          {typeLabel[c.type] ?? c.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-500">{c.description ?? '-'}</td>
                      <td className={`px-5 py-3 text-right font-bold text-sm ${c.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {c.amount > 0 ? '+' : ''}{c.amount.toLocaleString()}C
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-zinc-400">
                        {new Date(c.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
