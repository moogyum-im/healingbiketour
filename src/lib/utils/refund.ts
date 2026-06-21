export function calcRefundPercentageFromDate(tourDateStr: string | null | undefined): number {
  if (!tourDateStr) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tourDay = new Date(tourDateStr + 'T00:00:00')
  const days = Math.ceil((tourDay.getTime() - today.getTime()) / 86_400_000)
  if (days >= 7) return 100
  if (days >= 3) return 80
  if (days === 2) return 50
  if (days === 1) return 20
  return 0
}
