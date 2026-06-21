export interface BikeRentalPrice {
  bikeId: string
  brand: string
  model: string
  material: string
  size: string
  day12: number
  day34: number
  day5plus: number
}

export const RENTAL_PRICES: BikeRentalPrice[] = [
  { bikeId: 'meridan',       brand: 'Cello',     model: 'Meridan',       material: '카본',    size: '27.5"', day12: 40000, day34: 35000, day5plus: 30000 },
  { bikeId: 'callas',        brand: 'Cello',     model: 'Callas',        material: '알루미늄', size: '27.5"', day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'principia',     brand: 'Principia', model: 'MXC',           material: '알루미늄', size: '26"',   day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'zaskar',        brand: 'GT',        model: 'Zaskar',        material: '알루미늄', size: '26"',   day12: 35000, day34: 30000, day5plus: 25000 },
  { bikeId: 'aspen',         brand: 'Jaeger',    model: 'Aspen',         material: '알루미늄', size: '26"',   day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'tcr6500',       brand: 'Giant',     model: 'TCR 6500',      material: '알루미늄', size: '700c',  day12: 35000, day34: 30000, day5plus: 25000 },
  { bikeId: 'yukon',         brand: 'Infiza',    model: 'Yukon',         material: '카본',    size: '700c',  day12: 45000, day34: 40000, day5plus: 35000 },
  { bikeId: 'cayin',         brand: 'Cello',     model: 'Cayin',         material: '카본',    size: '700c',  day12: 40000, day34: 35000, day5plus: 30000 },
  { bikeId: 'bianchi1885',   brand: 'Bianchi',   model: '1885',          material: '알루미늄', size: '700c',  day12: 40000, day34: 35000, day5plus: 30000 },
  { bikeId: 'aspen-limited', brand: 'Jaeger',    model: 'Aspen Limited', material: '알루미늄', size: '26"',   day12: 40000, day34: 35000, day5plus: 30000 },
]

export function getDailyRate(prices: BikeRentalPrice, days: number): number {
  if (days >= 5) return prices.day5plus
  if (days >= 3) return prices.day34
  return prices.day12
}

export function getRentalPriceByBikeId(bikeId: string): BikeRentalPrice | undefined {
  return RENTAL_PRICES.find((p) => p.bikeId === bikeId)
}
