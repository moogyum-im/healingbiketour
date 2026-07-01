'use client'

import { useState } from 'react'
import { MessageSquare, Phone, Mail, CheckCircle, Send, Clock } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { submitContactInquiry } from '@/lib/actions/contact'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim()) return
    setLoading(true)
    setError('')

    const result = await submitContactInquiry({
      name: form.name || undefined,
      phone: form.phone || undefined,
      message: form.message,
    })

    if (result.error) {
      setError(t('error_generic'))
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  const inputCls = 'w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-colors'

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">{t('success_title')}</h2>
          <p className="text-zinc-500 mb-2">{t('success_desc')}</p>
          <p className="text-sm text-zinc-400 mb-8">{t('success_hours')}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
              {t('home_btn')}
            </Link>
            <Link href="/faq" className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors">
              {t('faq_btn')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 mb-5">
            <MessageSquare className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900">{t('title')}</h1>
          <p className="mt-3 text-zinc-500 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact info — left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
              <h2 className="font-bold text-zinc-900">{t('direct_title')}</h2>

              <a
                href={`tel:${t('phone_number')}`}
                className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">{t('phone_label')}</p>
                  <p className="font-bold text-zinc-900 group-hover:text-emerald-700">{t('phone_number')}</p>
                </div>
              </a>

              <a
                href="mailto:healingbiketour@gmail.com"
                className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">{t('email_label')}</p>
                  <p className="font-bold text-zinc-900 group-hover:text-emerald-700 text-sm break-all">
                    healingbiketour@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="https://open.kakao.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-yellow-100 bg-yellow-50 p-4 hover:border-yellow-300 hover:bg-yellow-100 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-300 text-yellow-900">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 3C6.477 3 2 6.477 2 11c0 2.897 1.659 5.453 4.193 7.003L5 21l3.5-1.75C9.573 19.735 10.77 20 12 20c5.523 0 10-3.477 10-9S17.523 3 12 3z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-yellow-700 mb-0.5">{t('kakao_label')}</p>
                  <p className="font-bold text-yellow-900 group-hover:text-yellow-800">{t('kakao_name')}</p>
                </div>
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-zinc-400" />
                <h2 className="font-bold text-zinc-900 text-sm">{t('hours_title')}</h2>
              </div>
              <div className="space-y-1.5 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>{t('weekday')}</span>
                  <span className="font-semibold">{t('weekday_hours')}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t('weekend')}</span>
                  <span>{t('weekend_closed')}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-400">{t('online_notice')}</p>
            </div>
          </div>

          {/* Form — right */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-5">
              <h2 className="font-bold text-zinc-900 text-lg">{t('form_title')}</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('name_label')}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    placeholder={t('name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t('phone_input_label')}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className={inputCls}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {t('message_label')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={7}
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  placeholder={t('message_placeholder')}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !form.message.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="animate-pulse">{t('submitting')}</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('submit')}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-zinc-400">
                {t('privacy_notice')}
                <Link href="/policy/privacy" className="underline hover:text-zinc-600">{t('privacy_link')}</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-semibold text-zinc-500 mb-4">{t('quick_title')}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/faq" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-emerald-300 transition-colors">
              {t('quick_faq')}
            </Link>
            <Link href="/notice" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-emerald-300 transition-colors">
              {t('quick_notice')}
            </Link>
            <Link href="/tours" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-emerald-300 transition-colors">
              {t('quick_tours')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
