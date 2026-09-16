<template>
  <section class="page">
    <header class="hero">
      <div>
        <p class="kicker">WKT · interseção · diferença</p>
        <h1>Comparador de polígonos</h1>
        <p class="lead">
          Cole dois WKT e veja se são iguais, se um contém o outro, a área da interseção
          e o que existe só em A ou só em B.
        </p>
      </div>
      <div class="hero-actions">
        <DsButton variant="ghost" @click="loadExample">Carregar exemplo</DsButton>
        <DsButton variant="secondary" @click="swapSides">Trocar A ↔ B</DsButton>
        <DsButton @click="runCompare">Comparar</DsButton>
      </div>
    </header>

    <div class="inputs">
      <DsCard>
        <DsTextarea
          v-model="wktA"
          label="Polígono A"
          hint="POLYGON ou MULTIPOLYGON em longitude latitude"
          placeholder="POLYGON((lng lat, lng lat, ...))"
          :rows="7"
          :error="errorA"
        />
      </DsCard>
      <DsCard>
        <DsTextarea
          v-model="wktB"
          label="Polígono B"
          hint="O segundo WKT entra na mesma ordem: lng lat"
          placeholder="POLYGON((lng lat, lng lat, ...))"
          :rows="7"
          :error="errorB"
        />
      </DsCard>
    </div>

    <p v-if="error" class="banner">{{ error }}</p>

    <div class="workspace">
      <MapCanvas
        ref="canvas"
        :features="mapFeatures"
        :selected-id="activeId"
        @feature-click="activeId = $event"
      />

      <aside class="side">
        <div v-if="result" class="relation">
          <DsBadge :variant="relationVariant">{{ result.relationLabel }}</DsBadge>
          <p>{{ relationHint }}</p>
        </div>
        <div v-else class="empty">Cole dois WKT e clique em Comparar.</div>

        <div class="metrics">
          <article v-for="metric in metrics" :key="metric.label">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </article>
        </div>

        <div class="layers">
          <div v-for="layer in layers" :key="layer.id" class="layer-row">
            <span class="swatch" :style="{ background: layer.color }" />
            <span>{{ layer.label }}</span>
            <DsToggle v-model="layer.visible" />
          </div>
        </div>

        <DsSelect v-if="result" v-model="resultKind" label="WKT do resultado" :options="resultOptions" />
        <DsTextarea
          v-if="result"
          :model-value="resultWkt"
          :rows="5"
          :disabled="!resultWkt"
        />
        <DsButton
          v-if="result"
          variant="secondary"
          size="sm"
          :disabled="!resultWkt"
          @click="copyResult"
        >
          Copiar WKT do resultado
        </DsButton>
      </aside>
    </div>

    <DsToast :message="toast" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import MapCanvas from './MapCanvas.vue'
import DsButton from '../ui/DsButton.vue'
import DsCard from '../ui/DsCard.vue'
import DsTextarea from '../ui/DsTextarea.vue'
import DsBadge from '../ui/DsBadge.vue'
import DsToggle from '../ui/DsToggle.vue'
import DsSelect from '../ui/DsSelect.vue'
import DsToast from '../ui/DsToast.vue'
import { formatArea, parseWktGeometry, type MapFeature, type MapGeometry } from '../../lib/geo'
import { compareWkt, formatPercent, type PolygonCompareResult } from '../../lib/wktCompare'

const SAMPLE_A =
  'POLYGON((-53.80438325352512 -16.844869305445357,-53.802712045281424 -16.8460074088417,-53.8029530849315 -16.846422661079572,-53.80194071839931 -16.847160885029112,-53.801651470818555 -16.846761014080045,-53.80108904496774 -16.84713012575537,-53.80025344084558 -16.845622915216282,-53.7993696287934 -16.84433101091406,-53.798919688112605 -16.843884994286313,-53.799546391204075 -16.84276225811942,-53.80438325352512 -16.844869305445357))'

const SAMPLE_B =
  'POLYGON((-53.8032 -16.8442,-53.8008 -16.8459,-53.8001 -16.8476,-53.7986 -16.8464,-53.7981 -16.8441,-53.8004 -16.8428,-53.8032 -16.8442))'

const canvas = ref<{ fitAll: () => void; invalidate: () => void } | null>(null)
const wktA = ref(SAMPLE_A)
const wktB = ref(SAMPLE_B)
const errorA = ref('')
const errorB = ref('')
const error = ref('')
const toast = ref('')
const result = ref<PolygonCompareResult | null>(null)
const resultKind = ref('intersection')
const activeId = ref<string | null>('intersection')
const geometryA = ref<MapGeometry | null>(null)
const geometryB = ref<MapGeometry | null>(null)
let debounce: number | undefined

const layers = reactive([
  { id: 'a', label: 'Polígono A', color: '#818cf8', visible: true },
  { id: 'b', label: 'Polígono B', color: '#22d3ee', visible: true },
  { id: 'intersection', label: 'Interseção', color: '#fbbf24', visible: true },
  { id: 'only-a', label: 'Só em A', color: '#e879f9', visible: false },
  { id: 'only-b', label: 'Só em B', color: '#34d399', visible: false },
])

const resultOptions = [
  { label: 'Interseção (A ∩ B)', value: 'intersection' },
  { label: 'Só em A (A − B)', value: 'only-a' },
  { label: 'Só em B (B − A)', value: 'only-b' },
  { label: 'União (A ∪ B)', value: 'union' },
]

const relationVariant = computed(() => {
  const relation = result.value?.relation
  if (relation === 'iguais') return 'success' as const
  if (relation === 'a-contem-b' || relation === 'b-contem-a') return 'primary' as const
  if (relation === 'sobrepostos') return 'warning' as const
  return 'danger' as const
})

const relationHint = computed(() => {
  const current = result.value
  if (!current) return ''
  if (current.equals) return 'A diferença simétrica é desprezível: os polígonos coincidem.'
  if (current.aContainsB) return 'B está contido em A. A interseção cobre praticamente toda a área de B.'
  if (current.bContainsA) return 'A está contido em B. A interseção cobre praticamente toda a área de A.'
  if (current.intersects) return 'Os polígonos se cruzam, mas nenhum contém o outro por completo.'
  return 'Não há sobreposição entre A e B.'
})

const metrics = computed(() => {
  const current = result.value
  if (!current) {
    return [
      { label: 'Área A', value: '—' },
      { label: 'Área B', value: '—' },
      { label: 'Interseção', value: '—' },
      { label: 'Jaccard', value: '—' },
    ]
  }
  return [
    { label: 'Área A', value: formatArea(current.areaA) },
    { label: 'Área B', value: formatArea(current.areaB) },
    { label: 'Interseção', value: formatArea(current.intersectionArea) },
    { label: 'Só em A', value: formatArea(current.differenceAB) },
    { label: 'Só em B', value: formatArea(current.differenceBA) },
    { label: 'União', value: formatArea(current.unionArea) },
    { label: 'A coberta por B', value: formatPercent(current.overlapA) },
    { label: 'B coberta por A', value: formatPercent(current.overlapB) },
    { label: 'Similaridade Jaccard', value: formatPercent(current.jaccard) },
  ]
})

const resultWkt = computed(() => {
  const current = result.value
  if (!current) return ''
  if (resultKind.value === 'only-a') return current.wktOnlyA
  if (resultKind.value === 'only-b') return current.wktOnlyB
  if (resultKind.value === 'union') return current.wktUnion
  return current.wktIntersection
})

const mapFeatures = computed<MapFeature[]>(() => {
  const items: MapFeature[] = []
  const stamp = '2026-01-01T00:00:00.000Z'
  const current = result.value
  const visible = (id: string) => layers.find((layer) => layer.id === id)?.visible ?? false

  if (geometryA.value && visible('a')) {
    items.push({
      id: 'a',
      name: 'Polígono A',
      color: '#818cf8',
      visible: true,
      createdAt: stamp,
      geometry: geometryA.value,
      fillOpacity: 0.16,
      weight: 2,
    })
  }
  if (geometryB.value && visible('b')) {
    items.push({
      id: 'b',
      name: 'Polígono B',
      color: '#22d3ee',
      visible: true,
      createdAt: stamp,
      geometry: geometryB.value,
      fillOpacity: 0.16,
      weight: 2,
    })
  }
  if (current?.intersection && visible('intersection')) {
    items.push({
      id: 'intersection',
      name: 'Interseção',
      color: '#fbbf24',
      visible: true,
      createdAt: stamp,
      geometry: current.intersection,
      fillOpacity: 0.45,
      weight: 3,
    })
  }
  if (current?.onlyA && visible('only-a')) {
    items.push({
      id: 'only-a',
      name: 'Só em A',
      color: '#e879f9',
      visible: true,
      createdAt: stamp,
      geometry: current.onlyA,
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '7 5',
    })
  }
  if (current?.onlyB && visible('only-b')) {
    items.push({
      id: 'only-b',
      name: 'Só em B',
      color: '#34d399',
      visible: true,
      createdAt: stamp,
      geometry: current.onlyB,
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '7 5',
    })
  }
  return items
})

function flash(message: string) {
  toast.value = message
  window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

function parseSide(text: string, side: 'A' | 'B'): MapGeometry {
  try {
    return parseWktGeometry(text)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'WKT inválido.'
    if (side === 'A') errorA.value = message
    else errorB.value = message
    throw err
  }
}

function runCompare() {
  error.value = ''
  errorA.value = ''
  errorB.value = ''

  if (!wktA.value.trim()) errorA.value = 'Cole o WKT do polígono A.'
  if (!wktB.value.trim()) errorB.value = 'Cole o WKT do polígono B.'
  if (errorA.value || errorB.value) {
    result.value = null
    geometryA.value = null
    geometryB.value = null
    return
  }

  try {
    geometryA.value = parseSide(wktA.value, 'A')
    geometryB.value = parseSide(wktB.value, 'B')
    result.value = compareWkt(wktA.value, wktB.value)
    window.setTimeout(() => {
      canvas.value?.invalidate()
      canvas.value?.fitAll()
    }, 40)
  } catch (err) {
    result.value = null
    if (!errorA.value && !errorB.value) {
      error.value = err instanceof Error ? err.message : 'Não foi possível comparar os WKT.'
    }
  }
}

function loadExample() {
  wktA.value = SAMPLE_A
  wktB.value = SAMPLE_B
  runCompare()
  flash('Exemplo de polígonos sobrepostos carregado.')
}

function swapSides() {
  const left = wktA.value
  wktA.value = wktB.value
  wktB.value = left
  runCompare()
}

async function copyResult() {
  if (!resultWkt.value) {
    flash('Esse resultado está vazio.')
    return
  }
  await navigator.clipboard.writeText(resultWkt.value)
  flash('WKT copiado.')
}

function scheduleCompare() {
  window.clearTimeout(debounce)
  debounce = window.setTimeout(runCompare, 450)
}

watch([wktA, wktB], scheduleCompare)

onMounted(() => {
  runCompare()
  window.setTimeout(() => canvas.value?.fitAll(), 120)
})

onUnmounted(() => {
  window.clearTimeout(debounce)
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

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.banner,
.empty {
  margin: 0;
  color: var(--ds-danger);
  font-size: var(--ds-fs-sm);
}

.empty {
  color: var(--ds-text-muted);
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
  gap: 0.85rem;
  max-height: calc(100vh - 220px);
  overflow: auto;
}

.relation {
  display: grid;
  gap: 0.45rem;
}

.relation p {
  margin: 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
}

.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.metrics article {
  display: grid;
  gap: 0.2rem;
  padding: 0.7rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
}

.metrics span {
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-xs);
}

.metrics strong {
  font-size: var(--ds-fs-sm);
}

.layers {
  display: grid;
  gap: 0.45rem;
}

.layer-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
  font-size: var(--ds-fs-sm);
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

@media (max-width: 960px) {
  .hero,
  .workspace,
  .inputs {
    grid-template-columns: 1fr;
    display: grid;
  }

  .side {
    max-height: none;
  }
}
</style>
