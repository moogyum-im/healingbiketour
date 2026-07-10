'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef } from 'react'
import {
  Menu, X, ChevronDown, User, LogOut, Settings, CalendarDays,
  MessageCircle, Route, HelpCircle, Megaphone, MessageSquare, KeyRound, Search,
} from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import SearchModal from './SearchModal'
import type { Tour } from '@/types'

const difficultyColor: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700',
  moderate: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
}

type NavChild = {
  icon: React.ElementType
  label: string
  desc: string
  href: string
  accent?: boolean
}

type NavLink = {
  label: string
  href: string
  hasMega?: boolean
  children?: NavChild[]
}

export default function Header({ tours = [] }: { tours?: Tour[] }) {
  const activeTours = tours.filter((t) => t.is_active)
  const { user, role, loading } = useSession()
  const isAdmin = role === 'admin'
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('nav')
  const tTour = useTranslations('tourDetail')

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenDropdown(label)
  }
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150)
  }

  const navLinks: NavLink[] = [
    { label: t('bikes'), href: '/bikes' },
    { label: t('about'), href: '/about' },
  ]

  const contactChildren: NavChild[] = [
    { icon: HelpCircle,    label: t('faq'),        desc: t('faq_desc'),        href: '/faq' },
    { icon: Megaphone,     label: t('notice'),     desc: t('notice_desc'),     href: '/notice' },
    { icon: MessageSquare, label: t('consulting'), desc: t('consulting_desc'), href: '/contact', accent: true },
  ]

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'User'

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/힐링바이크투어-로고.png"
            alt="힐링바이크투어"
            width={280}
            height={80}
            className="h-20 w-auto mb-2"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* 예약하기 CTA — 맨 앞 */}
          <div
            className="relative mr-2"
            onMouseEnter={() => openMenu('tours_cta')}
            onMouseLeave={closeMenu}
          >
            <button className="flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:scale-[1.02]">
              {t('tours')}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {openDropdown === 'tours_cta' && (
              <div className="absolute left-0 top-full w-[580px] pt-1">
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
                  <div className="p-4">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Route className="h-3.5 w-3.5" /> {t('tour_booking')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {activeTours.map((tour) => {
                        const tourTitleMap: Record<string, string> = {
                          'hangang-healing-tour': t('hangang'),
                          'ara-waterway-tour': t('ara'),
                          'haengju-fortress-tour': t('haengju'),
                          'chuncheon-lakeside-tour': t('chuncheon'),
                          'olympic-park-tour': t('olympic'),
                          'peace-nuri-1': t('peacenuri'),
                          'national-cycling-route': t('national'),
                          'imjingak-tour': t('imjingak'),
                          'yangsu-tour': t('yangsu'),
                          'boramae-park-tour': t('boramae'),
                          'cheonggyecheon-tour': t('cheonggyecheon'),
                          'seoul-forest-tour': t('seoulforest'),
                        }
                        const displayTitle = tourTitleMap[tour.slug] ?? tour.title
                        return (
                          <Link
                            key={tour.slug}
                            href={`/tours/${tour.slug}`}
                            className="flex gap-3 items-center rounded-xl p-2.5 hover:bg-emerald-50 group transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                              <Image src={tour.thumbnail_url} alt={displayTitle} fill className="object-cover" sizes="80px" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                {displayTitle}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${difficultyColor[tour.difficulty]}`}>
                                  {tTour(`difficulty_${tour.difficulty}`)}
                                </span>
                                <span className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                                  <Route className="h-3 w-3" />{tour.distance_km}km
                                </span>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <Link href="/tours" className="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors" onClick={() => setOpenDropdown(null)}>
                        {t('all_tours')} →
                      </Link>
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-3">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" /> {t('rental')}
                    </p>
                    <Link
                      href="/rental"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center justify-between rounded-xl bg-white border border-zinc-200 px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50 group transition-all"
                    >
                      <div>
                        <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">{t('rental_book')}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{t('rental_detail')}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">{t('book_cta')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => {
            if (link.hasMega) {
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={closeMenu}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                  {openDropdown === link.label && (
                    // pt-1: 버튼과의 시각적 간격 + 마우스 이동 경로 커버 (틈 없음)
                    <div className="absolute left-0 top-full w-[560px] pt-1">
                      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl p-4">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">{t('active_tours')}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {activeTours.map((tour) => {
                            const tourTitleMap2: Record<string, string> = {
                              'hangang-healing-tour': t('hangang'),
                              'ara-waterway-tour': t('ara'),
                              'haengju-fortress-tour': t('haengju'),
                              'chuncheon-lakeside-tour': t('chuncheon'),
                              'olympic-park-tour': t('olympic'),
                              'peace-nuri-1': t('peacenuri'),
                              'national-cycling-route': t('national'),
                              'imjingak-tour': t('imjingak'),
                              'yangsu-tour': t('yangsu'),
                              'boramae-park-tour': t('boramae'),
                              'cheonggyecheon-tour': t('cheonggyecheon'),
                              'seoul-forest-tour': t('seoulforest'),
                            }
                            const displayTitle2 = tourTitleMap2[tour.slug] ?? tour.title
                            return (
                            <Link
                              key={tour.slug}
                              href={`/tours/${tour.slug}`}
                              className="flex gap-3 items-center rounded-xl p-2.5 hover:bg-emerald-50 group transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                                <Image
                                  src={tour.thumbnail_url}
                                  alt={displayTitle2}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                  {displayTitle2}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${difficultyColor[tour.difficulty]}`}>
                                    {tTour(`difficulty_${tour.difficulty}`)}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                                    <Route className="h-3 w-3" />
                                    {tour.distance_km}km
                                  </span>
                                </div>
                              </div>
                            </Link>
                            )
                          })}
                        </div>
                        <div className="border-t border-zinc-100 mt-3 pt-3">
                          <Link
                            href="/tours"
                            className="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {t('all_tours')} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            if (link.children) {
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={closeMenu}
                >
                  <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute right-0 top-full w-72 pt-1">
                      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl p-2 overflow-hidden">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors group ${
                              child.accent ? 'hover:bg-emerald-50' : 'hover:bg-zinc-50'
                            }`}
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              child.accent
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                            }`}>
                              <child.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${child.accent ? 'text-emerald-700' : 'text-zinc-900'}`}>
                                {child.label}
                              </p>
                              <p className="text-xs text-zinc-400 mt-0.5">{child.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            aria-label="검색"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* 문의하기 드롭다운 */}
          <div
            className="relative"
            onMouseEnter={() => openMenu('contact')}
            onMouseLeave={closeMenu}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              {t('contact')}
              <ChevronDown className="h-4 w-4" />
            </button>
            {openDropdown === 'contact' && (
              <div className="absolute right-0 top-full w-72 pt-1">
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl p-2 overflow-hidden">
                  {contactChildren.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors group ${child.accent ? 'hover:bg-emerald-50' : 'hover:bg-zinc-50'}`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${child.accent ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'}`}>
                        <child.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${child.accent ? 'text-emerald-700' : 'text-zinc-900'}`}>{child.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{child.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100" />
          ) : user ? (
            <div
              className="relative"
              onMouseEnter={() => openMenu('user')}
              onMouseLeave={closeMenu}
            >
              <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>
              {openDropdown === 'user' && (
                <div className="absolute right-0 top-full w-48 pt-1">
                <div className="rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-zinc-100 px-4 py-2.5">
                    <p className="text-xs text-zinc-400">{t('logged_in_as')}</p>
                    <p className="text-sm font-bold text-zinc-800 truncate">{displayName}</p>
                  </div>
                  {isAdmin ? (
                    <>
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        <Settings className="h-4 w-4" />
                        {t('admin')}
                      </Link>
                    </>
                  ) : (
                    <Link href="/my" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                      <CalendarDays className="h-4 w-4" />
                      {t('my_page')}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </button>
                </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                {t('login')}
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:scale-[1.02]"
              >
                {t('signup')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="검색"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <nav className="px-4 py-3 space-y-1">
            {/* 예약하기 섹션 */}
            <div className="rounded-2xl bg-zinc-50 p-3 space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">{t('tours')}</p>

              {/* 투어 */}
              <div>
                <p className="px-1 py-1 text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                  <Route className="h-3 w-3" /> {t('tour_booking')}
                </p>
                <div className="space-y-0.5">
                  <Link href="/tours" className="block rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50" onClick={() => setMobileOpen(false)}>
                    {t('all_tours')}
                  </Link>
                  {activeTours.map((tour) => {
                    const mobileTitle: Record<string, string> = {
                      'hangang-healing-tour': t('hangang'),
                      'ara-waterway-tour': t('ara'),
                      'haengju-fortress-tour': t('haengju'),
                      'chuncheon-lakeside-tour': t('chuncheon'),
                      'olympic-park-tour': t('olympic'),
                      'peace-nuri-1': t('peacenuri'),
                      'national-cycling-route': t('national'),
                      'imjingak-tour': t('imjingak'),
                      'yangsu-tour': t('yangsu'),
                      'boramae-park-tour': t('boramae'),
                      'cheonggyecheon-tour': t('cheonggyecheon'),
                      'seoul-forest-tour': t('seoulforest'),
                    }
                    return (
                      <Link key={tour.slug} href={`/tours/${tour.slug}`} className="block rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => setMobileOpen(false)}>
                        {mobileTitle[tour.slug] ?? tour.title}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* 렌탈 */}
              <div className="border-t border-zinc-200 pt-2">
                <p className="px-1 py-1 text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> {t('rental')}
                </p>
                <Link href="/rental" className="block rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => setMobileOpen(false)}>
                  {t('rental_book')} <span className="text-xs text-zinc-400">{t('rental_desc')}</span>
                </Link>
              </div>
            </div>

            {/* 나머지 네비 */}
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="ml-3 space-y-1 border-l-2 border-zinc-100 pl-3">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium ${child.accent ? 'text-emerald-700 hover:bg-emerald-50' : 'text-zinc-600 hover:bg-zinc-50'}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-zinc-200 pt-3 space-y-1">
              {user ? (
                <>
                  {isAdmin ? (
                    <>
                      <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100" onClick={() => setMobileOpen(false)}>
                        <Settings className="h-4 w-4" />
                        {t('admin')}
                      </Link>
                    </>
                  ) : (
                    <Link href="/my" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100" onClick={() => setMobileOpen(false)}>
                      <CalendarDays className="h-4 w-4" />
                      {t('my_page')}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-emerald-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} tours={tours} />
    </header>
  )
}
