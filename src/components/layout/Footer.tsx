import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Bike, MessageCircle, Share2, Video } from 'lucide-react'

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Share2 },
  { label: 'YouTube', href: 'https://youtube.com', icon: Video },
  { label: 'KakaoTalk', href: 'https://kakao.com', icon: MessageCircle },
]

export default async function Footer() {
  const t = await getTranslations('footer')

  const footerLinks = {
    [t('tours_heading')]: [
      { label: t('all_tours'), href: '/tours' },
      { label: t('city_tours'), href: '/tours?category=city' },
      { label: t('mountain_tours'), href: '/tours?category=mountain' },
      { label: t('coastal_tours'), href: '/tours?category=coastal' },
    ],
    [t('support_heading')]: [
      { label: t('faq'), href: '/faq' },
      { label: t('my_bookings'), href: '/my/bookings' },
      { label: t('refund_policy'), href: '/policy/refund' },
      { label: t('notices'), href: '/notice' },
    ],
    [t('company_heading')]: [
      { label: t('about'), href: '/about' },
      { label: t('guide_apply'), href: '/guide/apply' },
      { label: t('terms'), href: '/policy/terms' },
      { label: t('privacy'), href: '/policy/privacy' },
    ],
  }

  return (
    <footer className="border-t border-zinc-200 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-emerald-400">
              <Bike className="h-6 w-6" />
              <span className="text-lg font-bold">힐링바이크투어</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              {t('brand_desc')}
            </p>
            <div className="mt-4 flex gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition-colors hover:bg-emerald-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-8 text-xs text-zinc-600 space-y-1.5">
          <p>{t('biz_info')}</p>
          <p>{t('biz_address')}</p>
          <p>{t('biz_mail_order')}</p>
          <p className="pt-1 text-zinc-700">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
