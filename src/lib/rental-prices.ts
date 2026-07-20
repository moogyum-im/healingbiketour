export interface BikeRentalPrice {
  bikeId: string
  brand: string
  model: string
  material: string
  size: string
  isEbike: boolean
  h24: number
  h48: number
  h72: number
  extraBattery: number
}

const EBIKE = { isEbike: true, h24: 45000, h48: 40000, h72: 35000, extraBattery: 10000 }
const BIKE  = { isEbike: false, h24: 40000, h48: 35000, h72: 30000, extraBattery: 0 }

export const RENTAL_PRICES: BikeRentalPrice[] = [
  { bikeId: 'meridan',       brand: 'Cello',     model: 'Meridan',       material: '카본',          size: '27.5"', ...BIKE },
  { bikeId: 'callas',        brand: 'Cello',     model: 'Callas',        material: '알루미늄',       size: '27.5"', ...BIKE },
  { bikeId: 'principia',     brand: 'Principia', model: 'MXC',           material: '알루미늄',       size: '26"',   ...BIKE },
  { bikeId: 'zaskar',        brand: 'GT',        model: 'Zaskar',        material: '알루미늄',       size: '26"',   ...BIKE },
  { bikeId: 'aspen',         brand: 'Jaeger',    model: 'Aspen',         material: '알루미늄',       size: '26"',   ...BIKE },
  { bikeId: 'tcr6500',       brand: 'Giant',     model: 'TCR 6500',      material: '알루미늄',       size: '700c',  ...BIKE },
  { bikeId: 'yukon',         brand: 'Infiza',    model: 'Yukon',         material: '카본',          size: '700c',  ...BIKE },
  { bikeId: 'cayin',         brand: 'Cello',     model: 'Cayin',         material: '카본',          size: '700c',  ...BIKE },
  { bikeId: 'bianchi1885',   brand: 'Bianchi',   model: '1885',          material: '알루미늄',       size: '700c',  ...BIKE },
  { bikeId: 'aspen-limited', brand: 'Jaeger',    model: 'Aspen Limited', material: '알루미늄',       size: '26"',   ...BIKE },
  { bikeId: 'tx8-pro',       brand: '모토벨로',  model: 'TX8 PRO',       material: '알루미늄 폴딩',  size: '20"',   ...EBIKE },
  { bikeId: 'tx8-pro3',      brand: '모토벨로',  model: 'TX8 PRO3',      material: '알루미늄 폴딩',  size: '20"',   ...EBIKE },
  { bikeId: 'viaggio-v6',    brand: 'AU테크',    model: '비아지오 V6',   material: '알루미늄',       size: '20"',   ...EBIKE },
  { bikeId: 'tn8-pro',       brand: '모토벨로',  model: 'TN8 PRO',       material: '알루미늄',       size: '20"',   ...EBIKE },
  { bikeId: 'e-volt',        brand: '스마트',    model: 'e-volt',        material: '알루미늄',       size: '16"',   ...EBIKE },
  { bikeId: 'q-tour',        brand: 'quali',     model: 'q-tour',        material: '알루미늄',       size: '20"',   ...EBIKE },
  { bikeId: 'q-max',         brand: 'quali',     model: 'q-max',         material: '알루미늄',       size: '20"',   ...EBIKE },
  { bikeId: 'j2-aeul-pro',   brand: 'j2 sport',  model: '애울 프로',     material: '알루미늄',       size: '20"',   ...EBIKE },
]

export function getDailyRate(prices: BikeRentalPrice, days: number): number {
  if (days >= 3) return prices.h72
  if (days >= 2) return prices.h48
  return prices.h24
}

export function getRentalPriceByBikeId(bikeId: string): BikeRentalPrice | undefined {
  return RENTAL_PRICES.find((p) => p.bikeId === bikeId)
}
