'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef } from 'react'
import {
  Menu, X, ChevronDown, User, LogOut, Settings, CalendarDays,
  MessageCircle, Route, HelpCircle, Megaphone, MessageSquare,
} from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'
import { signOut } from '@/lib/actions/auth'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import { getCategoryLabel, getDifficultyLabel } from '@/utils/format'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('nav')

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenDropdown(label)
  }
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150)
  }

  const navLinks: NavLink[] = [
    { label: t('about'), href: '/about' },
    { label: t('bikes'), href: '/bikes' },
    {
      label: t('contact'),
      href: '/faq',
      children: [
        {
          icon: HelpCircle,
          label: t('faq'),
          desc: t('faq_desc'),
          href: '/faq',
        },
        {
          icon: Megaphone,
          label: t('notice'),
          desc: t('notice_desc'),
          href: '/notice',
        },
        {
          icon: MessageSquare,
          label: t('consulting'),
          desc: t('consulting_desc'),
          href: '/contact',
          accent: true,
        },
      ],
    },
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
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">진행 중인 투어</p>
                        <div className="grid grid-cols-2 gap-2">
                          {activeTours.map((tour) => (
                            <Link
                              key={tour.slug}
                              href={`/tours/${tour.slug}`}
                              className="flex gap-3 items-center rounded-xl p-2.5 hover:bg-emerald-50 group transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                                <Image
                                  src={tour.thumbnail_url}
                                  alt={tour.title}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                  {tour.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${difficultyColor[tour.difficulty]}`}>
                                    {getDifficultyLabel(tour.difficulty)}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                                    <Route className="h-3 w-3" />
                                    {tour.distance_km}km
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-zinc-100 mt-3 pt-3">
                          <Link
                            href="/tours"
                            className="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            전체 투어 보기 →
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

          {/* 투어예약 CTA */}
          <div
            className="relative"
            onMouseEnter={() => openMenu('tours_cta')}
            onMouseLeave={closeMenu}
          >
            <Link
              href="/tours"
              className="flex items-center gap-1 rounded-full border-2 border-emerald-600 px-5 py-2 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
            >
              {t('tours')}
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            {openDropdown === 'tours_cta' && (
              <div className="absolute right-0 top-full w-[560px] pt-1">
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl p-4">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">진행 중인 투어</p>
                  <div className="grid grid-cols-2 gap-2">
                    {activeTours.map((tour) => (
                      <Link
                        key={tour.slug}
                        href={`/tours/${tour.slug}`}
                        className="flex gap-3 items-center rounded-xl p-2.5 hover:bg-emerald-50 group transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                          <Image
                            src={tour.thumbnail_url}
                            alt={tour.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {tour.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${difficultyColor[tour.difficulty]}`}>
                              {getDifficultyLabel(tour.difficulty)}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                              <Route className="h-3 w-3" />
                              {tour.distance_km}km
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-zinc-100 mt-3 pt-3">
                    <Link
                      href="/tours"
                      className="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      전체 투어 보기 →
                    </Link>
                  </div>
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
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </form>
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
            <div>
              <Link
                href="/tours"
                className="block rounded-full border-2 border-emerald-600 px-4 py-2.5 text-center text-sm font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all mb-2"
                onClick={() => setMobileOpen(false)}
              >
                {t('tours')}
              </Link>
              <div className="ml-3 space-y-1 border-l-2 border-zinc-100 pl-3">
                {activeTours.map((tour) => (
                  <Link
                    key={tour.slug}
                    href={`/tours/${tour.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {tour.title}
                  </Link>
                ))}
              </div>
            </div>
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
                {link.hasMega && (
                  <div className="ml-3 space-y-1 border-l-2 border-zinc-100 pl-3">
                    {activeTours.map((tour) => (
                      <Link
                        key={tour.slug}
                        href={`/tours/${tour.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setMobileOpen(false)}
                      >
                        {tour.title}
                      </Link>
                    ))}
                  </div>
                )}
                {link.children && (
                  <div className="ml-3 space-y-1 border-l-2 border-zinc-100 pl-3">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                          child.accent
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
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
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </form>
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
    </header>
  )
}
