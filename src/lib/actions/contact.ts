'use server'

import { createClient } from '@/lib/supabase/server'
import { sendAdminContactNotification } from '@/lib/notify/kakao'

export async function submitContactInquiry(params: {
  name?: string
  phone?: string
  message: string
}) {
  if (!params.message.trim()) return { error: '문의 내용을 입력해 주세요.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('chat_inquiries').insert({
    name: params.name || null,
    phone: params.phone || null,
    message: params.message.trim(),
    source_page: '/contact',
    user_id: user?.id ?? null,
  })

  if (error) {
    console.error('[submitContactInquiry]', error)
    return { error: '전송에 실패했습니다. 다시 시도해 주세요.' }
  }

  await sendAdminContactNotification({
    name: params.name,
    phone: params.phone,
    message: params.message,
  }).catch(console.error)

  return { success: true }
}
