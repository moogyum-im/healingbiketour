import Link from 'next/link'
import { Bike, LayoutDashboard, Map, CalendarDays, Users, MessageSquare, LogOut, ChevronRight, Gift, MessageCircle, Megaphone, HelpCircle, UserCheck, TrendingUp, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: roleResult }, { data: profile }, { count: pendingChats }] = await Promise.all([
    supabase.rpc('get_my_role'),
    supabase.from('profiles').select('name, email').eq('id', user.id).single(),
    supabase.from('chat_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  if (roleResult !== 'admin') redirect('/')

  const navItems = [
    { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
    { href: '/admin/tours', label: '투어 관리', icon: Map },
    { href: '/admin/bookings', label: '투어 예약 관리', icon: CalendarDays },
    { href: '/admin/rental-bookings', label: '렌탈 예약 관리', icon: KeyRound },
    { href: '/admin/rental-availability', label: '렌탈 수량 관리', icon: Bike },
    { href: '/admin/sales', label: '매출 관리', icon: TrendingUp },
    { href: '/admin/users', label: '회원 관리', icon: Users },
    { href: '/admin/reviews', label: '리뷰 관리', icon: MessageSquare },
    { href: '/admin/credits', label: '크레딧 관리', icon: Gift },
    { href: '/admin/chats', label: '상담 문의', icon: MessageCircle, badge: pendingChats ?? 0 },
    { href: '/admin/notices', label: '공지사항', icon: Megaphone },
    { href: '/admin/faqs', label: 'FAQ 관리', icon: HelpCircle },
    { href: '/admin/guide', label: '가이드 지원', icon: UserCheck },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* 사이드바 */}
      <aside className="hidden lg:flex lg:w-60 flex-col border-r border-zinc-200 bg-white">
        {/* 로고 */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-200">
          <Bike className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-zinc-900">힐링바이크투어</p>
            <p className="text-xs text-zinc-400">관리자 패널</p>
          </div>
        </div>

        {/* 내비 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {'badge' in item && (item.badge as number) > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                  {item.badge as number}
                </span>
              )}
              {(!('badge' in item) || (item.badge as number) === 0) && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          ))}
        </nav>

        {/* 하단 프로필 */}
        <div className="border-t border-zinc-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-zinc-800">{profile?.name ?? '관리자'}</p>
            <p className="text-xs text-zinc-400 truncate">{profile?.email ?? user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 모바일 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white lg:hidden">
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-zinc-900">관리자</span>
          </div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">← 사이트로</Link>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
