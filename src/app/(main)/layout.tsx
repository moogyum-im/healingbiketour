import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import '../globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingChat from '@/components/ui/FloatingChat'
import PopupBanner from '@/components/ui/PopupBanner'
import { SessionProvider } from '@/providers/SessionProvider'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { getToursWithOverrides } from '@/lib/tours'
import { createClient } from '@/lib/supabase/server'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: {
    default: '힐링바이크투어 | 한강 자전거 투어',
    template: '%s | 힐링바이크투어',
  },
  description:
    '전문가가 설계한 한강 자전거 투어. 로드 자전거, MTB, 전기자전거 중 선택하세요.',
  keywords: ['힐링바이크투어', '한강 자전거 투어', 'bike tour', 'han river cycling', 'MTB', 'e-bike', '한강라이딩'],
  openGraph: {
    type: 'website',
    url: 'https://healingbiketour.kr',
    siteName: '힐링바이크투어',
  },
  verification: {
    // 네이버 서치어드바이저 소유권 인증 코드 (https://searchadvisor.naver.com 에서 발급)
    other: {
      'naver-site-verification': '24ab50e249c85cbc0750605063e37d886a67afa6',
    },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const [tours, supabase] = await Promise.all([getToursWithOverrides(), createClient()])
  const today = new Date().toISOString().split('T')[0]
  const { data: activePopups } = await supabase
    .from('popups')
    .select('id, image_url, link_url, position')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-zinc-900">
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <Header tours={tours} />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingChat />
            {activePopups && activePopups.length > 0 && (
              <PopupBanner popups={activePopups} />
            )}
          </SessionProvider>
        </NextIntlClientProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  )
}
