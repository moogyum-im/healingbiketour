'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPopup(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('popups').insert({
    title:      formData.get('title') as string,
    image_url:  formData.get('image_url') as string,
    link_url:   (formData.get('link_url') as string) || null,
    position:   formData.get('position') as string,
    is_active:  formData.get('is_active') === 'true',
    start_date: (formData.get('start_date') as string) || null,
    end_date:   (formData.get('end_date') as string) || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/popups')
  revalidatePath('/')
}

export async function updatePopup(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('popups').update({
    title:      formData.get('title') as string,
    image_url:  formData.get('image_url') as string,
    link_url:   (formData.get('link_url') as string) || null,
    position:   formData.get('position') as string,
    is_active:  formData.get('is_active') === 'true',
    start_date: (formData.get('start_date') as string) || null,
    end_date:   (formData.get('end_date') as string) || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/popups')
  revalidatePath('/')
}

export async function togglePopupActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  await supabase.from('popups').update({ is_active, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/popups')
  revalidatePath('/')
}

export async function deletePopup(id: string) {
  const supabase = await createClient()
  await supabase.from('popups').delete().eq('id', id)
  revalidatePath('/admin/popups')
  revalidatePath('/')
}

export async function uploadPopupImage(formData: FormData): Promise<string> {
  const supabase = await createClient()
  const file = formData.get('file') as File
  const ext = file.name.split('.').pop()
  const path = `popups/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('tour-images').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('tour-images').getPublicUrl(path)
  return data.publicUrl
}
