'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertFaq(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string | null
  const question = (formData.get('question') as string).trim()
  const answer = (formData.get('answer') as string).trim()
  const category = (formData.get('category') as string).trim() || '일반'
  const display_order = parseInt(formData.get('display_order') as string) || 0
  const is_active = formData.get('is_active') !== 'false'

  if (!question || !answer) return { error: '질문과 답변을 입력해주세요.' }

  const payload = { question, answer, category, display_order, is_active, updated_at: new Date().toISOString() }

  const { error } = id
    ? await supabase.from('faqs').update(payload).eq('id', id)
    : await supabase.from('faqs').insert({ ...payload })

  if (error) return { error: error.message }

  revalidatePath('/faq')
  revalidatePath('/admin/faqs')
  return { success: true }
}

export async function deleteFaq(id: string) {
  const supabase = await createClient()
  await supabase.from('faqs').delete().eq('id', id)
  revalidatePath('/faq')
  revalidatePath('/admin/faqs')
}
