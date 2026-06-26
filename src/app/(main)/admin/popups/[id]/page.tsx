import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PopupForm from '../PopupForm'

export default async function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('popups').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()

  return (
    <div>
      <h1 className="text-2xl font-black text-zinc-900 mb-8">팝업 편집</h1>
      <PopupForm initial={{
        id:         data.id,
        title:      data.title,
        image_url:  data.image_url,
        link_url:   data.link_url ?? '',
        position:   data.position,
        is_active:  data.is_active,
        start_date: data.start_date ?? '',
        end_date:   data.end_date ?? '',
      }} />
    </div>
  )
}
