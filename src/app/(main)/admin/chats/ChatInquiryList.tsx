'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Bell, Send, X } from 'lucide-react'

type Session = {
  id: string
  name: string | null
  phone: string | null
  source_page: string | null
  status: 'waiting' | 'active' | 'closed'
  created_at: string
}

type ChatMessage = {
  id: string
  session_id: string
  content: string
  sender: 'user' | 'admin'
  created_at: string
}

const STATUS = {
  waiting: { label: '대기 중', cls: 'bg-amber-100 text-amber-700' },
  active:  { label: '상담 중', cls: 'bg-emerald-100 text-emerald-700' },
  closed:  { label: '종료',   cls: 'bg-zinc-100 text-zinc-500' },
}

export default function ChatInquiryList({ initialSessions }: { initialSessions: Session[] }) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [selected, setSelected] = useState<Session | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reply, setReply] = useState('')
  const [newAlert, setNewAlert] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 세션 목록 실시간 구독
  useEffect(() => {
    const supabase = createClient()
    if (Notification.permission === 'default') Notification.requestPermission()

    const channel = supabase
      .channel('admin_sessions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_sessions' }, (payload) => {
        setSessions((prev) => [payload.new as Session, ...prev])
        setNewAlert(true)
        if (Notification.permission === 'granted') {
          new Notification('💬 새 상담 요청', {
            body: `${(payload.new as Session).name ?? '익명'} 님이 상담을 요청했습니다.`,
            icon: '/힐링바이크투어-로고.png',
          })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // 선택 세션 메시지 로드 + 실시간 구독
  useEffect(() => {
    if (!selected) return
    const supabase = createClient()

    supabase.from('chat_messages').select('*').eq('session_id', selected.id)
      .order('created_at').then(({ data }) => setMessages(data ?? []))

    const channel = supabase
      .channel(`admin_chat_${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `session_id=eq.${selected.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    // 상담 중으로 상태 업데이트
    supabase.from('chat_sessions').update({ status: 'active' }).eq('id', selected.id).then(() => {
      setSessions((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'active' } : s))
    })

    return () => { supabase.removeChannel(channel) }
  }, [selected?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    const text = reply.trim()
    setReply('')
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', sessionId: selected.id, content: text, sender: 'admin' }),
    })
  }

  const closeSession = async (sessionId: string) => {
    const supabase = createClient()
    await supabase.from('chat_sessions').update({ status: 'closed' }).eq('id', sessionId)
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status: 'closed' } : s))
    if (selected?.id === sessionId) setSelected(null)
  }

  return (
    <div className="flex gap-4" style={{ minHeight: '500px' }}>
      {/* 세션 목록 */}
      <div className="w-72 shrink-0 rounded-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-zinc-900 text-sm">상담 목록</h2>
            {newAlert && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 animate-pulse">
                <Bell className="h-3 w-3" /> 새 요청
              </span>
            )}
          </div>
          {newAlert && <button onClick={() => setNewAlert(false)} className="text-[10px] text-zinc-400">닫기</button>}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-400">상담 요청 없음</div>
          ) : sessions.map((s) => (
            <button key={s.id} onClick={() => { setSelected(s); setNewAlert(false) }}
              className={`w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors ${selected?.id === s.id ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-zinc-800">{s.name ?? '익명'}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span>
              </div>
              {s.phone && <p className="text-xs text-zinc-400">{s.phone}</p>}
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {new Date(s.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 채팅 패널 */}
      <div className="flex-1 rounded-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">상담을 선택하세요</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50">
              <div>
                <p className="font-bold text-zinc-900">{selected.name ?? '익명 고객'}</p>
                <p className="text-xs text-zinc-400">{selected.phone ?? '연락처 없음'} · {selected.source_page}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[selected.status].cls}`}>{STATUS[selected.status].label}</span>
                {selected.status !== 'closed' && (
                  <button onClick={() => closeSession(selected.id)}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
                  >
                    <X className="h-3 w-3" /> 종료
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'admin'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {selected.status !== 'closed' && (
              <div className="border-t border-zinc-200 bg-white p-3 flex gap-2">
                <input type="text" value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && sendReply()}
                  placeholder="답변을 입력하세요..."
                  className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button onClick={sendReply} disabled={!reply.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
