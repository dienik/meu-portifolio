import polygonClipping from 'polygon-clipping'
import {
  clippingToGeometry,
  geometryAreaM2,
  geometryToClipping,
  geometryToWkt,
  parseWktGeometry,
  type MapGeometry,
  type Position,
} from './geo'

const REL_EPS = 0.001
const ABS_EPS = 1

export type SpatialRelation = 'iguais' | 'a-contem-b' | 'b-contem-a' | 'sobrepostos' | 'disjuntos'

export interface PolygonCompareResult {
  areaA: number
  areaB: number
  intersectionArea: number
  differenceAB: number
  differenceBA: number
  unionArea: number
  xorArea: number
  overlapA: number
  overlapB: number
  jaccard: number
  equals: boolean
  intersects: boolean
  disjoint: boolean
  aContainsB: boolean
  bContainsA: boolean
  relation: SpatialRelation
  relationLabel: string
  intersection: MapGeometry | null
  onlyA: MapGeometry | null
  onlyB: MapGeometry | null
  union: MapGeometry | null
  xor: MapGeometry | null
  wktIntersection: string
  wktOnlyA: string
  wktOnlyB: string
  wktUnion: string
}

function clip(
  operate: () => Position[][][],
): MapGeometry | null {
  try {
    return clippingToGeometry(operate())
  } catch {
    throw new Error('Não foi possível recortar as geometrias. Verifique se os polígonos são válidos.')
  }
}

function almostEmpty(part: number, whole: number) {
  if (whole <= ABS_EPS) return part <= ABS_EPS
  return part / whole <= REL_EPS || part <= ABS_EPS
}

export function compareGeometries(a: MapGeometry, b: MapGeometry): PolygonCompareResult {
  const geomA = geometryToClipping(a)
  const geomB = geometryToClipping(b)

  const intersection = clip(() => polygonClipping.intersection(geomA, geomB) as Position[][][])
  const onlyA = clip(() => polygonClipping.difference(geomA, geomB) as Position[][][])
  const onlyB = clip(() => polygonClipping.difference(geomB, geomA) as Position[][][])
  const union = clip(() => polygonClipping.union(geomA, geomB) as Position[][][])
  const xor = clip(() => polygonClipping.xor(geomA, geomB) as Position[][][])

  const areaA = geometryAreaM2(a)
  const areaB = geometryAreaM2(b)
  const intersectionArea = intersection ? geometryAreaM2(intersection) : 0
  const differenceAB = onlyA ? geometryAreaM2(onlyA) : 0
  const differenceBA = onlyB ? geometryAreaM2(onlyB) : 0
  const unionArea = union ? geometryAreaM2(union) : 0
  const xorArea = xor ? geometryAreaM2(xor) : 0

  const intersects = intersectionArea > ABS_EPS
  const aContainsB = intersects && almostEmpty(differenceBA, areaB)
  const bContainsA = intersects && almostEmpty(differenceAB, areaA)
  const equals = almostEmpty(xorArea, Math.max(unionArea, areaA, areaB))

  let relation: SpatialRelation = 'disjuntos'
  let relationLabel = 'Disjuntos'
  if (equals) {
    relation = 'iguais'
    relationLabel = 'Iguais'
  } else if (aContainsB) {
    relation = 'a-contem-b'
    relationLabel = 'A contém B'
  } else if (bContainsA) {
    relation = 'b-contem-a'
    relationLabel = 'B contém A'
  } else if (intersects) {
    relation = 'sobrepostos'
    relationLabel = 'Sobrepostos'
  }

  return {
    areaA,
    areaB,
    intersectionArea,
    differenceAB,
    differenceBA,
    unionArea,
    xorArea,
    overlapA: areaA > 0 ? intersectionArea / areaA : 0,
    overlapB: areaB > 0 ? intersectionArea / areaB : 0,
    jaccard: unionArea > 0 ? intersectionArea / unionArea : 0,
    equals,
    intersects,
    disjoint: !intersects,
    aContainsB,
    bContainsA,
    relation,
    relationLabel,
    intersection,
    onlyA,
    onlyB,
    union,
    xor,
    wktIntersection: intersection ? geometryToWkt(intersection) : '',
    wktOnlyA: onlyA ? geometryToWkt(onlyA) : '',
    wktOnlyB: onlyB ? geometryToWkt(onlyB) : '',
    wktUnion: union ? geometryToWkt(union) : '',
  }
}

export function compareWkt(textA: string, textB: string): PolygonCompareResult {
  return compareGeometries(parseWktGeometry(textA), parseWktGeometry(textB))
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}
