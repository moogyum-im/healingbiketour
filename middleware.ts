import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/my']
const AUTH_ONLY = ['/auth/login', '/auth/signup']
const ADMIN_ONLY = ['/admin']

const VALID_LOCALES = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW']

const COUNTRY_TO_LOCALE: Record<string, string> = {
  KR: 'ko',
  JP: 'ja',
  CN: 'zh-CN',
  TW: 'zh-TW',
  HK: 'zh-TW',
  MO: 'zh-TW',
}

function detectLocale(request: NextRequest): string | null {
  // Already have a valid locale cookie → don't override
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && VALID_LOCALES.includes(cookieLocale)) return null

  // Vercel geo or Cloudflare country header
  const country =
    (request as NextRequest & { geo?: { country?: string } }).geo?.country ??
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry')

  if (country && COUNTRY_TO_LOCALE[country]) return COUNTRY_TO_LOCALE[country]

  // Accept-Language fallback
  const al = request.headers.get('accept-language') ?? ''
  if (al.includes('ko')) return 'ko'
  if (al.includes('ja')) return 'ja'
  if (al.includes('zh-TW') || al.includes('zh-Hant')) return 'zh-TW'
  if (al.includes('zh')) return 'zh-CN'

  return 'en'
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Set locale cookie on first visit
  const locale = detectLocale(request)
  if (locale) {
    response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          if (locale) {
            response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    try {
      const { data: role, error } = await supabase.rpc('get_my_role')

      if (error) {
        console.error('[middleware] get_my_role error:', error.message)
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (e) {
      console.error('[middleware] admin check failed:', e)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } else if (!pathname.startsWith('/api')) {
    // 방문자당 하루 1건만 기록 (관리자/API 경로 제외)
    const today = new Date().toISOString().split('T')[0]
    if (request.cookies.get('hbt_last_visit')?.value !== today) {
      let visitorId = request.cookies.get('hbt_vid')?.value
      if (!visitorId) {
        visitorId = crypto.randomUUID()
        response.cookies.set('hbt_vid', visitorId, { path: '/', maxAge: 60 * 60 * 24 * 400 })
      }
      response.cookies.set('hbt_last_visit', today, { path: '/', maxAge: 60 * 60 * 24 * 400 })
      try {
        await supabase.from('site_visits').insert({
          session_id: visitorId,
          path: pathname,
          referrer: request.headers.get('referer'),
        })
      } catch (e) {
        console.error('[middleware] visit tracking failed:', e)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
