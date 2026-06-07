import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 세션 생성
export async function POST(req: Request) {
  const body = await req.json()
  const { action, name, phone, sourcePage, sessionId, content, sender, status } = body
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (action === 'create_session') {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ name: name || null, phone: phone || null, source_page: sourcePage || '/', user_id: user?.id || null })
      .select('id')
      .single()
    if (error) {
      console.error('chat session error:', error)
      return NextResponse.json({ error: '세션 생성 실패: ' + error.message }, { status: 500 })
    }
    return NextResponse.json({ sessionId: data.id })
  }

  if (action === 'send_message') {
    if (!sessionId || !content?.trim()) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    const { error } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, content: content.trim(), sender: sender || 'user' })
    if (error) return NextResponse.json({ error: '메시지 전송 실패' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'update_status') {
    if (!sessionId || !status) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    await supabase.from('chat_sessions').update({ status }).eq('id', sessionId)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: '알 수 없는 액션' }, { status: 400 })
}
