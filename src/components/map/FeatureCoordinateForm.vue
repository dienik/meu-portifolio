<template>
  <form class="coord-form" @submit.prevent="submit">
    <DsInput v-model="name" label="Nome da feature" placeholder="Ex.: Área do projeto" :error="nameError" />

    <div class="row-2">
      <DsSelect v-model="kind" label="Tipo" :options="kindOptions" />
      <DsSelect v-model="order" label="Ordem" :options="orderOptions" />
    </div>

    <p class="help">
      Digite latitude e longitude, cole uma lista ou clique no mapa para incluir o vértice na parte atual.
    </p>

    <section
      v-for="(part, partIndex) in parts"
      :key="partIndex"
      class="part"
      :class="{ current: partIndex === activePart }"
      @click="activePart = partIndex"
    >
      <header>
        <h3>{{ parts.length > 1 ? `Parte ${partIndex + 1}` : 'Vértices' }}</h3>
        <DsButton
          v-if="parts.length > 1"
          size="sm"
          variant="ghost"
          type="button"
          @click.stop="removePart(partIndex)"
        >
          Remover
        </DsButton>
      </header>

      <div class="vertex" v-for="(vertex, vertexIndex) in part" :key="vertexIndex">
        <DsInput
          v-model="vertex.lat"
          :label="vertexIndex === 0 ? 'Latitude' : ''"
          placeholder="Latitude"
        />
        <DsInput
          v-model="vertex.lng"
          :label="vertexIndex === 0 ? 'Longitude' : ''"
          placeholder="Longitude"
        />
        <DsButton
          size="sm"
          variant="ghost"
          type="button"
          :disabled="part.length <= 3"
          @click="removeVertex(partIndex, vertexIndex)"
        >
          ×
        </DsButton>
      </div>

      <div class="part-actions">
        <DsButton size="sm" variant="secondary" type="button" @click.stop="addVertex(partIndex)">
          Adicionar vértice
        </DsButton>
      </div>

      <DsTextarea
        v-model="pastes[partIndex]"
        :label="order === 'lnglat' ? 'Colar lista lng, lat' : 'Colar lista lat, lng'"
        :rows="3"
        placeholder="-30.0362, -51.2178"
      />
      <DsButton size="sm" variant="ghost" type="button" @click.stop="applyPaste(partIndex)">
        Aplicar lista nesta parte
      </DsButton>
    </section>

    <DsButton v-if="kind === 'MultiPolygon'" variant="secondary" type="button" @click="addPart">
      Adicionar parte
    </DsButton>

    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import DsInput from '../ui/DsInput.vue'
import DsSelect from '../ui/DsSelect.vue'
import DsTextarea from '../ui/DsTextarea.vue'
import DsButton from '../ui/DsButton.vue'
import {
  formatCoord,
  geometryToParts,
  isValidLatLng,
  multiPolygonFromParts,
  parseCoordNumber,
  parseCoordinateList,
  polygonFromLatLngs,
  validateParts,
  type LatLngPoint,
  type MapFeature,
  type MapGeometry,
} from '../../lib/geo'

type VertexRow = { lat: string; lng: string }

const props = defineProps<{
  initial?: MapFeature | null
}>()

const emit = defineEmits<{
  submit: [value: { name: string; geometry: MapGeometry }]
  preview: [value: { parts: LatLngPoint[][]; vertices: LatLngPoint[] }]
}>()

const kindOptions = [
  { label: 'Polígono', value: 'Polygon' },
  { label: 'Multipolígono', value: 'MultiPolygon' },
]

const orderOptions = [
  { label: 'Lat, Lng', value: 'latlng' },
  { label: 'Lng, Lat (GeoJSON)', value: 'lnglat' },
]

const name = ref('')
const kind = ref('Polygon')
const order = ref('latlng')
const parts = reactive<VertexRow[][]>([])
const pastes = reactive<string[]>([])
const activePart = ref(0)
const error = ref('')
const nameError = ref('')
let hydrating = false

function emptyRows(count = 3): VertexRow[] {
  return Array.from({ length: count }, () => ({ lat: '', lng: '' }))
}

function rowsFromPoints(points: LatLngPoint[]): VertexRow[] {
  const rows = points.map((point) => ({
    lat: formatCoord(point.lat),
    lng: formatCoord(point.lng),
  }))
  while (rows.length < 3) rows.push({ lat: '', lng: '' })
  return rows
}

function reset(feature?: MapFeature | null) {
  hydrating = true
  error.value = ''
  nameError.value = ''
  activePart.value = 0
  parts.splice(0, parts.length)
  pastes.splice(0, pastes.length)
  if (feature) {
    name.value = feature.name
    const source = geometryToParts(feature.geometry)
    source.forEach((part) => {
      parts.push(rowsFromPoints(part))
      pastes.push('')
    })
    if (!parts.length) {
      parts.push(emptyRows())
      pastes.push('')
    }
    kind.value = feature.geometry.type
    hydrating = false
    return
  }
  name.value = ''
  order.value = 'latlng'
  parts.push(emptyRows())
  pastes.push('')
  kind.value = 'Polygon'
  hydrating = false
}

reset(props.initial)

watch(
  () => props.initial,
  (feature) => reset(feature),
)

watch(kind, (value) => {
  if (hydrating) return
  if (value === 'MultiPolygon' && parts.length < 2) {
    parts.push(emptyRows())
    pastes.push('')
  }
  if (value === 'Polygon' && parts.length > 1) {
    parts.splice(1)
    pastes.splice(1)
    activePart.value = 0
  }
})

function parsedPart(part: VertexRow[]): LatLngPoint[] {
  const points: LatLngPoint[] = []
  for (const row of part) {
    const lat = parseCoordNumber(row.lat)
    const lng = parseCoordNumber(row.lng)
    if (lat === null && lng === null) continue
    if (lat === null || lng === null) continue
    const point = { lat, lng }
    if (isValidLatLng(point)) points.push(point)
  }
  return points
}

const preview = computed(() => {
  const parsed = parts.map(parsedPart)
  const current = parsed[activePart.value] ?? []
  return {
    parts: parsed.filter((part, index) => index !== activePart.value && part.length >= 3),
    vertices: current,
  }
})

watch(
  preview,
  (value) => emit('preview', value),
  { immediate: true, deep: true },
)

function addVertex(partIndex: number) {
  parts[partIndex]?.push({ lat: '', lng: '' })
}

function removeVertex(partIndex: number, vertexIndex: number) {
  const part = parts[partIndex]
  if (!part || part.length <= 3) return
  part.splice(vertexIndex, 1)
}

function addPart() {
  parts.push(emptyRows())
  pastes.push('')
  activePart.value = parts.length - 1
}

function removePart(partIndex: number) {
  if (parts.length <= 1) return
  parts.splice(partIndex, 1)
  pastes.splice(partIndex, 1)
  activePart.value = Math.max(0, partIndex - 1)
}

function applyPaste(partIndex: number) {
  const text = pastes[partIndex] ?? ''
  const points = parseCoordinateList(text, order.value === 'lnglat' ? 'lnglat' : 'latlng')
  if (points.length < 3) {
    error.value = 'A lista precisa ter pelo menos 3 pares de coordenadas válidos.'
    return
  }
  parts.splice(partIndex, 1, rowsFromPoints(points))
  error.value = ''
}

function addPoint(point: LatLngPoint) {
  const index = activePart.value
  const part = parts[index]
  if (!part) return
  const empty = part.find((row) => !row.lat.trim() && !row.lng.trim())
  const row = { lat: formatCoord(point.lat), lng: formatCoord(point.lng) }
  if (empty) {
    empty.lat = row.lat
    empty.lng = row.lng
  } else {
    part.push(row)
  }
}

function submit() {
  nameError.value = name.value.trim() ? '' : 'Informe o nome da feature.'
  const parsed = parts.map(parsedPart)
  const selectedKind = kind.value === 'MultiPolygon' ? 'MultiPolygon' : 'Polygon'
  const geometryError = validateParts(parsed, selectedKind)
  error.value = geometryError ?? ''
  if (nameError.value || error.value) return

  const filled = parsed.filter((part) => part.length >= 3)
  const geometry =
    selectedKind === 'Polygon'
      ? polygonFromLatLngs(filled[0] ?? [])
      : multiPolygonFromParts(filled)

  emit('submit', {
    name: name.value.trim(),
    geometry,
  })
}

defineExpose({ submit, addPoint, reset })
</script>

<style scoped>
.coord-form {
  display: grid;
  gap: 0.9rem;
}

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}

.help,
.error {
  margin: 0;
  font-size: var(--ds-fs-sm);
}

.help {
  color: var(--ds-text-muted);
}

.error {
  color: var(--ds-danger);
}

.part {
  display: grid;
  gap: 0.55rem;
  padding: 0.8rem;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  background: rgba(5, 8, 22, 0.35);
}

.part.current {
  border-color: var(--ds-primary);
}

.part header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.part h3 {
  margin: 0;
  font-size: var(--ds-fs-sm);
}

.vertex {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.4rem;
  align-items: end;
}

.part-actions {
  display: flex;
  gap: 0.4rem;
}
</style>
