'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'

export default function AdminAddTourButton() {
  const { role } = useSession()
  if (role !== 'admin') return null

  return (
    <Link
      href="/admin/tours/new"
      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
    >
      <Plus className="h-4 w-4" />
      새 투어 추가
    </Link>
  )
}
