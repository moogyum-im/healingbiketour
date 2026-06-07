'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Bike, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { updatePassword } from '@/lib/actions/auth'

export default function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [state, action, pending] = useActionState(updatePassword, null)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600">
            <Bike className="h-8 w-8" />
            <span className="text-2xl font-bold">바이크투어</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">새 비밀번호 설정</h1>
          <p className="mt-1 text-sm text-zinc-500">사용할 새 비밀번호를 입력해주세요</p>
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
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">새 비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  placeholder="6자 이상 입력하세요"
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">비밀번호 확인</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  required
                  minLength={6}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-11 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={pending}>
              비밀번호 변경
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
