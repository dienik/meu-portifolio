import { ref, watch } from 'vue'
import {
  parseGeoJson,
  toFeatureCollection,
  type MapFeature,
  type MapGeometry,
} from '../lib/geo'

const STORAGE_KEY = 'meu-portfolio:map-features'

const seed: MapFeature[] = [
  {
    id: 'poly-redenção',
    name: 'Parque Farroupilha',
    color: '#34d399',
    visible: true,
    createdAt: '2026-06-01T10:00:00.000Z',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-51.2178, -30.0362],
        [-51.2105, -30.0358],
        [-51.2098, -30.0418],
        [-51.2186, -30.0426],
        [-51.2178, -30.0362],
      ]],
    },
  },
  {
    id: 'multi-ilhas',
    name: 'Ilhas do Guaíba',
    color: '#22d3ee',
    visible: true,
    createdAt: '2026-06-02T10:00:00.000Z',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [[
          [-51.2412, -30.0458],
          [-51.2364, -30.0449],
          [-51.2358, -30.0486],
          [-51.2407, -30.0494],
          [-51.2412, -30.0458],
        ]],
        [[
          [-51.2488, -30.0521],
          [-51.2441, -30.0514],
          [-51.2436, -30.0552],
          [-51.2484, -30.0558],
          [-51.2488, -30.0521],
        ]],
      ],
    },
  },
]

function load(): MapFeature[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as MapFeature[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore invalid storage
  }
  return seed.map((item) => ({
    ...item,
    geometry: structuredClone(item.geometry),
  }))
}

export const mapFeatures = ref<MapFeature[]>(load())

watch(
  mapFeatures,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)

export function addMapFeature(input: Omit<MapFeature, 'id' | 'createdAt'>) {
  const created: MapFeature = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  mapFeatures.value = [created, ...mapFeatures.value]
  return created
}

export function updateMapFeature(id: string, patch: Partial<Omit<MapFeature, 'id'>>) {
  mapFeatures.value = mapFeatures.value.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  )
}

export function removeMapFeature(id: string) {
  mapFeatures.value = mapFeatures.value.filter((item) => item.id !== id)
}

export function importMapFeatures(text: string) {
  const parsed = parseGeoJson(text)
  const created = parsed.map((item) => addMapFeature({
    name: item.name,
    color: item.color,
    visible: true,
    geometry: item.geometry,
  }))
  return created
}

export function exportMapFeatures() {
  return JSON.stringify(toFeatureCollection(mapFeatures.value), null, 2)
}

export function replaceGeometry(id: string, geometry: MapGeometry) {
  updateMapFeature(id, { geometry })
}
