'use client'

import { Trash2 } from 'lucide-react'
import { togglePopupActive, deletePopup } from '@/lib/actions/popups'
import { useTransition } from 'react'

interface Props {
  id: string
  isActive: boolean
}

export default function PopupActions({ id, isActive }: Props) {
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => togglePopupActive(id, !isActive))
  }

  function handleDelete() {
    if (!confirm('팝업을 삭제하시겠습니까?')) return
    startTransition(() => deletePopup(id))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={pending}
        aria-label="활성/비활성 토글"
        className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>

      <button
        onClick={handleDelete}
        disabled={pending}
        className="ml-auto flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
