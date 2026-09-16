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
  fillOpacity?: number
  weight?: number
  dashArray?: string
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

export function geometryToClipping(geometry: MapGeometry): Position[][][] {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
}

export function clippingToGeometry(coords: Position[][][]): MapGeometry | null {
  const polygons = coords
    .map((polygon) => polygon.map((ring) => closeRing(ring)).filter((ring) => ring.length >= 4))
    .filter((polygon) => polygon.length > 0)
  if (!polygons.length) return null
  const first = polygons[0]
  if (polygons.length === 1 && first) {
    return { type: 'Polygon', coordinates: first }
  }
  return { type: 'MultiPolygon', coordinates: polygons }
}

function ringToWkt(ring: Position[]): string {
  return `(${closeRing(ring).map(([lng, lat]) => `${lng} ${lat}`).join(',')})`
}

function polygonToWkt(coordinates: Position[][]): string {
  return `(${coordinates.map(ringToWkt).join(',')})`
}

export function geometryToWkt(geometry: MapGeometry): string {
  if (geometry.type === 'Polygon') return `POLYGON${polygonToWkt(geometry.coordinates)}`
  return `MULTIPOLYGON(${geometry.coordinates.map(polygonToWkt).join(',')})`
}

const EARTH_RADIUS_M = 6378137

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function ringAreaM2(ring: Position[]): number {
  if (ring.length < 4) return 0
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i]
    const b = ring[i + 1]
    if (!a || !b) continue
    area += toRad(b[0] - a[0]) * (2 + Math.sin(toRad(a[1])) + Math.sin(toRad(b[1])))
  }
  return (area * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2
}

export function geometryAreaM2(geometry: MapGeometry): number {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  let total = 0
  for (const polygon of polygons) {
    const [outer, ...holes] = polygon
    if (!outer) continue
    total += Math.abs(ringAreaM2(outer))
    for (const hole of holes) total -= Math.abs(ringAreaM2(hole))
  }
  return Math.max(0, total)
}

export function formatArea(m2: number): string {
  if (!Number.isFinite(m2) || m2 <= 0) return '0 m²'
  if (m2 >= 1_000_000) return `${(m2 / 1_000_000).toFixed(3)} km²`
  if (m2 >= 10_000) return `${(m2 / 10_000).toFixed(2)} ha`
  if (m2 >= 100) return `${Math.round(m2)} m²`
  return `${m2.toFixed(1)} m²`
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

export type ImportedGeometry = { name: string; color: string; geometry: MapGeometry }

const WKT_HEAD = /^(?:SRID=\d+\s*;\s*)?(GEOMETRYCOLLECTION|(?:MULTI)?POLYGON)(?:\s*(?:ZM|Z|M))?\b/i

export function looksLikeWkt(text: string): boolean {
  return WKT_HEAD.test(unwrapImportedText(text))
}

function unwrapImportedText(text: string): string {
  let value = text.trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }
  return value
}

export function parseImportedGeometries(text: string): ImportedGeometry[] {
  const trimmed = unwrapImportedText(text)
  if (!trimmed) {
    throw new Error('Cole um GeoJSON ou um WKT (POLYGON / MULTIPOLYGON).')
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseGeoJson(trimmed)
  }

  if (looksLikeWkt(trimmed)) {
    return parseWkt(trimmed)
  }

  try {
    return parseGeoJson(trimmed)
  } catch {
    try {
      return parseWkt(trimmed)
    } catch {
      throw new Error('Cole um GeoJSON (Feature/Polygon) ou um WKT (POLYGON/MULTIPOLYGON).')
    }
  }
}

export function parseWkt(text: string): ImportedGeometry[] {
  const input = unwrapImportedText(text)
  const cursor = { at: 0, input }
  const collected: ImportedGeometry[] = []

  const push = (geometry: MapGeometry | null) => {
    if (!geometry) return
    collected.push({
      name: geometry.type === 'MultiPolygon'
        ? `Multipolígono ${collected.length + 1}`
        : `Polígono ${collected.length + 1}`,
      color: nextColor(collected.length),
      geometry,
    })
  }

  while (cursor.at < input.length) {
    skipWktSpace(cursor)
    if (cursor.at >= input.length) break
    if (input[cursor.at] === ';') {
      cursor.at += 1
      continue
    }
    for (const geometry of parseWktValue(cursor)) push(geometry)
  }

  if (!collected.length) {
    throw new Error('Nenhum POLYGON ou MULTIPOLYGON encontrado no WKT.')
  }

  return collected
}

export function parseWktGeometry(text: string): MapGeometry {
  const parsed = parseImportedGeometries(text)
  if (parsed.length === 1 && parsed[0]) return parsed[0].geometry
  return mergeGeometries(parsed.map((item) => item.geometry))
}

function parseWktValue(cursor: { at: number; input: string }): MapGeometry[] {
  skipWktSpace(cursor)
  const srid = cursor.input.slice(cursor.at).match(/^SRID=\d+\s*;\s*/i)
  if (srid) cursor.at += srid[0].length

  skipWktSpace(cursor)
  const head = cursor.input.slice(cursor.at).match(/^(GEOMETRYCOLLECTION|(?:MULTI)?POLYGON)(?:\s*(?:ZM|Z|M))?\b/i)
  if (!head) {
    throw new Error('WKT inválido. Use POLYGON, MULTIPOLYGON ou GEOMETRYCOLLECTION.')
  }

  cursor.at += head[0].length
  const type = head[1]?.toUpperCase() ?? ''
  skipWktSpace(cursor)

  if (matchWktKeyword(cursor, 'EMPTY')) {
    throw new Error('Geometria WKT vazia.')
  }

  if (type === 'GEOMETRYCOLLECTION') {
    return parseWktCollection(cursor)
  }

  expectWktChar(cursor, '(')
  if (type === 'MULTIPOLYGON') {
    const geometry = asMultiPolygon(parseWktPolygonList(cursor))
    expectWktChar(cursor, ')')
    if (!geometry) throw new Error('MULTIPOLYGON WKT inválido.')
    return [geometry]
  }

  const geometry = asPolygon(parseWktRingList(cursor))
  expectWktChar(cursor, ')')
  if (!geometry) throw new Error('POLYGON WKT inválido. Informe pelo menos 3 pontos no anel.')
  return [geometry]
}

function parseWktCollection(cursor: { at: number; input: string }): MapGeometry[] {
  expectWktChar(cursor, '(')
  const geometries: MapGeometry[] = []
  while (true) {
    skipWktSpace(cursor)
    if (peekWkt(cursor) === ')') break
    if (geometries.length) expectWktChar(cursor, ',')
    geometries.push(...parseWktValue(cursor))
  }
  expectWktChar(cursor, ')')
  if (!geometries.length) throw new Error('GEOMETRYCOLLECTION sem polígonos.')
  return geometries
}

function parseWktPolygonList(cursor: { at: number; input: string }): Position[][][] {
  const polygons: Position[][][] = []
  while (true) {
    skipWktSpace(cursor)
    if (peekWkt(cursor) === ')') break
    if (polygons.length) expectWktChar(cursor, ',')
    expectWktChar(cursor, '(')
    polygons.push(parseWktRingList(cursor))
    expectWktChar(cursor, ')')
  }
  return polygons
}

function parseWktRingList(cursor: { at: number; input: string }): Position[][] {
  const rings: Position[][] = []
  while (true) {
    skipWktSpace(cursor)
    if (peekWkt(cursor) === ')') break
    if (rings.length) expectWktChar(cursor, ',')
    rings.push(parseWktRing(cursor))
  }
  return rings
}

function parseWktRing(cursor: { at: number; input: string }): Position[] {
  expectWktChar(cursor, '(')
  const points: Position[] = []
  while (true) {
    skipWktSpace(cursor)
    if (peekWkt(cursor) === ')') break
    if (points.length) expectWktChar(cursor, ',')
    points.push(parseWktPosition(cursor))
  }
  expectWktChar(cursor, ')')
  if (points.length < 3) {
    throw new Error('Anel WKT precisa de pelo menos 3 coordenadas.')
  }
  return closeRing(points)
}

function parseWktPosition(cursor: { at: number; input: string }): Position {
  const lng = parseWktNumber(cursor)
  const lat = parseWktNumber(cursor)
  while (isWktNumberStart(cursor)) parseWktNumber(cursor)
  const point = { lat, lng }
  if (!isValidLatLng(point)) {
    throw new Error(`Coordenada WKT inválida: ${lng} ${lat}. Use longitude latitude.`)
  }
  return [lng, lat]
}

function parseWktNumber(cursor: { at: number; input: string }): number {
  skipWktSpace(cursor)
  const match = cursor.input.slice(cursor.at).match(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/)
  if (!match) throw new Error('Número esperado no WKT.')
  cursor.at += match[0].length
  const value = Number(match[0])
  if (!Number.isFinite(value)) throw new Error(`Número WKT inválido: ${match[0]}`)
  return value
}

function isWktNumberStart(cursor: { at: number; input: string }): boolean {
  skipWktSpace(cursor)
  const ch = peekWkt(cursor)
  return ch === '+' || ch === '-' || ch === '.' || (ch >= '0' && ch <= '9')
}

function matchWktKeyword(cursor: { at: number; input: string }, keyword: string): boolean {
  skipWktSpace(cursor)
  const slice = cursor.input.slice(cursor.at, cursor.at + keyword.length)
  if (slice.toUpperCase() !== keyword.toUpperCase()) return false
  const next = cursor.input[cursor.at + keyword.length]
  if (next && /[A-Za-z0-9_]/i.test(next)) return false
  cursor.at += keyword.length
  return true
}

function expectWktChar(cursor: { at: number; input: string }, char: string) {
  skipWktSpace(cursor)
  if (cursor.input[cursor.at] !== char) {
    throw new Error(`WKT inválido: esperado "${char}".`)
  }
  cursor.at += 1
}

function peekWkt(cursor: { at: number; input: string }): string {
  skipWktSpace(cursor)
  return cursor.input[cursor.at] ?? ''
}

function skipWktSpace(cursor: { at: number; input: string }) {
  while (cursor.at < cursor.input.length && /\s/.test(cursor.input[cursor.at] ?? '')) {
    cursor.at += 1
  }
}
