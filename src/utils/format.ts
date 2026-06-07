import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatPrice(amount: number, currency: 'KRW' | 'USD' = 'KRW') {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string, fmt = 'yyyy년 M월 d일 (eee)') {
  return format(parseISO(dateStr), fmt, { locale: ko })
}

export function formatDuration(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)}분`
  if (hours === Math.floor(hours)) return `${hours}시간`
  return `${Math.floor(hours)}시간 ${Math.round((hours % 1) * 60)}분`
}

export function formatDistance(km: number) {
  return `${km}km`
}

export function getDifficultyLabel(difficulty: string) {
  const map: Record<string, string> = {
    easy: '초급',
    moderate: '중급',
    hard: '상급',
  }
  return map[difficulty] ?? difficulty
}

export function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    city: '도심 투어',
    coastal: '해안 투어',
    mountain: '산악 투어',
    cultural: '문화 투어',
    night: '야간 투어',
    family: '가족 투어',
  }
  return map[category] ?? category
}
