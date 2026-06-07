'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const tourId  = formData.get('tour_id') as string
  const slug    = formData.get('slug') as string
  const rating  = Number(formData.get('rating'))
  const content = (formData.get('content') as string).trim()
  const imageUrls = formData.getAll('image_urls') as string[]

  if (!tourId) return { error: '잘못된 요청입니다.' }
  if (rating < 1 || rating > 5) return { error: '별점을 선택해 주세요.' }
  if (content.length < 10) return { error: '리뷰는 10자 이상 작성해 주세요.' }

  const { error } = await supabase.from('reviews').insert({
    tour_id: tourId,
    user_id: user.id,
    booking_id: null,
    rating,
    content,
    images: imageUrls.length > 0 ? imageUrls : null,
  })

  if (error) return { error: '리뷰 등록에 실패했습니다. 다시 시도해 주세요.' }

  revalidatePath(`/tours/${slug}`)
  revalidatePath(`/tours/${slug}/reviews`)
  return { success: true }
}

export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credit_balances')
    .select('balance')
    .eq('user_id', userId)
    .single()
  return data?.balance ?? 0
}
