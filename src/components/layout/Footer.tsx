import Link from 'next/link'
import { Bike, MessageCircle, Share2, Video } from 'lucide-react'

const footerLinks = {
  투어: [
    { label: '전체 투어', href: '/tours' },
    { label: '도심 투어', href: '/tours?category=city' },
    { label: '산악 투어', href: '/tours?category=mountain' },
    { label: '해안 투어', href: '/tours?category=coastal' },
  ],
  고객지원: [
    { label: '자주 묻는 질문', href: '/faq' },
    { label: '예약 조회', href: '/my/bookings' },
    { label: '취소 및 환불 정책', href: '/policy/refund' },
    { label: '공지사항', href: '/notice' },
  ],
  회사: [
    { label: '서비스 소개', href: '/about' },
    { label: '가이드 지원', href: '/guide/apply' },
    { label: '이용약관', href: '/policy/terms' },
    { label: '개인정보 처리방침', href: '/policy/privacy' },
  ],
}

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Share2 },
  { label: 'YouTube', href: 'https://youtube.com', icon: Video },
  { label: 'KakaoTalk', href: 'https://kakao.com', icon: MessageCircle },
]

export default function Footer() {
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
              서울과 전국 각지의 아름다운 자전거 투어를 경험해보세요. 전문 가이드와 함께하는
              안전하고 즐거운 라이딩을 제공합니다.
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
          <p>상호: 주식회사 힐링바이크투어 &nbsp;|&nbsp; 대표자: 이상호 &nbsp;|&nbsp; 사업자등록번호: 860-86-04061</p>
          <p>사업장 소재지: 서울특별시 영등포구 당산로50길 11, 102호(당산동6가, 당산빌) &nbsp;|&nbsp; 이메일: healingbiketour@gmail.com</p>
          <p>통신판매업신고번호: 제2026-서울영등포-XXXX호 &nbsp;|&nbsp; 여행사업 등록 영등포구</p>
          <p className="pt-1 text-zinc-700">© 2026 주식회사 힐링바이크투어. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
