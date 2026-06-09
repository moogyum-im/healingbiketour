import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const supabase = await createClient()

  if (code) {
    // Google / Kakao OAuth PKCE 코드 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[Auth Callback] code exchange error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', requestUrl.origin))
    }
  } else if (token_hash && type) {
    // Naver OAuth 또는 Magic Link 처리
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'magiclink' | 'recovery' | 'invite',
    })
    if (error) {
      console.error('[Auth Callback] verifyOtp error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=token_failed', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
