'use client'

import { useEffect } from 'react'

interface Props {
  id: string
  imageUrl: string
  linkUrl: string | null
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

function setHideToday(id: string) {
  try {
    const stored = localStorage.getItem('popup_hide_today')
    const map: Record<string, string> = stored ? JSON.parse(stored) : {}
    map[id] = todayStr()
    localStorage.setItem('popup_hide_today', JSON.stringify(map))
  } catch {}
}

export default function PopupWindowClient({ id, imageUrl, linkUrl }: Props) {
  useEffect(() => {
    if (isHiddenToday(id)) window.close()
  }, [id])

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt="팝업"
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
    />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#111' }}>
      {/* 이미지 영역 */}
      <div style={{ flex: 1, overflow: 'hidden', cursor: linkUrl ? 'pointer' : 'default' }}>
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noreferrer noopener" style={{ display: 'block', height: '100%' }} onClick={() => window.close()}>
            {img}
          </a>
        ) : img}
      </div>

      {/* 하단 버튼 바 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        padding: '0 16px',
        background: '#1a1a1a',
        borderTop: '1px solid #333',
        flexShrink: 0,
      }}>
        <button
          onClick={() => { setHideToday(id); window.close() }}
          style={{
            background: 'none', border: 'none',
            color: '#888', fontSize: 13, cursor: 'pointer',
            textDecoration: 'underline', textUnderlineOffset: 3,
            padding: 0, fontFamily: 'inherit',
          }}
        >
          오늘 하루 안 보기
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: 'none', border: '1px solid #444',
            color: '#bbb', fontSize: 13, cursor: 'pointer',
            padding: '5px 16px', borderRadius: 6, fontFamily: 'inherit',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
