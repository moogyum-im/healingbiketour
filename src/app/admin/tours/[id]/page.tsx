import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TourForm from '../TourForm'
import TimeSlotManager from '@/components/admin/TimeSlotManager'

export const metadata = { title: '투어 수정 | 관리자' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTourPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .single()

  if (!tour) notFound()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">투어 수정</h1>
        <p className="mt-1 text-sm text-zinc-500">{tour.title}</p>
      </div>
      <TourForm initialData={tour} />
      <TimeSlotManager tourId={tour.id} tourTitle={tour.title} />
    </div>
  )
}
