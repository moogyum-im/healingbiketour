'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitGuideApplication(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim()
  const phone = (formData.get('phone') as string).trim()
  const english_level = formData.get('english_level') as string
  const certifications = (formData.get('certifications') as string).trim()
  const experience = (formData.get('experience') as string).trim()
  const motivation = (formData.get('motivation') as string).trim()

  if (!name || !email || !phone) return { error: '이름, 이메일, 연락처는 필수입니다.' }

  const { error } = await supabase
    .from('guide_applications')
    .insert({ name, email, phone, english_level, certifications, experience, motivation })

  if (error) return { error: error.message }

  return { success: true }
}

export async function updateApplicationStatus(id: string, status: string) {
  const supabase = await createClient()
  await supabase.from('guide_applications').update({ status }).eq('id', id)
  revalidatePath('/admin/guide')
}
