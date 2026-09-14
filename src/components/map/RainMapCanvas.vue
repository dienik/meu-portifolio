<template>
  <div class="map-wrap" :class="{ loading, selecting }">
    <div ref="root" class="map-surface"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  interpolateField,
  sampleValue,
  type LatLngBoundsBox,
  type RainSample,
} from '../../lib/rain'

const props = withDefaults(
  defineProps<{
    samples: RainSample[]
    hourIndex?: number
    showPoints?: boolean
    loading?: boolean
    selecting?: boolean
    area?: LatLngBoundsBox | null
  }>(),
  {
    hourIndex: -1,
    showPoints: true,
    loading: false,
    selecting: false,
    area: null,
  },
)

const emit = defineEmits<{
  'bounds-change': [bounds: LatLngBoundsBox]
  'area-select': [bounds: LatLngBoundsBox]
}>()

const root = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let overlay: L.ImageOverlay | null = null
let pointsLayer: L.LayerGroup | null = null
let areaLayer: L.Rectangle | null = null
let draftRect: L.Rectangle | null = null
let dragStart: L.LatLng | null = null
let resizeObserver: ResizeObserver | null = null

function currentBounds(): LatLngBoundsBox {
  const bounds = map?.getBounds()
  if (!bounds) {
    return { north: -29.9, south: -30.16, west: -51.35, east: -51.05 }
  }
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    west: bounds.getWest(),
    east: bounds.getEast(),
  }
}

function paintOverlay() {
  if (!map) return
  const bounds = currentBounds()
  const canvas = interpolateField(props.samples, props.hourIndex, bounds)
  const url = canvas.toDataURL('image/png')
  const leafletBounds = L.latLngBounds(
    [bounds.south, bounds.west],
    [bounds.north, bounds.east],
  )
  if (overlay) {
    overlay.setUrl(url)
    overlay.setBounds(leafletBounds)
    return
  }
  overlay = L.imageOverlay(url, leafletBounds, {
    opacity: 0.78,
    interactive: false,
    className: 'rain-overlay',
  }).addTo(map)
}

function paintArea() {
  if (!map) return
  areaLayer?.remove()
  areaLayer = null
  if (!props.area) return
  areaLayer = L.rectangle(
    L.latLngBounds(
      [props.area.south, props.area.west],
      [props.area.north, props.area.east],
    ),
    { color: '#22d3ee', weight: 2, fillOpacity: 0.12, dashArray: '6 4' },
  ).addTo(map)
}

function setSelectingMode(enabled: boolean) {
  if (!map) return
  map.dragging[enabled ? 'disable' : 'enable']()
  map.boxZoom[enabled ? 'disable' : 'enable']()
  map.getContainer().style.cursor = enabled ? 'crosshair' : ''
}

function boundsFromCorners(a: L.LatLng, b: L.LatLng): LatLngBoundsBox {
  return {
    north: Math.max(a.lat, b.lat),
    south: Math.min(a.lat, b.lat),
    west: Math.min(a.lng, b.lng),
    east: Math.max(a.lng, b.lng),
  }
}

function paintPoints() {
  if (!pointsLayer) return
  pointsLayer.clearLayers()
  if (!props.showPoints) return
  for (const sample of props.samples) {
    const mm = sampleValue(sample, props.hourIndex)
    const marker = L.circleMarker([sample.lat, sample.lng], {
      radius: mm > 0.2 ? 7 : 5,
      color: '#eef2ff',
      weight: 1,
      fillColor: mm > 0.05 ? '#22d3ee' : '#64748b',
      fillOpacity: 0.95,
    })
    marker.bindTooltip(`${mm.toFixed(1)} mm<br>${sample.lat.toFixed(3)}, ${sample.lng.toFixed(3)}`)
    marker.addTo(pointsLayer)
  }
}

function onMouseDown(event: L.LeafletMouseEvent) {
  if (!props.selecting || !map) return
  L.DomEvent.preventDefault(event)
  dragStart = event.latlng
  draftRect?.remove()
  draftRect = L.rectangle(L.latLngBounds(dragStart, dragStart), {
    color: '#22d3ee',
    weight: 2,
    fillOpacity: 0.18,
  }).addTo(map)
}

function onMouseMove(event: L.LeafletMouseEvent) {
  if (!dragStart || !draftRect) return
  draftRect.setBounds(L.latLngBounds(dragStart, event.latlng))
}

function onMouseUp(event: L.LeafletMouseEvent) {
  if (!dragStart) return
  const area = boundsFromCorners(dragStart, event.latlng)
  dragStart = null
  draftRect?.remove()
  draftRect = null
  if (Math.abs(area.north - area.south) < 0.004 || Math.abs(area.east - area.west) < 0.004) return
  emit('area-select', area)
}

onMounted(() => {
  if (!root.value) return
  map = L.map(root.value, { zoomControl: true }).setView([-30.0346, -51.2177], 10)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap · chuva Open-Meteo',
  }).addTo(map)
  pointsLayer = L.layerGroup().addTo(map)

  map.on('moveend', () => {
    if (!props.selecting) emit('bounds-change', currentBounds())
  })
  map.on('mousedown', onMouseDown)
  map.on('mousemove', onMouseMove)
  map.on('mouseup', onMouseUp)
  resizeObserver = new ResizeObserver(() => map?.invalidateSize())
  resizeObserver.observe(root.value)
  window.setTimeout(() => {
    map?.invalidateSize()
    emit('bounds-change', currentBounds())
  }, 80)
})

watch(
  () => [props.samples, props.hourIndex, props.showPoints],
  () => {
    paintOverlay()
    paintPoints()
  },
  { deep: true },
)

watch(
  () => props.area,
  () => paintArea(),
)

watch(
  () => props.selecting,
  (enabled) => setSelectingMode(enabled),
)

onUnmounted(() => {
  resizeObserver?.disconnect()
  map?.remove()
  map = null
  overlay = null
  pointsLayer = null
  areaLayer = null
  draftRect = null
})

function invalidate() {
  map?.invalidateSize()
}

defineExpose({ currentBounds, invalidate })
</script>

<style scoped>
.map-wrap {
  isolation: isolate;
  width: 100%;
  height: 100%;
  min-height: 520px;
  border-radius: var(--ds-radius-lg);
  overflow: hidden;
  border: 1px solid var(--ds-border);
}

.map-wrap.loading {
  opacity: 0.72;
}

.map-wrap.selecting .map-surface {
  cursor: crosshair;
}

.map-surface {
  width: 100%;
  height: 100%;
  min-height: 520px;
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

:deep(.rain-overlay) {
  mix-blend-mode: screen;
}
</style>
