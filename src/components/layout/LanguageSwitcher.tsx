'use client'

import { useState, useTransition } from 'react'
import { Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

const LOCALES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
]

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function switchLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=${60 * 60 * 24 * 365}`
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
