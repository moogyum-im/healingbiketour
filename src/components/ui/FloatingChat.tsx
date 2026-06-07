'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, ChevronRight, Send, Phone, User, ArrowLeft, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FAQS = [
  { q: '투어 예약은 어떻게 하나요?', a: '원하는 투어를 선택하신 후 날짜와 인원을 고르고 결제하시면 됩니다. 카카오페이·네이버페이·카드 결제 모두 가능합니다.' },
  { q: '자전거는 직접 가져가야 하나요?', a: '아닙니다! 일반 자전거, MTB/로드, 전기자전거 중 원하시는 종류를 예약 시 선택하시면 당산역 출발지에서 제공해 드립니다.' },
  { q: '음주 후 참가할 수 있나요?', a: '음주 상태로는 절대 참가 불가합니다. 자전거는 도로교통법상 차에 해당하며 음주 운전 시 형사처벌 대상입니다. 적발 시 즉시 참가 거부 및 환불 불가합니다.' },
  { q: '환불 정책이 어떻게 되나요?', a: '7일 전 이상: 100% 환불 / 3~6일 전: 50% 환불 / 2일 이내: 환불 불가. 우천·천재지변 취소 시 전액 환불됩니다.' },
  { q: '집결지가 어디인가요?', a: '모든 투어는 당산역 2번 출구 앞에서 출발합니다. 예약 확정 후 카카오톡으로 상세 안내가 발송됩니다.' },
  { q: '어린이도 참가할 수 있나요?', a: '만 12세 이상 참가 가능합니다. 미성년자는 반드시 보호자와 함께 참가하셔야 합니다.' },
  { q: '단체 할인이 있나요?', a: '10인 이상 단체 예약 시 별도 할인 및 가이드 서비스를 제공해 드립니다. 상담사 연결로 문의해 주세요.' },
]

type Message = { id?: string; from: 'bot' | 'user' | 'admin'; text: string }
type Mode = 'faq' | 'connect_form' | 'live'

const GREETING: Message = {
  from: 'bot',
  text: '안녕하세요! 힐링바이크투어입니다 🚴\n자주 묻는 질문을 선택하시거나 상담사에게 연결하세요.',
}

const SESSION_KEY = 'hbt_chat_session'

const AUTO_CLOSE_MS = 20 * 60 * 1000  // 20분

function closeSession(sessionId: string) {
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_status', sessionId, status: 'closed' }),
  })
  localStorage.removeItem(SESSION_KEY)
}

export default function FloatingChat() {
  const pathname = usePathname()
  const [restoring, setRestoring] = useState(true)   // 복원 완료 전까지 아무것도 렌더 안 함
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('faq')
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [showFaqs, setShowFaqs] = useState(true)
  const [input, setInput] = useState('')
  const [form, setForm] = useState({ name: '', phone: '' })
  const [connecting, setConnecting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const bottomRef = useRef<HTMLDivElement>(null)

  // 마운트 시 localStorage에 저장된 세션 복원
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (!saved) { setRestoring(false); return }
    const supabase = createClient()
    supabase
      .from('chat_sessions')
      .select('id, status')
      .eq('id', saved)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || data.status === 'closed') {
          localStorage.removeItem(SESSION_KEY)
          setRestoring(false)
          return
        }
        supabase
          .from('chat_messages')
          .select('id, sender, content, created_at')
          .eq('session_id', saved)
          .order('created_at', { ascending: true })
          .then(({ data: msgs }) => {
            const list = msgs ?? []
            // 마지막 메시지 시간 기준 20분 경과 시 자동 종료
            if (list.length > 0) {
              const lastTime = new Date(list[list.length - 1].created_at).getTime()
              if (Date.now() - lastTime > AUTO_CLOSE_MS) {
                closeSession(saved)
                setRestoring(false)
                return
              }
              lastActivityRef.current = lastTime
            }
            const restored: Message[] = [
              { from: 'bot', text: '이전 상담이 복원되었습니다.' },
              ...list.map((m) => ({
                id: m.id,
                from: m.sender === 'admin' ? ('admin' as const) : ('user' as const),
                text: m.content,
              })),
            ]
            setMessages(restored)
            setSessionId(saved)
            setMode('live')
            setRestoring(false)
          })
      })
  }, [])

  // 20분 비응답 자동 종료 타이머
  useEffect(() => {
    if (!sessionId) return
    const timer = setInterval(() => {
      if (Date.now() - lastActivityRef.current > AUTO_CLOSE_MS) {
        closeSession(sessionId)
        setSessionId(null)
        setMode('faq')
        setMessages([
          GREETING,
          { from: 'bot', text: '20분간 응답이 없어 상담이 자동 종료되었습니다. 다시 연결하시려면 상담사 연결 요청을 눌러주세요.' },
        ])
        setShowFaqs(false)
      }
    }, 60_000)
    return () => clearInterval(timer)
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mode, open])

  // 실시간 관리자 답변 구독
  useEffect(() => {
    if (!sessionId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`chat_${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const msg = payload.new as { sender: string; content: string; id: string; created_at: string }
        lastActivityRef.current = new Date(msg.created_at).getTime()
        if (msg.sender === 'admin') {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, { id: msg.id, from: 'admin', text: msg.content }]
          })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId])

  const sendFaq = (faq: typeof FAQS[0]) => {
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: faq.q },
      { from: 'bot', text: faq.a },
    ])
    setShowFaqs(false)
  }

  const startConnect = async () => {
    setConnecting(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_session',
        name: form.name,
        phone: form.phone,
        sourcePage: pathname,
      }),
    })
    const data = await res.json()
    setConnecting(false)
    if (data.sessionId) {
      setSessionId(data.sessionId)
      localStorage.setItem(SESSION_KEY, data.sessionId)
      setMode('live')
      setMessages([{
        from: 'bot',
        text: '상담사에게 연결되었습니다 ✅\n메시지를 입력해주세요. 담당자가 확인 후 답변 드리겠습니다.',
      }])
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !sessionId) return
    setInput('')
    lastActivityRef.current = Date.now()
    setMessages((prev) => [...prev, { from: 'user', text }])
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', sessionId, content: text, sender: 'user' }),
    })
  }

  return (
    <>
      {open && !restoring && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200 bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              {mode !== 'faq' && (
                <button onClick={() => setMode('faq')} className="text-white/70 hover:text-white mr-1">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">힐링바이크투어 상담</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <p className="text-[10px] text-emerald-100">
                    {mode === 'live' ? '상담사 연결됨' : '온라인'}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* FAQ 모드 */}
          {mode === 'faq' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
                {messages.map((msg, i) => (
                  <div key={msg.id ?? i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.from === 'admin' && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black mr-1.5 mt-1">상</div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      msg.from === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : msg.from === 'admin'
                          ? 'bg-white text-zinc-800 border-2 border-emerald-200 rounded-bl-sm shadow-sm'
                          : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.from === 'admin' && <p className="text-[10px] font-bold text-emerald-600 mb-0.5">힐링바이크투어 상담사</p>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {/* 활성 세션이 없을 때만 FAQ 버튼 표시 */}
                {!sessionId && showFaqs && (
                  <div className="space-y-1.5 mt-2">
                    {FAQS.map((faq) => (
                      <button key={faq.q} onClick={() => sendFaq(faq)}
                        className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors shadow-sm"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                )}
                {!sessionId && !showFaqs && (
                  <button onClick={() => setShowFaqs(true)} className="text-[11px] text-emerald-600 hover:underline">
                    자주 묻는 질문 다시 보기
                  </button>
                )}
                <div ref={bottomRef} />
              </div>
              {/* 세션 있으면 입력창, 없으면 연결 요청 버튼 */}
              {sessionId ? (
                <div className="border-t border-zinc-200 bg-white p-3 flex gap-2">
                  <input type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && sendMessage()}
                    placeholder="메시지를 입력하세요"
                    className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    autoFocus
                  />
                  <button onClick={sendMessage} disabled={!input.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-100">
                  <button onClick={() => setMode('connect_form')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Phone className="h-4 w-4" /> 상담사 연결 요청
                  </button>
                </div>
              )}
            </>
          )}

          {/* 상담사 연결 폼 */}
          {mode === 'connect_form' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
              <p className="text-sm text-zinc-600">이름과 연락처를 남기시면 상담사가 바로 연결됩니다.</p>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 mb-1.5">
                  <User className="h-3.5 w-3.5" /> 이름 <span className="text-zinc-400 font-normal">(선택)</span>
                </label>
                <input type="text" placeholder="홍길동" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 mb-1.5">
                  <Phone className="h-3.5 w-3.5" /> 연락처 <span className="text-zinc-400 font-normal">(선택)</span>
                </label>
                <input type="tel" placeholder="010-0000-0000" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button onClick={startConnect} disabled={connecting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <><Loader2 className="h-4 w-4 animate-spin" /> 연결 중...</> : '상담사 연결하기'}
              </button>
              <div ref={bottomRef} />
            </div>
          )}

          {/* 실시간 채팅 모드 */}
          {mode === 'live' && (
            <>
              {/* 상담 종료 버튼 */}
              <div className="flex justify-end px-3 pt-2 pb-0 bg-zinc-50 border-b border-zinc-100">
                <button
                  onClick={async () => {
                    if (!sessionId) return
                    const supabase = createClient()
                    await supabase.from('chat_sessions').update({ status: 'closed' }).eq('id', sessionId)
                    localStorage.removeItem(SESSION_KEY)
                    setSessionId(null)
                    setMode('faq')
                    setMessages([GREETING])
                    setShowFaqs(true)
                  }}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors mb-2"
                >
                  <X className="h-3 w-3" /> 상담 종료
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
                {messages.map((msg, i) => (
                  <div key={msg.id ?? i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.from === 'admin' && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black mr-1.5 mt-1">상</div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      msg.from === 'user' ? 'bg-emerald-600 text-white rounded-br-sm'
                      : msg.from === 'admin' ? 'bg-white text-zinc-800 border-2 border-emerald-200 rounded-bl-sm shadow-sm'
                      : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.from === 'admin' && <p className="text-[10px] font-bold text-emerald-600 mb-0.5">힐링바이크투어 상담사</p>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-zinc-200 bg-white p-3 flex gap-2">
                <input type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && sendMessage()}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all"
        aria-label="상담 채팅"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">1</span>
        )}
      </button>
    </>
  )
}
