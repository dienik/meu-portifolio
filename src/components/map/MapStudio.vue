<template>
  <section class="page">
    <header class="hero">
      <div>
        <p class="kicker">GeoJSON · Leaflet</p>
        <h1>Mapa de polígonos</h1>
        <p class="lead">
          Desenhe no mapa ou insira as coordenadas na mão. Polígonos e multipolígonos
          entram como features GeoJSON e são plotados na hora.
        </p>
      </div>
      <div class="hero-actions">
        <DsButton variant="ghost" @click="fitAll">Enquadrar tudo</DsButton>
        <DsButton variant="secondary" @click="openImport = true">Importar GeoJSON</DsButton>
        <DsButton @click="downloadGeoJson">Exportar</DsButton>
      </div>
    </header>

    <DsCard>
      <div class="toolbar">
        <DsButton :variant="mode === 'polygon' ? 'primary' : 'secondary'" @click="startPolygon">
          Desenhar polígono
        </DsButton>
        <DsButton :variant="mode === 'multipolygon' ? 'primary' : 'secondary'" @click="startMulti">
          Desenhar multi
        </DsButton>
        <DsButton :variant="coordOpen ? 'primary' : 'secondary'" @click="openCoordinateForm()">
          Inserir coordenadas
        </DsButton>
        <DsButton variant="ghost" :disabled="!vertices.length || coordOpen" @click="undoVertex">
          Desfazer vértice
        </DsButton>
        <DsButton variant="ghost" :disabled="vertices.length < 3 || coordOpen" @click="closeRing">
          Fechar anel
        </DsButton>
        <DsButton
          variant="ghost"
          :disabled="mode !== 'multipolygon' || parts.length < 2"
          @click="finishMulti"
        >
          Finalizar multi
        </DsButton>
        <DsButton variant="danger" :disabled="mode === 'idle' && !coordOpen" @click="cancelAll">
          Cancelar
        </DsButton>
        <DsButton
          variant="secondary"
          :disabled="selectedIds.length < 2"
          @click="mergeSelected"
        >
          Unir seleção
        </DsButton>
      </div>
      <p class="hint">{{ hint }}</p>
    </DsCard>

    <div class="workspace">
      <MapCanvas
        ref="canvas"
        :features="mapFeatures"
        :selected-id="activeId"
        :drawing="mode !== 'idle' || coordOpen"
        :draw-color="drawColor"
        :vertices="coordOpen ? formPreview.vertices : vertices"
        :parts="coordOpen ? formPreview.parts : parts"
        @map-click="onMapClick"
        @close-ring="onCloseRing"
        @feature-click="onFeatureClick"
      />

      <aside class="side" :class="{ wide: coordOpen }">
        <template v-if="coordOpen">
          <div class="side-head">
            <strong>{{ editingFeature ? 'Editar coordenadas' : 'Nova feature' }}</strong>
            <DsButton size="sm" variant="ghost" @click="closeCoordinateForm">Fechar</DsButton>
          </div>
          <FeatureCoordinateForm
            ref="coordForm"
            :initial="editingFeature"
            @preview="formPreview = $event"
            @submit="saveManual"
          />
          <div class="side-actions">
            <DsButton variant="ghost" @click="closeCoordinateForm">Cancelar</DsButton>
            <DsButton @click="coordForm?.submit()">Plotar no mapa</DsButton>
          </div>
        </template>
        <template v-else>
          <DsInput v-model="query" placeholder="Filtrar geometrias" />
          <div v-if="!filtered.length" class="empty">Nenhuma geometria no mapa.</div>
        <article
          v-for="feature in filtered"
          :key="feature.id"
          class="item"
          :class="{ active: feature.id === activeId }"
          @click="focusFeature(feature)"
        >
          <label class="check" @click.stop>
            <input
              type="checkbox"
              :checked="selectedIds.includes(feature.id)"
              @change="toggleSelect(feature.id)"
            />
          </label>
          <button
            class="swatch"
            type="button"
            :style="{ background: feature.color }"
            @click.stop="cycleColor(feature)"
          />
          <div class="meta">
            <strong>{{ feature.name }}</strong>
            <DsBadge :variant="feature.geometry.type === 'MultiPolygon' ? 'primary' : 'info'">
              {{ feature.geometry.type }}
            </DsBadge>
          </div>
          <div @click.stop>
            <DsToggle
              :model-value="feature.visible"
              @update:model-value="updateMapFeature(feature.id, { visible: $event })"
            />
          </div>
          <div class="row-actions" @click.stop>
            <DsButton size="sm" variant="secondary" @click="openCoordinateForm(feature)">Editar</DsButton>
            <DsButton size="sm" variant="danger" @click="pendingDelete = feature">Excluir</DsButton>
          </div>
        </article>
        </template>
      </aside>
    </div>

    <DsModal v-if="pendingName" :title="nameTitle" @close="discardPending">
      <DsInput v-model="pendingNameValue" label="Nome da geometria" />
      <template #footer>
        <DsButton variant="ghost" @click="discardPending">Descartar</DsButton>
        <DsButton @click="confirmPending">Salvar no mapa</DsButton>
      </template>
    </DsModal>

    <DsModal v-if="openImport" title="Importar GeoJSON" @close="openImport = false">
      <DsTextarea
        v-model="importText"
        label="Cole um Feature, FeatureCollection, Polygon ou MultiPolygon"
        :rows="10"
        :error="importError"
      />
      <input class="file" type="file" accept=".json,.geojson,application/geo+json" @change="onFile" />
      <template #footer>
        <DsButton variant="ghost" @click="openImport = false">Cancelar</DsButton>
        <DsButton @click="confirmImport">Plotar no mapa</DsButton>
      </template>
    </DsModal>

    <DsModal v-if="pendingDelete" title="Excluir geometria" @close="pendingDelete = null">
      <p>Remover <strong>{{ pendingDelete.name }}</strong> do mapa?</p>
      <template #footer>
        <DsButton variant="ghost" @click="pendingDelete = null">Cancelar</DsButton>
        <DsButton variant="danger" @click="confirmDelete">Excluir</DsButton>
      </template>
    </DsModal>

    <DsToast :message="toast" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import MapCanvas from './MapCanvas.vue'
import FeatureCoordinateForm from './FeatureCoordinateForm.vue'
import DsButton from '../ui/DsButton.vue'
import DsCard from '../ui/DsCard.vue'
import DsInput from '../ui/DsInput.vue'
import DsTextarea from '../ui/DsTextarea.vue'
import DsModal from '../ui/DsModal.vue'
import DsBadge from '../ui/DsBadge.vue'
import DsToggle from '../ui/DsToggle.vue'
import DsToast from '../ui/DsToast.vue'
import {
  addMapFeature,
  exportMapFeatures,
  importMapFeatures,
  mapFeatures,
  removeMapFeature,
  updateMapFeature,
} from '../../stores/mapFeatures'
import {
  PALETTE,
  mergeGeometries,
  multiPolygonFromParts,
  nextColor,
  polygonFromLatLngs,
  type LatLngPoint,
  type MapFeature,
  type MapGeometry,
} from '../../lib/geo'

type DrawMode = 'idle' | 'polygon' | 'multipolygon'

const canvas = ref<{
  fitGeometry: (geometry: MapGeometry) => void
  fitAll: () => void
  invalidate: () => void
} | null>(null)
const coordForm = ref<{ submit: () => void; addPoint: (point: LatLngPoint) => void } | null>(null)
const mode = ref<DrawMode>('idle')
const vertices = ref<LatLngPoint[]>([])
const parts = ref<LatLngPoint[][]>([])
const query = ref('')
const activeId = ref<string | null>(null)
const selectedIds = ref<string[]>([])
const openImport = ref(false)
const importText = ref('')
const importError = ref('')
const toast = ref('')
const pendingDelete = ref<MapFeature | null>(null)
const pendingName = ref<MapGeometry | null>(null)
const pendingNameValue = ref('')
const pendingKind = ref<'Polygon' | 'MultiPolygon'>('Polygon')
const coordOpen = ref(false)
const editingFeature = ref<MapFeature | null>(null)
const formPreview = ref<{ parts: LatLngPoint[][]; vertices: LatLngPoint[] }>({
  parts: [],
  vertices: [],
})

const drawColor = computed(() => nextColor(mapFeatures.value.length))

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return mapFeatures.value.filter((item) =>
    !term || item.name.toLowerCase().includes(term) || item.geometry.type.toLowerCase().includes(term),
  )
})

const hint = computed(() => {
  if (coordOpen.value) {
    return 'Modo coordenadas: clique no mapa ou preencha latitude/longitude no painel. A geometria aparece em preview antes de plotar.'
  }
  if (mode.value === 'polygon') {
    return 'Clique no mapa para desenhar os vértices. Feche o anel no primeiro ponto, com duplo clique ou em Fechar anel.'
  }
  if (mode.value === 'multipolygon') {
    return `Desenhe cada parte do multipolígono. Partes prontas: ${parts.value.length}. Finalize quando houver pelo menos duas.`
  }
  return 'Desenhe no mapa ou use Inserir coordenadas para criar a feature com lat/lng.'
})

const nameTitle = computed(() =>
  pendingKind.value === 'MultiPolygon' ? 'Salvar multipolígono' : 'Salvar polígono',
)

function flash(message: string) {
  toast.value = message
  window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

function startPolygon() {
  closeCoordinateForm()
  mode.value = 'polygon'
  vertices.value = []
  parts.value = []
  flash('Modo desenho de polígono ativo.')
}

function startMulti() {
  closeCoordinateForm()
  mode.value = 'multipolygon'
  vertices.value = []
  parts.value = []
  flash('Modo desenho de multipolígono ativo.')
}

function cancelDraw() {
  mode.value = 'idle'
  vertices.value = []
  parts.value = []
}

function cancelAll() {
  cancelDraw()
  closeCoordinateForm()
}

function openCoordinateForm(feature?: MapFeature) {
  cancelDraw()
  editingFeature.value = feature ?? null
  coordOpen.value = true
  formPreview.value = { parts: [], vertices: [] }
}

function closeCoordinateForm() {
  coordOpen.value = false
  editingFeature.value = null
  formPreview.value = { parts: [], vertices: [] }
}

function saveManual(payload: { name: string; geometry: MapGeometry }) {
  if (editingFeature.value) {
    updateMapFeature(editingFeature.value.id, payload)
    activeId.value = editingFeature.value.id
    flash('Coordenadas atualizadas.')
    window.setTimeout(() => canvas.value?.fitGeometry(payload.geometry), 40)
  } else {
    const created = addMapFeature({
      name: payload.name,
      color: drawColor.value,
      visible: true,
      geometry: payload.geometry,
    })
    activeId.value = created.id
    flash('Feature plotada no mapa.')
    window.setTimeout(() => canvas.value?.fitGeometry(created.geometry), 40)
  }
  closeCoordinateForm()
}

function onMapClick(point: LatLngPoint) {
  if (coordOpen.value) {
    coordForm.value?.addPoint(point)
    return
  }
  addVertex(point)
}

function onCloseRing() {
  if (coordOpen.value) return
  closeRing()
}

function addVertex(point: LatLngPoint) {
  if (mode.value === 'idle') return
  vertices.value = [...vertices.value, point]
}

function undoVertex() {
  vertices.value = vertices.value.slice(0, -1)
}

function closeRing() {
  if (vertices.value.length < 3) return
  if (mode.value === 'polygon') {
    pendingKind.value = 'Polygon'
    pendingNameValue.value = `Polígono ${mapFeatures.value.length + 1}`
    pendingName.value = polygonFromLatLngs(vertices.value)
    mode.value = 'idle'
    vertices.value = []
    return
  }
  if (mode.value === 'multipolygon') {
    parts.value = [...parts.value, [...vertices.value]]
    vertices.value = []
    flash(`Parte ${parts.value.length} adicionada.`)
  }
}

function finishMulti() {
  if (parts.value.length < 2) {
    flash('Desenhe pelo menos duas partes.')
    return
  }
  pendingKind.value = 'MultiPolygon'
  pendingNameValue.value = `Multipolígono ${mapFeatures.value.length + 1}`
  pendingName.value = multiPolygonFromParts(parts.value)
  mode.value = 'idle'
  parts.value = []
  vertices.value = []
}

function confirmPending() {
  if (!pendingName.value) return
  const created = addMapFeature({
    name: pendingNameValue.value.trim() || 'Geometria',
    color: drawColor.value,
    visible: true,
    geometry: pendingName.value,
  })
  pendingName.value = null
  activeId.value = created.id
  flash('Geometria plotada no mapa.')
  window.setTimeout(() => canvas.value?.fitGeometry(created.geometry), 40)
}

function discardPending() {
  pendingName.value = null
}

function onFeatureClick(id: string) {
  activeId.value = id
}

function focusFeature(feature: MapFeature) {
  activeId.value = feature.id
  canvas.value?.fitGeometry(feature.geometry)
}

function fitAll() {
  canvas.value?.fitAll()
}

function toggleSelect(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}

function cycleColor(feature: MapFeature) {
  const index = PALETTE.indexOf(feature.color)
  const color = nextColor(index + 1)
  updateMapFeature(feature.id, { color })
}

function mergeSelected() {
  const selected = mapFeatures.value.filter((item) => selectedIds.value.includes(item.id))
  if (selected.length < 2) return
  const created = addMapFeature({
    name: 'Multipolígono unido',
    color: drawColor.value,
    visible: true,
    geometry: mergeGeometries(selected.map((item) => item.geometry)),
  })
  selectedIds.value = []
  activeId.value = created.id
  flash('Seleção unida em MultiPolygon.')
  window.setTimeout(() => canvas.value?.fitGeometry(created.geometry), 40)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  removeMapFeature(pendingDelete.value.id)
  if (activeId.value === pendingDelete.value.id) activeId.value = null
  selectedIds.value = selectedIds.value.filter((id) => id !== pendingDelete.value?.id)
  pendingDelete.value = null
  flash('Geometria removida.')
}

function downloadGeoJson() {
  const blob = new Blob([exportMapFeatures()], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'poligonos.geojson'
  link.click()
  URL.revokeObjectURL(url)
  flash('GeoJSON exportado.')
}

function confirmImport() {
  try {
    const created = importMapFeatures(importText.value)
    importError.value = ''
    openImport.value = false
    importText.value = ''
    flash(`${created.length} geometria(s) plotada(s).`)
    window.setTimeout(() => canvas.value?.fitAll(), 40)
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Não foi possível ler o GeoJSON.'
  }
}

function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  void file.text().then((text) => {
    importText.value = text
  })
}

function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
  if (event.key === 'Escape') cancelAll()
  if (event.key === 'Enter') closeRing()
  if (event.key === 'Backspace') {
    event.preventDefault()
    undoVertex()
  }
}

watch(coordOpen, () => {
  window.setTimeout(() => canvas.value?.invalidate(), 80)
})

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.setTimeout(() => canvas.value?.fitAll(), 120)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.page {
  width: min(1280px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
  display: grid;
  gap: 1rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 1.25rem;
  align-items: flex-end;
}

.kicker {
  margin: 0 0 0.4rem;
  color: var(--ds-accent);
  font-size: var(--ds-fs-xs);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: var(--ds-fs-3xl);
}

.lead {
  max-width: 62ch;
  margin: 0.7rem 0 0;
  color: var(--ds-text-muted);
}

.hero-actions,
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.hint {
  margin: 0.85rem 0 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1rem;
  min-height: calc(100vh - 280px);
}

.side {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  max-height: calc(100vh - 280px);
  overflow: auto;
}

.item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 0.55rem;
  align-items: center;
  padding: 0.7rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
  cursor: pointer;
}

.item.active {
  border-color: var(--ds-primary);
  box-shadow: var(--ds-ring);
}

.swatch {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.meta {
  display: grid;
  gap: 0.25rem;
}

.meta strong {
  font-size: var(--ds-fs-sm);
}

.side.wide {
  max-height: calc(100vh - 220px);
}

.side-head,
.side-actions,
.row-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.row-actions {
  grid-column: 1 / -1;
  justify-content: flex-end;
}

.empty {
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
}

.workspace:has(.wide) {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 400px);
}

.file {
  margin-top: 0.8rem;
  color: var(--ds-text-muted);
}

.check input {
  accent-color: var(--ds-primary);
}

@media (max-width: 960px) {
  .hero,
  .workspace {
    grid-template-columns: 1fr;
    display: grid;
  }

  .side {
    max-height: none;
  }
}
</style>
