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
  { bikeId: 'aspen-limited', brand: 'Jaeger',    model: 'Aspen Limited', material: '알루미늄',      size: '26"',  day12: 40000, day34: 35000, day5plus: 30000 },
  { bikeId: 'tx8-pro',      brand: '모토벨로', model: 'TX8 PRO',       material: '알루미늄 폴딩', size: '20"',  day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'tx8-pro3',     brand: '모토벨로', model: 'TX8 PRO3',      material: '알루미늄 폴딩', size: '20"',  day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'viaggio-v6',   brand: 'AU테크',   model: '비아지오 V6',   material: '알루미늄',      size: '20"',  day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'tn8-pro',      brand: '모토벨로', model: 'TN8 PRO',       material: '알루미늄',      size: '20"',  day12: 55000, day34: 50000, day5plus: 40000 },
  { bikeId: 'e-volt',       brand: '스마트',   model: 'e-volt',        material: '알루미늄',      size: '16"',  day12: 45000, day34: 40000, day5plus: 35000 },
  { bikeId: 'q-tour',       brand: 'quali',    model: 'q-tour',        material: '알루미늄',      size: '20"',  day12: 45000, day34: 40000, day5plus: 35000 },
  { bikeId: 'q-max',        brand: 'quali',    model: 'q-max',         material: '알루미늄',      size: '20"',  day12: 50000, day34: 45000, day5plus: 40000 },
  { bikeId: 'j2-aeul-pro',  brand: 'j2 sport', model: '애울 프로',     material: '알루미늄',      size: '20"',  day12: 45000, day34: 40000, day5plus: 35000 },
]

export function getDailyRate(prices: BikeRentalPrice, days: number): number {
  if (days >= 5) return prices.day5plus
  if (days >= 3) return prices.day34
  return prices.day12
}

export function getRentalPriceByBikeId(bikeId: string): BikeRentalPrice | undefined {
  return RENTAL_PRICES.find((p) => p.bikeId === bikeId)
}
