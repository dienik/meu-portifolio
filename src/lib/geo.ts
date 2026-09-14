export type Position = [number, number]

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Position[][]
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: Position[][][]
}

export type MapGeometry = PolygonGeometry | MultiPolygonGeometry

export interface MapFeature {
  id: string
  name: string
  color: string
  visible: boolean
  geometry: MapGeometry
  createdAt: string
}

export const PALETTE = ['#818cf8', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#e879f9']

export interface LatLngPoint {
  lat: number
  lng: number
}

export function closeRing(ring: Position[]): Position[] {
  if (ring.length < 1) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (!first || !last) return ring
  if (first[0] === last[0] && first[1] === last[1]) return ring
  return [...ring, [first[0], first[1]]]
}

export function ringFromLatLngs(points: LatLngPoint[]): Position[] {
  return closeRing(points.map((point) => [point.lng, point.lat]))
}

export function polygonFromLatLngs(points: LatLngPoint[]): PolygonGeometry {
  return {
    type: 'Polygon',
    coordinates: [ringFromLatLngs(points)],
  }
}

export function multiPolygonFromParts(parts: LatLngPoint[][]): MultiPolygonGeometry {
  return {
    type: 'MultiPolygon',
    coordinates: parts.map((part) => [ringFromLatLngs(part)]),
  }
}

export function nextColor(index: number) {
  return PALETTE[index % PALETTE.length] ?? PALETTE[0]
}

export type CoordOrder = 'latlng' | 'lnglat'

export function parseCoordNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function formatCoord(value: number) {
  return String(Number(value.toFixed(6)))
}

export function isValidLatLng(point: LatLngPoint) {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  )
}

function toPoint(first: number, second: number, order: CoordOrder): LatLngPoint {
  return order === 'latlng'
    ? { lat: first, lng: second }
    : { lat: second, lng: first }
}

function pairsFromUnknown(value: unknown, order: CoordOrder): LatLngPoint[] {
  if (!Array.isArray(value) || !value.length) return []

  const first = value[0]
  if (typeof first === 'number') {
    const points: LatLngPoint[] = []
    for (let index = 0; index + 1 < value.length; index += 2) {
      const a = value[index]
      const b = value[index + 1]
      if (typeof a !== 'number' || typeof b !== 'number') continue
      const point = toPoint(a, b, order)
      if (isValidLatLng(point)) points.push(point)
    }
    return points
  }

  if (Array.isArray(first) && typeof first[0] === 'number') {
    return value.flatMap((item) => pairsFromUnknown(item, order))
  }

  if (Array.isArray(first) && Array.isArray(first[0])) {
    return value.flatMap((item) => pairsFromUnknown(item, order))
  }

  return []
}

export function parseCoordinateList(text: string, order: CoordOrder): LatLngPoint[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed) as unknown
    const fromJson = pairsFromUnknown(parsed, order)
    if (fromJson.length) return fromJson
  } catch {
    // lista livre, não JSON
  }

  const points: LatLngPoint[] = []
  const chunks = trimmed.split(/[\n;]+/)
  for (const chunk of chunks) {
    const numbers = chunk.match(/-?\d+(?:[.,]\d+)?/g)
    if (!numbers || numbers.length < 2) continue
    for (let index = 0; index + 1 < numbers.length; index += 2) {
      const first = parseCoordNumber(numbers[index] ?? '')
      const second = parseCoordNumber(numbers[index + 1] ?? '')
      if (first === null || second === null) continue
      const point = toPoint(first, second, order)
      if (isValidLatLng(point)) points.push(point)
    }
  }
  return points
}

export function openRing(ring: Position[]): LatLngPoint[] {
  const points = ring.map(([lng, lat]) => ({ lat, lng }))
  if (points.length >= 2) {
    const first = points[0]
    const last = points[points.length - 1]
    if (first && last && first.lat === last.lat && first.lng === last.lng) {
      return points.slice(0, -1)
    }
  }
  return points
}

export function geometryToParts(geometry: MapGeometry): LatLngPoint[][] {
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0]
    return [openRing(ring ?? [])]
  }
  return geometry.coordinates.map((polygon) => openRing(polygon[0] ?? []))
}

export function validateParts(parts: LatLngPoint[][], kind: 'Polygon' | 'MultiPolygon'): string | null {
  const filled = parts.filter((part) => part.length > 0)
  if (kind === 'Polygon') {
    if (filled.length !== 1 || (filled[0]?.length ?? 0) < 3) {
      return 'Um polígono precisa de pelo menos 3 coordenadas válidas.'
    }
  } else if (filled.length < 2 || filled.some((part) => part.length < 3)) {
    return 'Um multipolígono precisa de pelo menos duas partes, cada uma com 3 coordenadas.'
  }

  for (const part of filled) {
    if (part.some((point) => !isValidLatLng(point))) {
      return 'Há latitude ou longitude fora do intervalo válido.'
    }
  }
  return null
}

export function mergeGeometries(geometries: MapGeometry[]): MultiPolygonGeometry {
  const coordinates: Position[][][] = []
  for (const geometry of geometries) {
    if (geometry.type === 'Polygon') coordinates.push(geometry.coordinates)
    else coordinates.push(...geometry.coordinates)
  }
  return { type: 'MultiPolygon', coordinates }
}

export function toFeatureCollection(features: MapFeature[]) {
  return {
    type: 'FeatureCollection',
    features: features.map((feature) => ({
      type: 'Feature',
      id: feature.id,
      properties: {
        name: feature.name,
        color: feature.color,
        visible: feature.visible,
      },
      geometry: feature.geometry,
    })),
  }
}

function isNumberPair(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

function isRing(value: unknown): value is Position[] {
  return Array.isArray(value) && value.length >= 4 && value.every(isNumberPair)
}

function asPolygon(coordinates: unknown): PolygonGeometry | null {
  if (!Array.isArray(coordinates) || !coordinates.length || !isRing(coordinates[0])) return null
  return {
    type: 'Polygon',
    coordinates: coordinates.filter(isRing).map((ring) => closeRing(ring)),
  }
}

function asMultiPolygon(coordinates: unknown): MultiPolygonGeometry | null {
  if (!Array.isArray(coordinates) || !coordinates.length) return null
  const polygons = coordinates
    .map((polygon) => asPolygon(polygon)?.coordinates)
    .filter((polygon): polygon is Position[][] => Boolean(polygon))
  if (!polygons.length) return null
  return { type: 'MultiPolygon', coordinates: polygons }
}

function geometryFromUnknown(value: unknown): MapGeometry | null {
  if (!value || typeof value !== 'object') return null
  const geometry = value as { type?: string; coordinates?: unknown }
  if (geometry.type === 'Polygon') return asPolygon(geometry.coordinates)
  if (geometry.type === 'MultiPolygon') return asMultiPolygon(geometry.coordinates)
  return null
}

function nameFrom(properties: unknown, fallback: string) {
  if (!properties || typeof properties !== 'object') return fallback
  const record = properties as Record<string, unknown>
  if (typeof record.name === 'string' && record.name.trim()) return record.name.trim()
  if (typeof record.nome === 'string' && record.nome.trim()) return record.nome.trim()
  return fallback
}

function colorFrom(properties: unknown, index: number) {
  if (properties && typeof properties === 'object') {
    const color = (properties as Record<string, unknown>).color
    if (typeof color === 'string' && color.startsWith('#')) return color
  }
  return nextColor(index)
}

export function parseGeoJson(text: string): { name: string; color: string; geometry: MapGeometry }[] {
  const parsed = JSON.parse(text) as unknown
  const collected: { name: string; color: string; geometry: MapGeometry }[] = []

  const push = (geometry: MapGeometry | null, properties: unknown) => {
    if (!geometry) return
    collected.push({
      name: nameFrom(properties, `Geometria ${collected.length + 1}`),
      color: colorFrom(properties, collected.length),
      geometry,
    })
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('JSON inválido.')
  }

  const root = parsed as { type?: string; features?: unknown; geometry?: unknown; properties?: unknown }

  if (root.type === 'FeatureCollection' && Array.isArray(root.features)) {
    for (const item of root.features) {
      if (!item || typeof item !== 'object') continue
      const feature = item as { geometry?: unknown; properties?: unknown }
      push(geometryFromUnknown(feature.geometry), feature.properties)
    }
  } else if (root.type === 'Feature') {
    push(geometryFromUnknown(root.geometry), root.properties)
  } else {
    push(geometryFromUnknown(parsed), null)
  }

  if (!collected.length) {
    throw new Error('Nenhum Polygon ou MultiPolygon encontrado no GeoJSON.')
  }

  return collected
}
