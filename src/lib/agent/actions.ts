import { fold } from './tokenize'
import { exportHourlyRainPdf } from '../rainPdf'
import {
  addDays,
  buildRainGrid,
  fetchRainGrid,
  formatHour,
  isoDate,
  rainStats,
} from '../rain'

export type RainPdfAction = {
  type: 'rain-pdf'
  place: string
  lat: number
  lng: number
  date: string
  startHour: number
  endHour: number
}

const CITIES = [
  { keys: ['porto alegre', 'poa'], place: 'Porto Alegre', lat: -30.0346, lng: -51.2177 },
  { keys: ['sao paulo'], place: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { keys: ['rio de janeiro'], place: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { keys: ['curitiba'], place: 'Curitiba', lat: -25.4284, lng: -49.2733 },
  { keys: ['florianopolis'], place: 'Florianópolis', lat: -27.5954, lng: -48.548 },
  { keys: ['brasilia'], place: 'Brasília', lat: -15.7939, lng: -47.8828 },
  { keys: ['belo horizonte'], place: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { keys: ['salvador'], place: 'Salvador', lat: -12.9777, lng: -38.5016 },
  { keys: ['recife'], place: 'Recife', lat: -8.0476, lng: -34.877 },
]

function matchCity(text: string) {
  let best = CITIES[0]
  let bestLen = 0
  for (const city of CITIES) {
    for (const key of city.keys) {
      if (text.includes(key) && key.length > bestLen) {
        best = city
        bestLen = key.length
      }
    }
  }
  return best ?? CITIES[0]
}

function matchDate(text: string) {
  if (text.includes('anteontem')) return addDays(isoDate(), -2)
  if (text.includes('ontem')) return addDays(isoDate(), -1)
  if (text.includes('hoje')) return isoDate()
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  return iso?.[1] ?? addDays(isoDate(), -1)
}

function matchHours(text: string) {
  const found = new Set<number>()
  for (const match of text.matchAll(/\b(?:as|das)\s+(\d{1,2})(?:\s*h)?\b/g)) {
    const hour = Number(match[1])
    if (hour >= 0 && hour <= 23) found.add(hour)
  }
  for (const match of text.matchAll(/\b(\d{1,2})\s*h\b/g)) {
    const hour = Number(match[1])
    if (hour >= 0 && hour <= 23) found.add(hour)
  }
  const hours = [...found].sort((a, b) => a - b)
  if (hours.length >= 2) return { startHour: hours[0] ?? 0, endHour: hours[hours.length - 1] ?? 23 }
  if (hours.length === 1) return { startHour: hours[0] ?? 0, endHour: hours[0] ?? 0 }
  return { startHour: 0, endHour: 23 }
}

export function detectAction(query: string): RainPdfAction | null {
  const text = fold(query)
  const hasPdf = text.includes('pdf')
  const hasRain = text.includes('chuva') || text.includes('precipita')
  const hasVerb = /\b(ger[aeio]|gere|gerar|export|baix|cria|faca|faz)\b/.test(text)
  if (!hasPdf || !hasRain || !hasVerb) return null

  const city = matchCity(text)
  const hours = matchHours(text)
  return {
    type: 'rain-pdf',
    place: city?.place ?? 'Porto Alegre',
    lat: city?.lat ?? -30.0346,
    lng: city?.lng ?? -51.2177,
    date: matchDate(text),
    startHour: hours.startHour,
    endHour: hours.endHour,
  }
}

function hourOf(time: string) {
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    const match = time.match(/T(\d{2})/)
    return match ? Number(match[1]) : -1
  }
  return date.getHours()
}

function dayOf(time: string) {
  if (time.length >= 10) return time.slice(0, 10)
  const date = new Date(time)
  return Number.isNaN(date.getTime()) ? '' : isoDate(date)
}

export async function runAction(action: RainPdfAction) {
  const pad = 0.12
  const bounds = {
    north: action.lat + pad,
    south: action.lat - pad,
    west: action.lng - pad,
    east: action.lng + pad,
  }
  const grid = await fetchRainGrid(buildRainGrid(bounds, 5, 5), {
    startDate: action.date,
    endDate: action.date,
  })

  const rows = grid.times.flatMap((time, index) => {
    if (dayOf(time) !== action.date) return []
    const hour = hourOf(time)
    if (hour < action.startHour || hour > action.endHour) return []
    const stats = rainStats(grid.samples, index)
    return [
      {
        label: formatHour(time),
        mean: stats.mean,
        max: stats.max,
        wet: stats.wet,
        points: grid.samples.length,
      },
    ]
  })

  if (!rows.length) {
    return `Consultei a Open-Meteo para ${action.place} em ${action.date}, das ${action.startHour}h às ${action.endHour}h, mas não veio horário nesse intervalo.`
  }

  exportHourlyRainPdf({
    place: action.place,
    date: action.date,
    startHour: action.startHour,
    endHour: action.endHour,
    rows,
  })

  const mean = rows.reduce((sum, row) => sum + row.mean, 0) / rows.length
  return `Gerei o PDF de chuva em ${action.place} no dia ${action.date}, das ${action.startHour}h às ${action.endHour}h. Média no intervalo: ${mean.toFixed(1)} mm. O download deve ter começado.`
}
