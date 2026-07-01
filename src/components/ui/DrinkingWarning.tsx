import { Ban } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function DrinkingWarning() {
  const t = await getTranslations('drinking')

  return (
    <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500">
          <Ban className="h-6 w-6 text-white" />
        </div>
        <p className="text-lg font-black text-red-700 tracking-tight">{t('title')}</p>
      </div>
      <div className="space-y-1.5 pl-1">
        <p className="text-sm font-bold text-red-800">{t('body1')}</p>
        <p className="text-sm text-red-700">{t('body2')}</p>
        <p className="text-sm text-red-700">{t('body3')}</p>
      </div>
    </div>
  )
}
