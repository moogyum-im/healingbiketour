'use client'

import { useTransition, useState } from 'react'
import { updateTourSortOrder } from '@/lib/actions/admin'

interface Props {
  tourId: string
  initialOrder: number
}

export default function SortOrderInput({ tourId, initialOrder }: Props) {
  const [value, setValue] = useState(initialOrder)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleBlur() {
    if (value === initialOrder) return
    startTransition(async () => {
      const result = await updateTourSortOrder(tourId, value)
      if (!result.error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      }
    })
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <input
        type="number"
        min={1}
        max={999}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        disabled={isPending}
        className="w-14 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-sm font-semibold text-zinc-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
      />
      {saved && <span className="text-[10px] text-emerald-600 font-bold">저장</span>}
      {isPending && <span className="text-[10px] text-zinc-400">…</span>}
    </div>
  )
}
