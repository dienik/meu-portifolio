<template>
  <section class="page">
    <header class="hero">
      <div>
        <p class="kicker">Open-Meteo · IDW</p>
        <h1>Chuva interpolada</h1>
        <p class="lead">
          Consulte dias anteriores, desenhe uma área no mapa e exporte um PDF com a média de
          chuva do período e gráficos diários.
        </p>
      </div>
      <div class="hero-actions">
        <DsButton variant="ghost" :loading="loading" @click="reload">Atualizar</DsButton>
        <DsToggle v-model="autoRefresh" label="Auto 5 min" />
      </div>
    </header>

    <DsCard>
      <div class="filters">
        <DsInput v-model="startDate" type="date" label="Início" />
        <DsInput v-model="endDate" type="date" label="Fim" :hint="rangeHint" :error="rangeError" />
        <div class="filter-actions">
          <DsButton :loading="loading" @click="applyPeriod">Aplicar período</DsButton>
          <DsButton :variant="selecting ? 'primary' : 'secondary'" @click="toggleSelect">
            {{ selecting ? 'Arraste no mapa' : 'Selecionar área' }}
          </DsButton>
          <DsButton variant="ghost" :disabled="!area" @click="clearArea">Limpar área</DsButton>
          <DsButton :disabled="!area" :loading="reportLoading" @click="openReport">
            Exportar PDF
          </DsButton>
        </div>
      </div>
      <div class="toolbar">
        <DsToggle v-model="showPoints" label="Pontos da grade" />
        <p class="meta">{{ statusLabel }}</p>
      </div>
      <label class="slider">
        <span>Horário</span>
        <input
          type="range"
          min="0"
          :max="Math.max(times.length - 1, 0)"
          :value="hourIndex < 0 ? currentHourIndex : hourIndex"
          :disabled="!times.length"
          @input="onHourInput"
        />
        <strong>{{ formatHour(activeTime) }}</strong>
      </label>
      <p class="hint">{{ hint }}</p>
    </DsCard>

    <div class="workspace">
      <RainMapCanvas
        ref="canvas"
        :samples="samples"
        :hour-index="hourIndex"
        :show-points="showPoints"
        :loading="loading"
        :selecting="selecting"
        :area="area"
        @bounds-change="onBounds"
        @area-select="onArea"
      />
      <aside class="side">
        <DsCard title="Precipitação" :subtitle="formatHour(activeTime)">
          <ul class="stats">
            <li><span>Máxima</span><strong>{{ formatMm(stats.max) }}</strong></li>
            <li><span>Média</span><strong>{{ formatMm(stats.mean) }}</strong></li>
            <li><span>Pontos com chuva</span><strong>{{ stats.wet }}/{{ samples.length }}</strong></li>
          </ul>
        </DsCard>
        <DsCard title="Área selecionada" :subtitle="area ? `${areaKm2.toFixed(1)} km²` : 'Nenhuma'">
          <p v-if="area" class="note">
            {{ area.south.toFixed(3)}}, {{ area.west.toFixed(3)}} →
            {{ area.north.toFixed(3)}}, {{ area.east.toFixed(3)}}
          </p>
          <p v-else class="note">Clique em Selecionar área e arraste um retângulo no mapa.</p>
        </DsCard>
        <DsCard title="Legenda" subtitle="mm na hora precedente">
          <div class="legend">
            <span v-for="stop in legendStops" :key="stop.mm" class="stop">
              <i :style="{ background: stop.css }" />
              {{ stop.mm }}
            </span>
          </div>
        </DsCard>
      </aside>
    </div>

    <DsModal v-if="report" size="lg" title="Média de chuva por área" @close="report = null">
      <div ref="reportEl" class="report">
        <h3>Relatório de precipitação</h3>
        <p>
          Período {{ formatDate(report.startDate) }} a {{ formatDate(report.endDate) }} ·
          área {{ report.areaKm2.toFixed(1) }} km² · {{ report.pointCount }} pontos
        </p>
        <ul class="stats">
          <li><span>Média diária na área</span><strong>{{ formatMm(report.meanDaily) }}</strong></li>
          <li><span>Acumulado médio</span><strong>{{ formatMm(report.totalMean) }}</strong></li>
          <li><span>Dia mais chuvoso</span><strong>{{ formatDate(report.maxDay.date) }} · {{ formatMm(report.maxDay.mm) }}</strong></li>
          <li><span>Dia mais seco</span><strong>{{ formatDate(report.minDay.date) }} · {{ formatMm(report.minDay.mm) }}</strong></li>
        </ul>
        <canvas ref="barChart" width="720" height="220" />
        <canvas ref="lineChart" width="720" height="220" />
        <p class="source">Fonte: Open-Meteo (CC BY 4.0). Interpolação IDW sobre a área selecionada.</p>
      </div>
      <template #footer>
        <DsButton variant="ghost" @click="report = null">Fechar</DsButton>
        <DsButton :loading="pdfLoading" @click="downloadPdf">Baixar PDF</DsButton>
      </template>
    </DsModal>

    <DsToast :message="toast" :tone="toastTone" />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import RainMapCanvas from './RainMapCanvas.vue'
import DsButton from '../ui/DsButton.vue'
import DsCard from '../ui/DsCard.vue'
import DsInput from '../ui/DsInput.vue'
import DsToggle from '../ui/DsToggle.vue'
import DsModal from '../ui/DsModal.vue'
import DsToast from '../ui/DsToast.vue'
import {
  MAX_RANGE_DAYS,
  RAIN_STOPS,
  addDays,
  bboxAreaKm2,
  buildAreaReport,
  buildRainGrid,
  fetchDailyRain,
  fetchRainGrid,
  formatDate,
  formatHour,
  formatMm,
  isoDate,
  rangeDays,
  rainStats,
  wettestHourIndex,
  type AreaRainReport,
  type LatLngBoundsBox,
  type RainSample,
} from '../../lib/rain'
import { drawBarChart, drawLineChart } from '../../lib/rainCharts'
import { exportRainPdf } from '../../lib/rainPdf'

const canvas = ref<{ currentBounds: () => LatLngBoundsBox; invalidate: () => void } | null>(null)
const reportEl = ref<HTMLElement | null>(null)
const barChart = ref<HTMLCanvasElement | null>(null)
const lineChart = ref<HTMLCanvasElement | null>(null)
const samples = ref<RainSample[]>([])
const times = ref<string[]>([])
const currentTime = ref('')
const hourIndex = ref(-1)
const loading = ref(false)
const reportLoading = ref(false)
const pdfLoading = ref(false)
const showPoints = ref(true)
const autoRefresh = ref(false)
const selecting = ref(false)
const area = ref<LatLngBoundsBox | null>(null)
const report = ref<AreaRainReport | null>(null)
const toast = ref('')
const toastTone = ref<'success' | 'danger' | 'info'>('info')
const lastBounds = ref<LatLngBoundsBox | null>(null)
const today = isoDate()
const startDate = ref(addDays(today, -6))
const endDate = ref(today)
let abort: AbortController | null = null
let debounce: number | undefined
let refreshTimer: number | undefined

const currentHourIndex = computed(() => times.value.findIndex((time) => time === currentTime.value))
const activeTime = computed(() => {
  if (hourIndex.value >= 0) return times.value[hourIndex.value] ?? currentTime.value
  return currentTime.value
})
const stats = computed(() => rainStats(samples.value, hourIndex.value))
const areaKm2 = computed(() => (area.value ? bboxAreaKm2(area.value) : 0))
const rangeHint = computed(() => `Até ${MAX_RANGE_DAYS} dias, incluindo hoje.`)
const rangeError = computed(() => {
  if (startDate.value > endDate.value) return 'A data inicial deve ser anterior à final.'
  if (rangeDays(startDate.value, endDate.value) > MAX_RANGE_DAYS) {
    return `Escolha no máximo ${MAX_RANGE_DAYS} dias.`
  }
  if (endDate.value > today) return 'A data final não pode ser no futuro.'
  return ''
})
const legendStops = RAIN_STOPS.filter((stop) => stop.mm > 0).map((stop) => ({
  mm: stop.mm,
  css: `rgb(${stop.color[0]}, ${stop.color[1]}, ${stop.color[2]})`,
}))
const statusLabel = computed(() => {
  if (loading.value) return 'Consultando Open-Meteo…'
  if (!samples.value.length) return 'Mova o mapa para carregar a grade.'
  return `${samples.value.length} pontos · ${startDate.value} a ${endDate.value}`
})
const hint = computed(() => {
  if (selecting.value) return 'Arraste um retângulo no mapa para definir a área do relatório.'
  if (stats.value.max <= 0.05) return 'Pouca chuva neste horário. Navegue o período ou selecione outra área.'
  return 'O slider percorre o período escolhido. Selecione uma área para exportar a média em PDF.'
})

function flash(message: string, tone: 'success' | 'danger' | 'info' = 'info') {
  toast.value = message
  toastTone.value = tone
  window.setTimeout(() => {
    toast.value = ''
  }, 2600)
}

async function load(bounds: LatLngBoundsBox) {
  if (rangeError.value) {
    flash(rangeError.value, 'danger')
    return
  }
  abort?.abort()
  abort = new AbortController()
  loading.value = true
  try {
    const grid = buildRainGrid(bounds, 7, 7)
    const result = await fetchRainGrid(grid, {
      startDate: startDate.value,
      endDate: endDate.value,
      signal: abort.signal,
    })
    samples.value = result.samples
    times.value = result.times
    currentTime.value = result.currentTime
    const nextIndex = result.times.findIndex((time) => time === result.currentTime)
    hourIndex.value = nextIndex >= 0 ? nextIndex : result.times.length - 1
    lastBounds.value = bounds
    if (rainStats(result.samples, hourIndex.value).max <= 0.05) {
      const wet = wettestHourIndex(result.samples, result.times, result.currentTime)
      if (wet >= 0 && wet !== hourIndex.value) hourIndex.value = wet
    }
  } catch (error) {
    if ((error as { name?: string }).name === 'AbortError') return
    flash(error instanceof Error ? error.message : 'Falha ao buscar chuva.', 'danger')
  } finally {
    loading.value = false
  }
}

function onBounds(bounds: LatLngBoundsBox) {
  if (selecting.value) return
  window.clearTimeout(debounce)
  debounce = window.setTimeout(() => {
    void load(bounds)
  }, 450)
}

function applyPeriod() {
  const bounds = lastBounds.value ?? canvas.value?.currentBounds()
  if (bounds) void load(bounds)
}

function onHourInput(event: Event) {
  hourIndex.value = Number((event.target as HTMLInputElement).value)
}

function reload() {
  applyPeriod()
}

function toggleSelect() {
  selecting.value = !selecting.value
  if (selecting.value) flash('Arraste no mapa para marcar a área.', 'info')
}

function onArea(bounds: LatLngBoundsBox) {
  area.value = bounds
  selecting.value = false
  flash('Área selecionada. Gere o PDF quando quiser.', 'success')
}

function clearArea() {
  area.value = null
  selecting.value = false
}

async function openReport() {
  if (!area.value || rangeError.value) {
    flash(rangeError.value || 'Selecione uma área no mapa.', 'danger')
    return
  }
  reportLoading.value = true
  try {
    const grid = buildRainGrid(area.value, 6, 6)
    const series = await fetchDailyRain(grid, startDate.value, endDate.value)
    report.value = buildAreaReport(series, area.value, startDate.value, endDate.value)
    await nextTick()
    paintReportCharts()
  } catch (error) {
    flash(error instanceof Error ? error.message : 'Falha ao montar o relatório.', 'danger')
  } finally {
    reportLoading.value = false
  }
}

function paintReportCharts() {
  if (!report.value || !barChart.value || !lineChart.value) return
  const labels = report.value.dates.map((date) => date)
  drawBarChart(barChart.value, labels, report.value.dailyMean, 'Média diária na área (mm)')
  drawLineChart(lineChart.value, labels, report.value.cumulative, 'Acumulado médio (mm)')
}

watch(report, async (value) => {
  if (!value) return
  await nextTick()
  paintReportCharts()
})

async function downloadPdf() {
  if (!report.value || !reportEl.value) return
  pdfLoading.value = true
  try {
    await exportRainPdf(reportEl.value, report.value)
    flash('PDF exportado.', 'success')
  } catch {
    flash('Não foi possível gerar o PDF.', 'danger')
  } finally {
    pdfLoading.value = false
  }
}

onMounted(() => {
  refreshTimer = window.setInterval(() => {
    if (autoRefresh.value && !selecting.value) reload()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  abort?.abort()
  window.clearTimeout(debounce)
  if (refreshTimer) window.clearInterval(refreshTimer)
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
  max-width: 64ch;
  margin: 0.7rem 0 0;
  color: var(--ds-text-muted);
}

.hero-actions,
.toolbar,
.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: end;
}

.filters {
  display: grid;
  grid-template-columns: 160px 160px 1fr;
  gap: 0.8rem;
  align-items: end;
  margin-bottom: 1rem;
}

.meta,
.hint,
.note,
.source {
  margin: 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
}

.hint {
  margin-top: 0.8rem;
}

.slider {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  align-items: center;
  margin-top: 1rem;
  font-size: var(--ds-fs-sm);
  font-weight: 700;
}

.slider input {
  width: 100%;
  accent-color: var(--ds-accent);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 1rem;
  min-height: calc(100vh - 280px);
}

.side {
  display: grid;
  align-content: start;
  gap: 0.8rem;
}

.stats {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.stats li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: var(--ds-fs-sm);
}

.stats span {
  color: var(--ds-text-muted);
}

.legend {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.stop {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: var(--ds-fs-sm);
}

.stop i {
  width: 18px;
  height: 10px;
  border-radius: 999px;
}

.note,
.source {
  margin-top: 0.7rem;
}

.report {
  background: #fff;
  color: #0f172a;
  padding: 1rem;
  border-radius: 12px;
}

.report h3 {
  margin: 0 0 0.4rem;
}

.report canvas {
  width: 100%;
  height: auto;
  margin-top: 0.8rem;
}

.report .stats span {
  color: #64748b;
}

@media (max-width: 960px) {
  .hero,
  .workspace,
  .slider,
  .filters {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
