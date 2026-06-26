'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface Popup {
  id: string
  image_url: string
  link_url: string | null
  position: string
}

const POSITION_PATHS: Record<string, string[]> = {
  all:    ['/'],
  home:   ['/'],
  tours:  ['/tours'],
  rental: ['/rental'],
  about:  ['/about'],
}

function matchesPosition(position: string, pathname: string): boolean {
  if (position === 'all') return true
  const paths = POSITION_PATHS[position] ?? []
  return paths.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function isHiddenToday(id: string): boolean {
  try {
    const stored = localStorage.getItem('popup_hide_today')
    if (!stored) return false
    const map: Record<string, string> = JSON.parse(stored)
    return map[id] === todayStr()
  } catch { return false }
}

export default function PopupBanner({ popups }: { popups: Popup[] }) {
  const pathname = usePathname()
  const openedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const visible = popups.filter(p =>
      !isHiddenToday(p.id) && matchesPosition(p.position, pathname)
    )

    visible.forEach((popup, i) => {
      if (openedRef.current.has(popup.id)) return
      openedRef.current.add(popup.id)

      const w = Math.min(680, window.screen.availWidth)
      const h = Math.min(560, window.screen.availHeight)
      const left = Math.round((window.screen.availWidth - w) / 2) + i * 20
      const top  = Math.round((window.screen.availHeight - h) / 2) + i * 20

      window.open(
        `/popup/${popup.id}`,
        `popup_${popup.id}`,
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
      )
    })
  // pathname이 바뀔 때마다 (페이지 이동 시) 해당 페이지 팝업 다시 열기
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
