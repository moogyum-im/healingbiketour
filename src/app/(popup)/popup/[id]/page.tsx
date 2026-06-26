import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PopupWindowClient from './PopupWindowClient'

export default async function PopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: popup } = await supabase
    .from('popups')
    .select('id, image_url, link_url')
    .eq('id', id)
    .single()

  if (!popup) notFound()

  return (
    <PopupWindowClient
      id={popup.id}
      imageUrl={popup.image_url}
      linkUrl={popup.link_url}
    />
  )
}
