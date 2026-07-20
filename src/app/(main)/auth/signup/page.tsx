'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bike, Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { signUp, signInWithGoogle, signInWithKakao } from '@/lib/actions/auth'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const prefillEmail = searchParams.get('email') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [allChecked, setAllChecked] = useState(false)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [state, action, pending] = useActionState(signUp, null)

  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked)
    setTerms(checked)
    setPrivacy(checked)
    setMarketing(checked)
  }

  const updateAll = (t: boolean, p: boolean, m: boolean) => {
    setAllChecked(t && p && m)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600">
            <Bike className="h-8 w-8" />
            <span className="text-2xl font-black">힐링바이크투어</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">회원가입</h1>
          <p className="mt-1 text-sm text-zinc-500">가입하고 한강 투어를 예약하세요</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <form action={signInWithKakao}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-zinc-900 hover:bg-yellow-500 transition-colors"
              >
                <span className="text-base">💬</span>
                카카오로 시작하기
              </button>
            </form>
            <form action={signInWithGoogle}>
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
                Google로 시작하기
              </button>
            </form>
            <Link
              href="/api/auth/naver"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#03C75A] py-3 text-sm font-semibold text-white hover:bg-[#02b350] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 시작하기
            </Link>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-zinc-400">또는 이메일로 가입</span>
            </div>
          </div>

          {state?.error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {state.success}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">이름</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text" name="name" required
                  placeholder="이름을 입력해 주세요"
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email" name="email" required
                  placeholder="example@email.com"
                  defaultValue={prefillEmail}
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" required minLength={8}
                  placeholder="8자 이상 입력해 주세요"
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-11 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="rounded-xl border border-zinc-200 p-4 space-y-3">
              {/* 전체 동의 */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => handleAllCheck(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
                />
                <span className="text-sm font-bold text-zinc-800">전체 동의</span>
              </label>

              <div className="border-t border-zinc-100 pt-3 space-y-2.5">
                {/* 이용약관 (필수) */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox" name="terms" required
                      checked={terms}
                      onChange={(e) => { setTerms(e.target.checked); updateAll(e.target.checked, privacy, marketing) }}
                      className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
                    />
                    <span className="text-xs text-zinc-600">
                      <span className="text-red-500 font-bold mr-1">[필수]</span>
                      이용약관 동의
                    </span>
                  </div>
                  <Link href="/policy/terms" target="_blank" className="text-xs text-zinc-400 hover:text-emerald-600 underline">
                    보기
                  </Link>
                </label>

                {/* 개인정보 처리방침 (필수) */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox" name="privacy" required
                      checked={privacy}
                      onChange={(e) => { setPrivacy(e.target.checked); updateAll(terms, e.target.checked, marketing) }}
                      className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
                    />
                    <span className="text-xs text-zinc-600">
                      <span className="text-red-500 font-bold mr-1">[필수]</span>
                      개인정보 처리방침 동의
                    </span>
                  </div>
                  <Link href="/policy/privacy" target="_blank" className="text-xs text-zinc-400 hover:text-emerald-600 underline">
                    보기
                  </Link>
                </label>

                {/* 마케팅 동의 (선택) */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox" name="marketing"
                    checked={marketing}
                    onChange={(e) => { setMarketing(e.target.checked); updateAll(terms, privacy, e.target.checked) }}
                    className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
                  />
                  <span className="text-xs text-zinc-600">
                    <span className="text-zinc-400 font-bold mr-1">[선택]</span>
                    마케팅 정보 수신 동의 (투어 할인·이벤트 알림)
                  </span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={pending}>
              회원가입
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="font-semibold text-emerald-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
