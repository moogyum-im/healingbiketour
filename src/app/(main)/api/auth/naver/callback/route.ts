import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const cookieStore = await cookies()
  const savedState = cookieStore.get('naver_oauth_state')?.value
  const next = cookieStore.get('naver_redirect_to')?.value ?? '/'
  cookieStore.delete('naver_oauth_state')
  cookieStore.delete('naver_redirect_to')

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_state_mismatch`)
  }

  try {
    // 1. 네이버 access_token 발급
    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code,
        state,
        redirect_uri: `${siteUrl}/api/auth/naver/callback`,
      }),
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    if (!accessToken) throw new Error('Naver token exchange failed')

    // 2. 네이버 사용자 정보 조회
    const userRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const userData = await userRes.json()
    const naver = userData.response as {
      id: string
      email: string
      name: string
      profile_image?: string
    }
    if (!naver?.email) throw new Error('Naver email not provided')

    const adminHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    }

    // 3. 유저 생성 시도 (이미 존재하면 건너뜀)
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email: naver.email,
        email_confirm: true,
        user_metadata: {
          full_name: naver.name,
          avatar_url: naver.profile_image ?? null,
          provider: 'naver',
          naver_id: naver.id,
        },
      }),
    })
    if (!createRes.ok) {
      const err = await createRes.json()
      if (err.error_code !== 'email_exists') {
        throw new Error(`Failed to create user: ${JSON.stringify(err)}`)
      }
      // 기존 유저 — magic link 생성으로 바로 진행
    }

    // 4. Magic Link 생성
    const linkRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        type: 'magiclink',
        email: naver.email,
        options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
      }),
    })

    if (!linkRes.ok) {
      const err = await linkRes.json()
      console.error('[Naver] generateLink error:', err)
      throw new Error(`Failed to generate session link: ${JSON.stringify(err)}`)
    }

    const linkData = await linkRes.json()
    const hashed_token = linkData?.hashed_token ?? linkData?.properties?.hashed_token
    if (!hashed_token) throw new Error('No hashed_token in response')

    return NextResponse.redirect(
      `${siteUrl}/auth/callback?token_hash=${hashed_token}&type=magiclink&next=${encodeURIComponent(next)}`
    )
  } catch (err) {
    console.error('[Naver OAuth Error]', err)
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_failed`)
  }
}
