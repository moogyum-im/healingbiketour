'use client'

import { useState } from 'react'

const BLUE = '#2a78d6'
const GRID = '#e1e0d9'
const AXIS = '#c3c2b7'
const MUTED = '#898781'
const INK = '#0b0b0b'

type TrendPoint = { date: string; count: number }
type SourcePoint = { label: string; count: number }

function formatMD(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

function niceMax(max: number) {
  if (max <= 0) return 4
  const pow = Math.pow(10, Math.floor(Math.log10(max)))
  const n = max / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

function TrendLineChart({ trend }: { trend: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const W = 640
  const H = 200
  const padL = 32
  const padR = 12
  const padT = 16
  const padB = 24
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const maxVal = niceMax(Math.max(...trend.map((t) => t.count), 1))
  const x = (i: number) => padL + (trend.length === 1 ? plotW / 2 : (i / (trend.length - 1)) * plotW)
  const y = (v: number) => padT + plotH - (v / maxVal) * plotH

  const linePath = trend.map((t, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(t.count)}`).join(' ')
  const yTicks = [0, maxVal / 2, maxVal]

  const active = hover !== null ? trend[hover] : null

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-zinc-900">최근 {trend.length}일 방문 추이</h2>
        {active && (
          <div className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-900">{active.count}명</span> · {formatMD(active.date)}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        role="img"
        aria-label={`최근 ${trend.length}일 방문자 추이 라인 차트`}
        onMouseLeave={() => setHover(null)}
      >
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={padL} y1={y(tick)} x2={W - padR} y2={y(tick)} stroke={GRID} strokeWidth={1} />
            <text x={padL - 6} y={y(tick)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={MUTED}>
              {Math.round(tick).toLocaleString()}
            </text>
          </g>
        ))}

        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={AXIS} strokeWidth={1} />

        {trend.map((t, i) =>
          i % 2 === 0 || i === trend.length - 1 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={10} fill={MUTED}>
              {formatMD(t.date)}
            </text>
          ) : null
        )}

        <path d={linePath} fill="none" stroke={BLUE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {trend.map((t, i) => {
          const isLast = i === trend.length - 1
          const isHover = hover === i
          if (!isLast && !isHover) return null
          return (
            <circle
              key={i}
              cx={x(i)}
              cy={y(t.count)}
              r={isHover ? 5 : 4}
              fill={BLUE}
              stroke="#fff"
              strokeWidth={2}
            />
          )
        })}

        {active && <line x1={x(hover!)} y1={padT} x2={x(hover!)} y2={padT + plotH} stroke={AXIS} strokeWidth={1} />}

        {trend.map((t, i) => (
          <rect
            key={i}
            x={padL + (i / trend.length) * plotW}
            y={padT}
            width={plotW / trend.length}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            tabIndex={0}
            aria-label={`${formatMD(t.date)}: ${t.count}명`}
          />
        ))}
      </svg>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-600">표로 보기</summary>
        <table className="mt-2 w-full text-xs text-zinc-600">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="font-medium py-1">날짜</th>
              <th className="font-medium py-1">방문자 수</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((t) => (
              <tr key={t.date} className="border-t border-zinc-100">
                <td className="py-1">{t.date}</td>
                <td className="py-1 tabular-nums">{t.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

function SourceBarChart({ sources }: { sources: SourcePoint[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const maxVal = Math.max(...sources.map((s) => s.count), 1)

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="font-bold text-zinc-900 mb-4">유입 경로 (최근 30일)</h2>

      {sources.length === 0 ? (
        <p className="text-sm text-zinc-400">데이터가 아직 없습니다</p>
      ) : (
        <div className="space-y-3">
          {sources.map((s, i) => {
            const pct = (s.count / maxVal) * 100
            const isHover = hover === i
            return (
              <div
                key={s.label}
                className="flex items-center gap-3"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className="w-20 shrink-0 text-xs text-zinc-500 truncate">{s.label}</div>
                <div className="flex-1 h-6 rounded-md bg-zinc-50 relative overflow-hidden">
                  <div
                    className="h-full rounded-r-md transition-[width] flex items-center"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isHover ? '#1c5cab' : BLUE,
                      minWidth: '2px',
                    }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums" style={{ color: INK }}>
                  {s.count.toLocaleString()}명
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VisitorCharts({ trend, sources }: { trend: TrendPoint[]; sources: SourcePoint[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TrendLineChart trend={trend} />
      <SourceBarChart sources={sources} />
    </div>
  )
}
