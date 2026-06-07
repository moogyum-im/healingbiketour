import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const locales = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value ?? 'ko'
  const locale: Locale = (locales as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'ko'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
