'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function grantCredit(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return { error: '권한이 없습니다.' }

  const email  = formData.get('email') as string
  const amount = Number(formData.get('amount'))
  const reason = formData.get('reason') as string

  if (!email || !amount || amount < 1) return { error: '올바른 값을 입력해 주세요.' }

  // 이메일로 회원 조회
  const { data: target } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('email', email)
    .single()

  if (!target) return { error: `${email} 회원을 찾을 수 없습니다.` }

  const { error } = await supabase.from('credits').insert({
    user_id: target.id,
    amount,
    type: 'admin_grant',
    description: `관리자 지급: ${reason}`,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  })

  if (error) return { error: '크레딧 지급에 실패했습니다.' }

  revalidatePath('/admin/credits')
  revalidatePath('/admin/users')
  return { success: `${target.name ?? email}님께 ${amount.toLocaleString()} 크레딧을 지급했습니다.` }
}

export async function revalidateTours(slug?: string) {
  revalidatePath('/', 'layout')
  revalidatePath('/tours')
  if (slug) revalidatePath(`/tours/${slug}`)
}

export async function updateTourSortOrder(tourId: string, sortOrder: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return { error: '권한이 없습니다.' }

  const { error } = await supabase
    .from('tours')
    .update({ sort_order: sortOrder })
    .eq('id', tourId)

  if (error) return { error: '순서 저장에 실패했습니다.' }

  revalidatePath('/', 'layout')
  revalidatePath('/tours')
  revalidatePath('/admin/tours')
  return { success: true }
}
