import { createClient } from '@/lib/supabase/server'
import { updateApplicationStatus } from '@/lib/actions/guide'
import { Mail, Phone, Globe, Award } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: '검토 중',  color: 'bg-yellow-50 text-yellow-700' },
  approved: { label: '합격',    color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: '불합격',   color: 'bg-red-50 text-red-600' },
  hold:     { label: '보류',    color: 'bg-zinc-100 text-zinc-600' },
}

export default async function AdminGuidePage() {
  const supabase = await createClient()
  const { data: apps } = await supabase
    .from('guide_applications')
    .select('*')
    .order('created_at', { ascending: false })

  const counts = {
    pending:  apps?.filter(a => a.status === 'pending').length ?? 0,
    approved: apps?.filter(a => a.status === 'approved').length ?? 0,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900">가이드 지원 관리</h1>
        <p className="text-sm text-zinc-500 mt-1">
          총 {apps?.length ?? 0}건 · 검토 중 {counts.pending}건 · 합격 {counts.approved}건
        </p>
      </div>

      {!apps?.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
          접수된 지원서가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const st = STATUS_LABELS[app.status] ?? STATUS_LABELS.pending
            return (
              <div key={app.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-zinc-900">{app.name}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{app.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{app.phone}</span>
                      {app.english_level && app.english_level !== 'none' && (
                        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />영어: {app.english_level}</span>
                      )}
                      {app.certifications && (
                        <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" />{app.certifications}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 shrink-0">{new Date(app.created_at).toLocaleDateString('ko-KR')}</p>
                </div>

                {app.experience && (
                  <div className="mt-4 rounded-xl bg-zinc-50 p-3">
                    <p className="text-xs font-semibold text-zinc-500 mb-1">경력</p>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{app.experience}</p>
                  </div>
                )}
                {app.motivation && (
                  <div className="mt-3 rounded-xl bg-zinc-50 p-3">
                    <p className="text-xs font-semibold text-zinc-500 mb-1">지원 동기</p>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{app.motivation}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-2 flex-wrap">
                  {['pending', 'approved', 'rejected', 'hold'].map((s) => (
                    <form key={s} action={updateApplicationStatus.bind(null, app.id, s)}>
                      <button
                        type="submit"
                        disabled={app.status === s}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                          STATUS_LABELS[s].color
                        } border border-transparent hover:border-current`}
                      >
                        {STATUS_LABELS[s].label}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
