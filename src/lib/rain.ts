export interface LatLngBoundsBox {
  north: number
  south: number
  west: number
  east: number
}

export interface RainSample {
  lat: number
  lng: number
  current: number
  hourly: number[]
}

export interface DailyRainSeries {
  dates: string[]
  points: { lat: number; lng: number; daily: number[] }[]
}

export interface AreaRainReport {
  startDate: string
  endDate: string
  bounds: LatLngBoundsBox
  dates: string[]
  dailyMean: number[]
  dailyMax: number[]
  cumulative: number[]
  meanDaily: number
  totalMean: number
  maxDay: { date: string; mm: number }
  minDay: { date: string; mm: number }
  pointCount: number
  areaKm2: number
}

export interface RainGridResult {
  samples: RainSample[]
  times: string[]
  currentTime: string
  fetchedAt: string
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const HISTORY_URL = 'https://historical-forecast-api.open-meteo.com/v1/forecast'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'

export const MAX_RANGE_DAYS = 14

export const RAIN_STOPS: { mm: number; color: [number, number, number] }[] = [
  { mm: 0, color: [15, 23, 42] },
  { mm: 0.2, color: [125, 211, 252] },
  { mm: 0.6, color: [34, 211, 238] },
  { mm: 1.5, color: [59, 130, 246] },
  { mm: 3, color: [34, 197, 94] },
  { mm: 6, color: [234, 179, 8] },
  { mm: 12, color: [249, 115, 22] },
  { mm: 20, color: [239, 68, 68] },
  { mm: 35, color: [192, 38, 211] },
]

type OpenMeteoLocation = {
  latitude: number
  longitude: number
  current?: { time?: string; precipitation?: number; rain?: number }
  hourly?: { time?: string[]; precipitation?: number[]; rain?: number[] }
  daily?: { time?: string[]; precipitation_sum?: number[] }
}

export function isoDate(value = new Date()) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(iso: string, amount: number) {
  const date = new Date(`${iso}T12:00:00`)
  date.setDate(date.getDate() + amount)
  return isoDate(date)
}

export function rangeDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1
}

export function bboxAreaKm2(bounds: LatLngBoundsBox) {
  const lat = (bounds.north + bounds.south) / 2
  const height = Math.abs(bounds.north - bounds.south) * 111.32
  const width = Math.abs(bounds.east - bounds.west) * 111.32 * Math.cos((lat * Math.PI) / 180)
  return height * width
}

function coordinateParams(points: { lat: number; lng: number }[]) {
  return {
    latitudes: points.map((point) => point.lat.toFixed(4)).join(','),
    longitudes: points.map((point) => point.lng.toFixed(4)).join(','),
  }
}

async function fetchLocations(url: URL, signal?: AbortSignal) {
  const response = await fetch(url.toString(), { signal })
  if (!response.ok) {
    throw new Error('Não foi possível ler a Open-Meteo.')
  }
  return asList(await response.json())
}

export function buildRainGrid(bounds: LatLngBoundsBox, columns = 7, rows = 7) {
  const west = Math.min(bounds.west, bounds.east)
  const east = Math.max(bounds.west, bounds.east)
  const south = Math.min(bounds.south, bounds.north)
  const north = Math.max(bounds.south, bounds.north)
  const points: { lat: number; lng: number }[] = []
  const colSpan = Math.max(columns - 1, 1)
  const rowSpan = Math.max(rows - 1, 1)
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      points.push({
        lat: north - (row / rowSpan) * (north - south),
        lng: west + (col / colSpan) * (east - west),
      })
    }
  }
  return points
}

function asList(payload: unknown): OpenMeteoLocation[] {
  if (Array.isArray(payload)) return payload as OpenMeteoLocation[]
  if (payload && typeof payload === 'object') return [payload as OpenMeteoLocation]
  return []
}

function rainValue(precipitation?: number, rain?: number) {
  const value = Math.max(precipitation ?? 0, rain ?? 0)
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

export async function fetchRainGrid(
  points: { lat: number; lng: number }[],
  options: { startDate?: string; endDate?: string; signal?: AbortSignal } = {},
): Promise<RainGridResult> {
  if (!points.length) {
    return { samples: [], times: [], currentTime: '', fetchedAt: new Date().toISOString() }
  }

  const { latitudes, longitudes } = coordinateParams(points)
  const historical = Boolean(options.startDate && options.endDate)
  const url = new URL(historical ? HISTORY_URL : FORECAST_URL)
  url.searchParams.set('latitude', latitudes)
  url.searchParams.set('longitude', longitudes)
  url.searchParams.set('hourly', 'precipitation,rain')
  url.searchParams.set('timezone', 'auto')
  if (historical && options.startDate && options.endDate) {
    url.searchParams.set('start_date', options.startDate)
    url.searchParams.set('end_date', options.endDate)
  } else {
    url.searchParams.set('current', 'precipitation,rain')
    url.searchParams.set('forecast_days', '2')
  }

  let locations: OpenMeteoLocation[]
  try {
    locations = await fetchLocations(url, options.signal)
  } catch (error) {
    if (!historical || (error as { name?: string }).name === 'AbortError') throw error
    const archive = new URL(ARCHIVE_URL)
    archive.searchParams.set('latitude', latitudes)
    archive.searchParams.set('longitude', longitudes)
    archive.searchParams.set('hourly', 'precipitation,rain')
    archive.searchParams.set('start_date', options.startDate ?? isoDate())
    archive.searchParams.set('end_date', options.endDate ?? isoDate())
    archive.searchParams.set('timezone', 'auto')
    locations = await fetchLocations(archive, options.signal)
  }

  const times = locations[0]?.hourly?.time ?? []
  const currentTime = locations[0]?.current?.time ?? times[times.length - 1] ?? times[0] ?? ''

  const samples = locations.map((location, index) => {
    const fallback = points[index]
    const hourlyPrecip = location.hourly?.precipitation ?? []
    const hourlyRain = location.hourly?.rain ?? []
    const hourly = times.map((_, hour) => rainValue(hourlyPrecip[hour], hourlyRain[hour]))
    return {
      lat: location.latitude ?? fallback?.lat ?? 0,
      lng: location.longitude ?? fallback?.lng ?? 0,
      current: rainValue(location.current?.precipitation, location.current?.rain),
      hourly,
    }
  })

  return {
    samples,
    times,
    currentTime,
    fetchedAt: new Date().toISOString(),
  }
}

export async function fetchDailyRain(
  points: { lat: number; lng: number }[],
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<DailyRainSeries> {
  if (!points.length) return { dates: [], points: [] }
  const { latitudes, longitudes } = coordinateParams(points)
  const url = new URL(HISTORY_URL)
  url.searchParams.set('latitude', latitudes)
  url.searchParams.set('longitude', longitudes)
  url.searchParams.set('daily', 'precipitation_sum')
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)
  url.searchParams.set('timezone', 'auto')

  let locations: OpenMeteoLocation[]
  try {
    locations = await fetchLocations(url, signal)
  } catch (error) {
    if ((error as { name?: string }).name === 'AbortError') throw error
    const archive = new URL(ARCHIVE_URL)
    archive.searchParams.set('latitude', latitudes)
    archive.searchParams.set('longitude', longitudes)
    archive.searchParams.set('daily', 'precipitation_sum')
    archive.searchParams.set('start_date', startDate)
    archive.searchParams.set('end_date', endDate)
    archive.searchParams.set('timezone', 'auto')
    locations = await fetchLocations(archive, signal)
  }

  const dates = locations[0]?.daily?.time ?? []
  return {
    dates,
    points: locations.map((location, index) => {
      const fallback = points[index]
      return {
        lat: location.latitude ?? fallback?.lat ?? 0,
        lng: location.longitude ?? fallback?.lng ?? 0,
        daily: dates.map((_, day) => {
          const value = location.daily?.precipitation_sum?.[day]
          return Number.isFinite(value) ? Math.max(0, value ?? 0) : 0
        }),
      }
    }),
  }
}

export function buildAreaReport(
  series: DailyRainSeries,
  bounds: LatLngBoundsBox,
  startDate: string,
  endDate: string,
): AreaRainReport {
  const { dates, points } = series
  const dailyMean = dates.map((_, day) => {
    if (!points.length) return 0
    const total = points.reduce((sum, point) => sum + (point.daily[day] ?? 0), 0)
    return total / points.length
  })
  const dailyMax = dates.map((_, day) =>
    points.reduce((max, point) => Math.max(max, point.daily[day] ?? 0), 0),
  )
  const cumulative: number[] = []
  dailyMean.forEach((value, index) => {
    cumulative.push((cumulative[index - 1] ?? 0) + value)
  })
  const totalMean = dailyMean.reduce((sum, value) => sum + value, 0)
  let maxIndex = 0
  let minIndex = 0
  dailyMean.forEach((value, index) => {
    if (value > (dailyMean[maxIndex] ?? 0)) maxIndex = index
    if (value < (dailyMean[minIndex] ?? 0)) minIndex = index
  })
  return {
    startDate,
    endDate,
    bounds,
    dates,
    dailyMean,
    dailyMax,
    cumulative,
    meanDaily: dates.length ? totalMean / dates.length : 0,
    totalMean,
    maxDay: { date: dates[maxIndex] ?? startDate, mm: dailyMean[maxIndex] ?? 0 },
    minDay: { date: dates[minIndex] ?? startDate, mm: dailyMean[minIndex] ?? 0 },
    pointCount: points.length,
    areaKm2: bboxAreaKm2(bounds),
  }
}

export function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function sampleValue(sample: RainSample, hourIndex: number) {
  if (hourIndex < 0) return sample.current
  return sample.hourly[hourIndex] ?? sample.current
}

export function rainStats(samples: RainSample[], hourIndex: number) {
  const values = samples.map((sample) => sampleValue(sample, hourIndex))
  if (!values.length) return { min: 0, max: 0, mean: 0, wet: 0 }
  const total = values.reduce((sum, value) => sum + value, 0)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: total / values.length,
    wet: values.filter((value) => value > 0.05).length,
  }
}

export function wettestHourIndex(samples: RainSample[], times: string[], currentTime: string) {
  if (!times.length) return -1
  let bestIndex = times.findIndex((time) => time === currentTime)
  let bestValue = -1
  times.forEach((_, index) => {
    const total = samples.reduce((sum, sample) => sum + (sample.hourly[index] ?? 0), 0)
    if (total > bestValue) {
      bestValue = total
      bestIndex = index
    }
  })
  if (bestValue <= 0.05) return times.findIndex((time) => time === currentTime)
  return bestIndex
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function rainRgba(mm: number): [number, number, number, number] {
  if (mm <= 0.05) return [0, 0, 0, 0]
  const stops = RAIN_STOPS
  const last = stops[stops.length - 1]
  const first = stops[1] ?? last
  if (!last || !first) return [0, 0, 0, 0]
  if (mm >= last.mm) return [...last.color, 210]
  for (let index = 0; index < stops.length - 1; index += 1) {
    const start = stops[index]
    const end = stops[index + 1]
    if (!start || !end) continue
    if (mm >= start.mm && mm <= end.mm) {
      const t = (mm - start.mm) / Math.max(end.mm - start.mm, 0.0001)
      return [
        Math.round(lerp(start.color[0], end.color[0], t)),
        Math.round(lerp(start.color[1], end.color[1], t)),
        Math.round(lerp(start.color[2], end.color[2], t)),
        Math.round(lerp(40, 210, Math.min(1, mm / 8))),
      ]
    }
  }
  return [...first.color, 80]
}

function nearest(samples: RainSample[], lat: number, lng: number, k: number) {
  const ranked = samples.map((sample) => {
    const dLat = lat - sample.lat
    const dLng = (lng - sample.lng) * Math.cos((lat * Math.PI) / 180)
    return { sample, dist: dLat * dLat + dLng * dLng }
  })
  ranked.sort((a, b) => a.dist - b.dist)
  return ranked.slice(0, Math.min(k, ranked.length))
}

export function interpolateField(
  samples: RainSample[],
  hourIndex: number,
  bounds: LatLngBoundsBox,
  width = 180,
  height = 180,
  power = 2,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context || !samples.length) return canvas
  const image = context.createImageData(width, height)
  const west = Math.min(bounds.west, bounds.east)
  const east = Math.max(bounds.west, bounds.east)
  const south = Math.min(bounds.south, bounds.north)
  const north = Math.max(bounds.south, bounds.north)

  for (let y = 0; y < height; y += 1) {
    const lat = north - (y / Math.max(height - 1, 1)) * (north - south)
    for (let x = 0; x < width; x += 1) {
      const lng = west + (x / Math.max(width - 1, 1)) * (east - west)
      const neighbors = nearest(samples, lat, lng, 5)
      const first = neighbors[0]
      let mm = 0
      if (first && first.dist < 1e-12) {
        mm = sampleValue(first.sample, hourIndex)
      } else {
        let num = 0
        let den = 0
        for (const neighbor of neighbors) {
          const weight = 1 / Math.pow(neighbor.dist, power / 2)
          num += weight * sampleValue(neighbor.sample, hourIndex)
          den += weight
        }
        mm = den === 0 ? 0 : num / den
      }
      const [r, g, b, a] = rainRgba(mm)
      const offset = (y * width + x) * 4
      image.data[offset] = r
      image.data[offset + 1] = g
      image.data[offset + 2] = b
      image.data[offset + 3] = a
    }
  }
  context.putImageData(image, 0, 0)
  return canvas
}

export function formatHour(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.replace('T', ' ')
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(date)
}

export function formatMm(value: number) {
  return `${value.toFixed(1)} mm`
}
