<template>
  <div ref="root" class="map-root" :class="{ drawing }"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngPoint, MapFeature, MapGeometry } from '../../lib/geo'

const props = withDefaults(
  defineProps<{
    features: MapFeature[]
    selectedId?: string | null
    drawing?: boolean
    drawColor?: string
    vertices?: LatLngPoint[]
    parts?: LatLngPoint[][]
  }>(),
  {
    selectedId: null,
    drawing: false,
    drawColor: '#818cf8',
    vertices: () => [],
    parts: () => [],
  },
)

const emit = defineEmits<{
  'map-click': [point: LatLngPoint]
  'close-ring': []
  'feature-click': [id: string]
}>()

const root = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let featuresLayer: L.LayerGroup | null = null
let draftLayer: L.LayerGroup | null = null
let hoverPoint: LatLngPoint | null = null
let resizeObserver: ResizeObserver | null = null

function point(latlng: L.LatLng): LatLngPoint {
  return { lat: latlng.lat, lng: latlng.lng }
}

function asGeoJson(geometry: MapGeometry) {
  return geometry as Parameters<typeof L.geoJSON>[0]
}

function renderFeatures() {
  if (!featuresLayer) return
  featuresLayer.clearLayers()
  for (const feature of props.features) {
    if (!feature.visible) continue
    const selected = feature.id === props.selectedId
    const layer = L.geoJSON(asGeoJson(feature.geometry), {
      style: {
        color: feature.color,
        fillColor: feature.color,
        weight: feature.weight ?? (selected ? 3.5 : 2),
        fillOpacity: feature.fillOpacity ?? (selected ? 0.38 : 0.26),
        dashArray: feature.dashArray,
      },
    })
    layer.on('click', (event) => {
      L.DomEvent.stopPropagation(event)
      emit('feature-click', feature.id)
    })
    layer.bindTooltip(feature.name)
    layer.addTo(featuresLayer)
  }
}

function renderDraft() {
  if (!draftLayer) return
  draftLayer.clearLayers()
  const color = props.drawColor

  for (const part of props.parts) {
    if (part.length < 3) continue
    L.polygon(
      part.map((item) => [item.lat, item.lng]),
      { color, fillColor: color, weight: 2, fillOpacity: 0.18, dashArray: '6 4' },
    ).addTo(draftLayer)
  }

  const line = [...props.vertices]
  if (hoverPoint && props.drawing) line.push(hoverPoint)
  if (line.length) {
    L.polyline(
      line.map((item) => [item.lat, item.lng]),
      { color, weight: 2.5 },
    ).addTo(draftLayer)
  }
  if (line.length >= 3) {
    L.polygon(
      line.map((item) => [item.lat, item.lng]),
      { color, fillColor: color, weight: 0, fillOpacity: 0.16 },
    ).addTo(draftLayer)
  }

  props.vertices.forEach((vertex, index) => {
    L.circleMarker([vertex.lat, vertex.lng], {
      radius: index === 0 ? 8 : 5,
      color: '#fff',
      weight: 2,
      fillColor: index === 0 ? '#22d3ee' : color,
      fillOpacity: 1,
    }).addTo(draftLayer)
  })
}

function isNearFirst(latlng: L.LatLng) {
  if (!map || props.vertices.length < 3) return false
  const first = props.vertices[0]
  if (!first) return false
  const a = map.latLngToContainerPoint(latlng)
  const b = map.latLngToContainerPoint(L.latLng(first.lat, first.lng))
  return a.distanceTo(b) <= 14
}

function fitGeometry(geometry: MapGeometry) {
  if (!map) return
  const layer = L.geoJSON(asGeoJson(geometry))
  const bounds = layer.getBounds()
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.25))
}

function fitAll() {
  if (!map) return
  const visible = props.features.filter((item) => item.visible)
  if (!visible.length) {
    map.setView([-30.0346, -51.2177], 13)
    return
  }
  const layer = L.geoJSON({
    type: 'FeatureCollection',
    features: visible.map((item) => ({
      type: 'Feature',
      properties: {},
      geometry: item.geometry,
    })),
  } as GeoJSON.FeatureCollection)
  const bounds = layer.getBounds()
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.18))
}

onMounted(() => {
  if (!root.value) return
  map = L.map(root.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView([-30.0346, -51.2177], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)

  featuresLayer = L.layerGroup().addTo(map)
  draftLayer = L.layerGroup().addTo(map)

  map.on('click', (event: L.LeafletMouseEvent) => {
    if (!props.drawing) return
    if (isNearFirst(event.latlng)) {
      emit('close-ring')
      return
    }
    emit('map-click', point(event.latlng))
  })

  map.on('dblclick', (event: L.LeafletMouseEvent) => {
    if (!props.drawing) return
    L.DomEvent.stop(event)
    emit('close-ring')
  })

  map.on('mousemove', (event: L.LeafletMouseEvent) => {
    if (!props.drawing) return
    hoverPoint = point(event.latlng)
    renderDraft()
  })

  renderFeatures()
  resizeObserver = new ResizeObserver(() => {
    map?.invalidateSize()
  })
  resizeObserver.observe(root.value)
  window.setTimeout(() => map?.invalidateSize(), 80)
})

watch(
  () => [props.features, props.selectedId],
  () => renderFeatures(),
  { deep: true },
)

watch(
  () => [props.vertices, props.parts, props.drawColor, props.drawing],
  () => {
    if (map) {
      map.doubleClickZoom[props.drawing ? 'disable' : 'enable']()
      map.getContainer().style.cursor = props.drawing ? 'crosshair' : ''
    }
    if (!props.drawing) hoverPoint = null
    renderDraft()
  },
  { deep: true },
)

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  map?.remove()
  map = null
  featuresLayer = null
  draftLayer = null
})

function invalidate() {
  map?.invalidateSize()
}

defineExpose({ fitGeometry, fitAll, invalidate })
</script>

<style scoped>
.map-root {
  isolation: isolate;
  width: 100%;
  height: 100%;
  min-height: 480px;
  border-radius: var(--ds-radius-lg);
  overflow: hidden;
  border: 1px solid var(--ds-border);
}

.map-root.drawing {
  box-shadow: inset 0 0 0 2px var(--ds-accent);
}

:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font-family: var(--ds-font);
  background: #070b18;
}

:deep(.leaflet-tile-pane) {
  filter: invert(0.92) hue-rotate(180deg) saturate(0.55) brightness(0.9);
}

:deep(.leaflet-control-attribution) {
  background: rgba(7, 11, 24, 0.8);
  color: var(--ds-text-muted);
}

:deep(.leaflet-control-zoom a) {
  background: #12182f;
  color: var(--ds-text);
  border-color: var(--ds-border);
}

:deep(.leaflet-tooltip) {
  background: #0b1024;
  color: #fff;
  border: 0;
  border-radius: 8px;
}
</style>
