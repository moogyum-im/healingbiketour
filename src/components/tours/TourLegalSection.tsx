import type React from 'react'
import { getTranslations } from 'next-intl/server'
import { AlertTriangle, RefreshCcw, ShieldCheck, Heart, Info } from 'lucide-react'

interface LegalItem { label?: string; content: string }

export default async function TourLegalSection() {
  const t = await getTranslations('legal')

  const SECTIONS: { icon: React.ElementType; title: string; color: string; defaultOpen: boolean; items: LegalItem[] }[] = [
    {
      icon: RefreshCcw,
      title: t('cancel_title'),
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      defaultOpen: false,
      items: [
        { label: t('cancel_7d_label'), content: t('cancel_7d') },
        { label: t('cancel_3_6d_label'), content: t('cancel_3_6d') },
        { label: t('cancel_2d_label'), content: t('cancel_2d') },
        { label: t('cancel_weather_label'), content: t('cancel_weather') },
        { label: t('cancel_noshow_label'), content: t('cancel_noshow') },
      ],
    },
    {
      icon: ShieldCheck,
      title: t('insurance_title'),
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      defaultOpen: true,
      items: [
        { label: t('ins_company_label'), content: t('ins_company') },
        { label: t('ins_type_label'), content: t('ins_type') },
        { label: t('ins_limit_label'), content: t('ins_limit') },
        { label: t('ins_condition_label'), content: t('ins_condition') },
        { label: t('ins_personal_label'), content: t('ins_personal') },
        { label: t('ins_exclusion_label'), content: t('ins_exclusion') },
      ],
    },
    {
      icon: AlertTriangle,
      title: t('safety_title'),
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      defaultOpen: false,
      items: [
        { content: t('safety_1') },
        { content: t('safety_2') },
        { content: t('safety_3') },
        { content: t('safety_4') },
        { content: t('safety_5') },
        { content: t('safety_6') },
      ],
    },
    {
      icon: Heart,
      title: t('health_title'),
      color: 'text-red-600 bg-red-50 border-red-200',
      defaultOpen: false,
      items: [
        { content: t('health_1') },
        { content: t('health_2') },
        { content: t('health_3') },
        { content: t('health_4') },
      ],
    },
    {
      icon: Info,
      title: t('other_title'),
      color: 'text-zinc-600 bg-zinc-50 border-zinc-200',
      defaultOpen: false,
      items: [
        { content: t('other_1') },
        { content: t('other_2') },
        { content: t('other_3') },
        { content: t('other_4') },
        { content: t('other_5') },
        { content: t('other_6') },
      ],
    },
  ]

  return (
    <section className="mt-10 border-t border-zinc-200 pt-10">
      <h2 className="text-xl font-black text-zinc-900 mb-6">{t('header')}</h2>
      <div className="space-y-4">
        {SECTIONS.map(({ icon: Icon, title, color, defaultOpen, items }) => (
          <details key={title} open={defaultOpen} className={`group rounded-xl border ${color} overflow-hidden`}>
            <summary className="flex cursor-pointer items-center gap-3 px-4 py-3.5 font-bold text-sm select-none">
              <Icon className="h-4 w-4 shrink-0" />
              {title}
              <svg
                className="ml-auto h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="border-t border-current/10 bg-white px-4 py-4">
              <ul className="space-y-2.5">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-600 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                    <span>
                      {item.label && (
                        <strong className="text-zinc-800 mr-1">{item.label}:</strong>
                      )}
                      {item.content}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
