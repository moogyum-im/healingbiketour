'use client'

import { useActionState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Bike, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { signIn, signInWithGoogle, signInWithKakao } from '@/lib/actions/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const errorParam = searchParams.get('error')

  const [showPassword, setShowPassword] = useState(false)
  const [state, action, pending] = useActionState(signIn, null)

  useEffect(() => {
    if (errorParam === 'oauth_failed') toast.error('소셜 로그인에 실패했습니다. 다시 시도해주세요.')
    if (errorParam === 'naver_failed') toast.error('네이버 로그인에 실패했습니다.')
  }, [errorParam])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600">
            <Bike className="h-8 w-8" />
            <span className="text-2xl font-bold">바이크투어</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">로그인</h1>
          <p className="mt-1 text-sm text-zinc-500">계정에 로그인하여 투어를 예약하세요</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            {/* 카카오 */}
            <form action={signInWithKakao}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-yellow-400 py-3 text-sm font-semibold text-zinc-900 hover:bg-yellow-500 transition-colors"
              >
                <span className="text-base">💬</span>
                카카오로 로그인
              </button>
            </form>

            {/* Google */}
            <form action={signInWithGoogle}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google로 로그인
              </button>
            </form>

            {/* 네이버 */}
            <Link
              href={`/api/auth/naver?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-[#03C75A] py-3 text-sm font-semibold text-white hover:bg-[#02b350] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 로그인
            </Link>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-zinc-400">또는 이메일로 로그인</span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {state?.error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="example@email.com"
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-zinc-700">비밀번호</label>
                <Link href="/auth/reset-password" className="text-xs text-emerald-600 hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-11 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={pending}>
              로그인
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="font-semibold text-emerald-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
