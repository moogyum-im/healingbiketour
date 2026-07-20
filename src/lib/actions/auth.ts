'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { linkGuestBookingsToUser } from '@/lib/actions/guest'

// ── 이메일 회원가입 ────────────────────────────────────────
export async function signUp(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const marketing = formData.get('marketing') === 'on'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, marketing_consent: marketing, marketing_consent_at: marketing ? new Date().toISOString() : null },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: '이미 가입된 이메일입니다.' }
    }
    return { error: error.message }
  }

  return { success: '가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.' }
}

// ── 이메일 로그인 ──────────────────────────────────────────
export async function signIn(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  if (data.user?.email) {
    await linkGuestBookingsToUser(data.user.id, data.user.email).catch(console.error)
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// ── 로그아웃 ───────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ── Google OAuth (FormData 기반 – form action 용) ──────────
export async function signInWithGoogle(formData: FormData): Promise<void>
export async function signInWithGoogle(redirectTo?: string): Promise<void>
export async function signInWithGoogle(arg?: FormData | string): Promise<void> {
  const redirectTo = arg instanceof FormData ? (arg.get('redirectTo') as string ?? '/') : (arg ?? '/')
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  })
  if (data.url) redirect(data.url)
}

// ── 비밀번호 재설정 이메일 발송 ────────────────────────────
export async function requestPasswordReset(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/update-password`,
  })

  if (error && error.message.toLowerCase().includes('rate limit')) {
    return { error: '잠시 후 다시 시도해주세요.' }
  }

  return { success: true }
}

// ── 새 비밀번호 저장 ────────────────────────────────────────
export async function updatePassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: '비밀번호 변경에 실패했습니다. 링크가 만료됐을 수 있습니다.' }

  revalidatePath('/', 'layout')
  redirect('/')
}

// ── Kakao OAuth (FormData 기반 – form action 용) ───────────
export async function signInWithKakao(formData: FormData): Promise<void>
export async function signInWithKakao(redirectTo?: string): Promise<void>
export async function signInWithKakao(arg?: FormData | string): Promise<void> {
  const redirectTo = arg instanceof FormData ? (arg.get('redirectTo') as string ?? '/') : (arg ?? '/')
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  })
  if (data.url) redirect(data.url)
}
