import { createClient } from '@/lib/supabase/server'
import AdminRoleToggle from './AdminRoleToggle'
import UserSearchBar from './UserSearchBar'
import GrantCreditModal from './GrantCreditModal'

export const metadata = { title: '회원 관리 | 관리자' }

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, email, name, phone, provider, role, created_at')
    .order('created_at', { ascending: false })

  if (q?.trim()) {
    query = query.or(
      `name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`
    )
  }

  const [{ data: profiles }, { data: creditBalances }] = await Promise.all([
    query,
    supabase.from('credit_balances').select('user_id, balance').gt('balance', 0),
  ])

  const balanceMap = new Map(
    (creditBalances ?? []).map((b) => [b.user_id, b.balance])
  )

  const providerBadge: Record<string, string> = {
    google: '🔵 Google',
    kakao:  '💛 카카오',
    naver:  '💚 네이버',
    email:  '✉️ 이메일',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">회원 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {q ? `"${q}" 검색 결과 ${profiles?.length ?? 0}명` : `총 ${profiles?.length ?? 0}명의 회원`}
          </p>
        </div>
      </div>

      <UserSearchBar defaultValue={q ?? ''} />

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3.5 font-semibold text-zinc-600">이름</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">이메일</th>
                <th className="text-left px-4 py-3.5 font-semibold text-zinc-600">연락처</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">가입 방법</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">가입일</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">크레딧 잔액</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">권한</th>
                <th className="text-center px-4 py-3.5 font-semibold text-zinc-600">크레딧</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(profiles ?? []).map((profile) => {
                const balance = balanceMap.get(profile.id) ?? 0
                return (
                  <tr key={profile.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-zinc-900">
                      {profile.name ?? '(이름 없음)'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">{profile.email}</td>
                    <td className="px-4 py-3.5 text-zinc-600">{profile.phone ?? '-'}</td>
                    <td className="px-4 py-3.5 text-center text-xs">
                      {providerBadge[profile.provider ?? 'email'] ?? profile.provider}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-zinc-400">
                      {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {balance > 0 ? (
                        <span className="text-sm font-bold text-emerald-600">
                          {balance.toLocaleString()}C
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <AdminRoleToggle userId={profile.id} currentRole={profile.role ?? 'user'} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <GrantCreditModal
                        userName={profile.name ?? '(이름 없음)'}
                        userEmail={profile.email ?? ''}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(profiles ?? []).length === 0 && (
            <div className="py-16 text-center text-sm text-zinc-400">
              {q ? `"${q}"에 해당하는 회원이 없습니다.` : '회원이 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
