import { createClient } from '@/lib/supabase/server'
import { Eye, Users } from 'lucide-react'
import VisitorCharts from './VisitorCharts'

export const metadata = { title: '방문자 통계 | 관리자' }

const OWN_HOST = 'healingbiketour.kr'
const TREND_DAYS = 14
const HISTORY_DAYS = 30

function classifySource(referrer: string | null): string {
  if (!referrer) return '직접 접속'
  let host = ''
  try {
    host = new URL(referrer).hostname
  } catch {
    return '기타'
  }
  if (host.endsWith(OWN_HOST)) return '직접 접속'
  if (host.includes('naver.com')) return '네이버'
  if (host.includes('google.')) return '구글'
  return '기타'
}

export default async function AdminVisitorsPage() {
  const supabase = await createClient()

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - (HISTORY_DAYS - 1))
  const since = sinceDate.toISOString().split('T')[0]

  const [{ count: todayVisitors }, { count: totalVisitors }, { data: recentVisits }] =
    await Promise.all([
      supabase.from('site_visits').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('site_visits').select('*', { count: 'exact', head: true }),
      supabase.from('site_visits').select('created_at, referrer').gte('created_at', since),
    ])

  // 최근 N일 일자별 방문자 수
  const dailyMap = new Map<string, number>()
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (TREND_DAYS - 1 - i))
    dailyMap.set(d.toISOString().split('T')[0], 0)
  }
  for (const v of recentVisits ?? []) {
    const day = v.created_at.split('T')[0]
    if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
  }
  const trend = [...dailyMap.entries()].map(([date, count]) => ({ date, count }))

  // 유입 경로별 집계
  const sourceMap = new Map<string, number>()
  for (const v of recentVisits ?? []) {
    const source = classifySource(v.referrer)
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1)
  }
  const sourceOrder = ['네이버', '구글', '직접 접속', '기타']
  const sources = sourceOrder
    .map((label) => ({ label, count: sourceMap.get(label) ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)

  const stats = [
    { label: '오늘 방문자', value: todayVisitors ?? 0, icon: Eye, color: 'bg-sky-50 text-sky-600' },
    { label: '누적 방문자', value: totalVisitors ?? 0, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">방문자 통계</h1>
        <p className="mt-1 text-sm text-zinc-500">방문자당 하루 1회로 집계됩니다</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <VisitorCharts trend={trend} sources={sources} />
    </div>
  )
}
