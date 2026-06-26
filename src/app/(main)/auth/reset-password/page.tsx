'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Bike, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { requestPasswordReset } from '@/lib/actions/auth'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null)

  if (state?.success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">이메일을 확인하세요</h1>
          <p className="mt-2 text-sm text-zinc-500">
            비밀번호 재설정 링크를 발송했습니다.
            <br />
            이메일함을 확인해주세요. (스팸함도 확인해보세요)
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-semibold text-emerald-600 hover:underline"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600">
            <Bike className="h-8 w-8" />
            <span className="text-2xl font-bold">바이크투어</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">비밀번호 찾기</h1>
          <p className="mt-1 text-sm text-zinc-500">
            가입한 이메일을 입력하면 재설정 링크를 보내드립니다
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {state?.error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="가입한 이메일을 입력하세요"
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={pending}>
              재설정 링크 발송
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          비밀번호가 기억나셨나요?{' '}
          <Link href="/auth/login" className="font-semibold text-emerald-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
