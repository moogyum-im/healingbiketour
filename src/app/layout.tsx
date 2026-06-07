import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingChat from '@/components/ui/FloatingChat'
import { SessionProvider } from '@/providers/SessionProvider'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { getToursWithOverrides } from '@/lib/tours'

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
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const tours = await getToursWithOverrides()

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-zinc-900">
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <Header tours={tours} />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingChat />
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
