import { createClient } from '@/lib/supabase/server'
import { MessageCircle, Clock, Headphones, XCircle } from 'lucide-react'
import ChatInquiryList from './ChatInquiryList'

export const metadata = { title: '상담 문의 관리' }
export const revalidate = 0

export default async function AdminChatsPage() {
  const supabase = await createClient()
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  const all = sessions ?? []
  const waiting = all.filter((s) => s.status === 'waiting').length
  const active  = all.filter((s) => s.status === 'active').length
  const closed  = all.filter((s) => s.status === 'closed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">실시간 채팅 상담</h1>
        <p className="mt-1 text-sm text-zinc-500">고객이 상담사 연결을 요청하면 여기서 실시간으로 답변하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '대기 중', value: waiting, icon: Clock,       color: 'bg-amber-50 text-amber-600' },
          { label: '상담 중', value: active,  icon: Headphones,  color: 'bg-emerald-50 text-emerald-600' },
          { label: '종료',    value: closed,  icon: XCircle,     color: 'bg-zinc-100 text-zinc-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <ChatInquiryList initialSessions={all} />
    </div>
  )
}
