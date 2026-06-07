import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const state = crypto.randomBytes(16).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('naver_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  })
  cookieStore.set('naver_redirect_to', redirectTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NAVER_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/naver/callback`,
    state,
  })

  return NextResponse.redirect(
    `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
  )
}
