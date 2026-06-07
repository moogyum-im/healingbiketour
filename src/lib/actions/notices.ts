'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNotice(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const title = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const is_published = formData.get('is_published') !== 'false'

  if (!title || !content) return { error: '제목과 내용을 입력해주세요.' }

  const { error } = await supabase.from('notices').insert({ title, content, is_published })
  if (error) return { error: error.message }

  revalidatePath('/notice')
  revalidatePath('/admin/notices')
  redirect('/admin/notices')
}

export async function updateNotice(id: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const title = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const is_published = formData.get('is_published') !== 'false'

  if (!title || !content) return { error: '제목과 내용을 입력해주세요.' }

  const { error } = await supabase
    .from('notices')
    .update({ title, content, is_published, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/notice')
  revalidatePath(`/notice/${id}`)
  revalidatePath('/admin/notices')
  redirect('/admin/notices')
}

export async function deleteNotice(id: string) {
  const supabase = await createClient()
  await supabase.from('notices').delete().eq('id', id)
  revalidatePath('/notice')
  revalidatePath('/admin/notices')
}
