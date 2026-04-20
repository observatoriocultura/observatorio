<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'
import IndiceSelector from './IndiceSelector.vue'
import { ICC_YEAR_COLORS } from '../constants.js'

if (typeof HighchartsMap === 'function' && !Highcharts.MapChart) {
  HighchartsMap(Highcharts)
}

const props = defineProps({
  indices: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  iccData: { type: Array, default: () => [] },
  modelValue: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue'])

const chartContainer = ref(null)
const geojson = ref(null)
const loadingMap = ref(true)
const selectedYear = ref(2025)
const selectedIndex = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
let chartInstance = null

const TOP_COLOR = '#83e69b'
const BOTTOM_COLOR = '#F3BEC4'
const DEFAULT_COLOR = '#E5E2EC'

const availableYears = computed(() => {
  const years = new Set()
  props.iccData.forEach((d) => {
    if (d['año'] !== null && d['año'] !== undefined) years.add(Number(d['año']))
  })
  return Array.from(years).sort((a, b) => a - b)
})

const sortedIndices = computed(() => {
  return [...props.indices].sort((a, b) => {
    if (a.key === 'indice') return -1
    if (b.key === 'indice') return 1
    return (a.num ?? a.cod) - (b.num ?? b.cod)
  })
})

const selectedIndexInfo = computed(() => {
  return sortedIndices.value.find((idx) => idx.cod === selectedIndex.value) || null
})

const selectedIndexName = computed(() => {
  return selectedIndexInfo.value?.nombre_corto || selectedIndexInfo.value?.nombre || 'ICC'
})

const bogotaValue = computed(() => {
  const record = props.iccData.find(
    (d) =>
      Number(d.localidad_cod) === 22 &&
      d.indice_cod === selectedIndex.value &&
      Number(d['año']) === selectedYear.value,
  )
  return record ? Number(record.valor) : null
})

const baseMapData = computed(() => {
  if (selectedIndex.value === null || !selectedYear.value) return []

  return props.localidades
    .filter((loc) => Number(loc.cod) !== 22)
    .map((loc) => {
      const record = props.iccData.find(
        (d) =>
          Number(d.localidad_cod) === Number(loc.cod) &&
          d.indice_cod === selectedIndex.value &&
          Number(d['año']) === selectedYear.value,
      )

      if (!record) return null

      const value = Number(record.valor)
      return {
        'hc-key': Number(loc.cod),
        value: Number(value.toFixed(3)),
        nombre: loc.nombre,
        indice: selectedIndexName.value,
        year: selectedYear.value,
      }
    })
    .filter(Boolean)
})

const highlightedKeys = computed(() => {
  const sortedDesc = [...baseMapData.value].sort((a, b) => b.value - a.value)
  const sortedAsc = [...baseMapData.value].sort((a, b) => a.value - b.value)

  return {
    top: new Set(sortedDesc.slice(0, 3).map((item) => item['hc-key'])),
    bottom: new Set(sortedAsc.slice(0, 3).map((item) => item['hc-key'])),
  }
})

const getHighlightType = (item) => {
  if (highlightedKeys.value.top.has(item['hc-key'])) return 'top'
  if (highlightedKeys.value.bottom.has(item['hc-key'])) return 'bottom'
  return 'middle'
}

const getHighlightColor = (item) => {
  const type = getHighlightType(item)
  if (type === 'top') return TOP_COLOR
  if (type === 'bottom') return BOTTOM_COLOR
  return DEFAULT_COLOR
}

const dataMap = computed(() => {
  return baseMapData.value.map((item) => ({
    ...item,
    color: getHighlightColor(item),
    highlightType: getHighlightType(item),
  }))
})

const rankedData = computed(() => {
  return [...dataMap.value].sort((a, b) => b.value - a.value)
})

const getRowClass = (item) => `row-${item.highlightType}`

const formatValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(3)
}

const initChart = async () => {
  await nextTick()

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!geojson.value || !chartContainer.value || dataMap.value.length === 0) return

  chartInstance = Highcharts.mapChart(chartContainer.value, {
    chart: {
      map: geojson.value,
      backgroundColor: 'transparent',
      height: 640,
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
    },
    title: { text: null },
    subtitle: { text: null },
    credits: { enabled: false },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom',
      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderRadius: 8,
      borderWidth: 0,
      shadow: true,
      useHTML: true,
      headerFormat: '',
      pointFormatter() {
        return `
          <div style="padding: 10px; min-width: 170px;">
            <div style="font-size: 14px; font-weight: 800; color: #32204a; margin-bottom: 8px; border-bottom: 1px solid #edf0f2; padding-bottom: 5px;">
              ${this.nombre}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${this.indice} · ${this.year}</div>
            <div>
              <span style="color: #64748b;">Valor:</span>
              <span style="font-weight: 800; color: #654096;">${formatValue(this.value)}</span>
            </div>
          </div>
        `
      },
    },
    series: [
      {
        data: dataMap.value,
        name: selectedIndexName.value,
        joinBy: ['CODIGO_LOC', 'hc-key'],
        nullColor: '#f1f3f5',
        borderColor: '#ffffff',
        borderWidth: 1,
        states: {
          hover: {
            color: '#FFCA28',
            borderColor: '#32204a',
            borderWidth: 2,
          },
        },
        dataLabels: {
          enabled: true,
          format: '{point.nombre}',
          style: {
            fontSize: '9px',
            fontWeight: '700',
            textOutline: 'none',
            color: '#343a40',
          },
        },
      },
    ],
  })
}



watch(
  availableYears,
  (years) => {
    if (!years.length) return
    if (!years.includes(selectedYear.value)) {
      selectedYear.value = years.includes(2025) ? 2025 : years[0]
    }
  },
  { immediate: true },
)

watch(
  [dataMap, geojson, selectedIndexInfo],
  () => {
    initChart()
  },
  { deep: true },
)

onMounted(async () => {
  try {
    loadingMap.value = true
    const baseUrl = import.meta.env.BASE_URL || '/'
    const response = await fetch(`${baseUrl}resources/maps/localidades_bogota_urbano.json`)
    if (!response.ok) throw new Error('No se pudo cargar el mapa')
    geojson.value = await response.json()
  } catch (error) {
    console.error('Error cargando el mapa GeoJSON:', error)
  } finally {
    loadingMap.value = false
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <div class="indice-mapa">
    <section class="map-shell">
      <aside class="map-controls card-premium">
        <div class="summary-box mb-1">
          <span class="summary-label">Bogotá D.C. total</span>
          <strong>{{ formatValue(bogotaValue) }}</strong>
        </div>

        <div class="control-group">
          <div class="year-toggle-group">
            <button
              v-for="year in availableYears"
              :key="year"
              type="button"
              class="year-toggle-btn"
              :class="{ active: selectedYear === year }"
              :style="selectedYear === year ? { background: ICC_YEAR_COLORS[year] || 'var(--color-primary)', color: '#212529' } : {}"
              @click="selectedYear = year"
            >
              {{ year }}
            </button>
          </div>
        </div>

        <div class="control-group index-selector-container">
          <IndiceSelector
            v-model="selectedIndex"
            :indices="sortedIndices"
            label="Índice o subíndice"
          />
        </div>
      </aside>

      <div class="map-panel card-premium">
        <div v-show="!loadingMap && dataMap.length > 0" class="map-legend-container">
          <div class="legend-note m-0 pt-0">
            <span class="legend-swatch high"></span>
            <span>3 mayores</span>
            <span class="legend-swatch mid"></span>
            <span>Intermedias</span>
            <span class="legend-swatch low"></span>
            <span>3 menores</span>
          </div>
        </div>

        <div v-if="loadingMap" class="map-state">
          <div class="spinner-grow text-primary mb-3"></div>
          <p class="text-muted mb-0">Cargando mapa...</p>
        </div>

        <div v-else-if="dataMap.length === 0" class="map-state">
          <div class="alert alert-light border text-center mb-0">
            No hay datos geográficos para el año e índice seleccionados.
          </div>
        </div>

        <div
          v-show="!loadingMap && dataMap.length > 0"
          ref="chartContainer"
          class="map-chart"
        ></div>
      </div>

      <aside class="results-panel card-premium">
        <div class="results-header">
          <h3 class="results-title mb-0" :title="selectedIndexName">{{ selectedIndexName }}</h3>
          <span class="results-copy mb-0">{{ selectedYear }}</span>
        </div>

        <div class="results-table-wrap">
          <table class="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Localidad</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in rankedData"
                :key="item['hc-key']"
                :class="getRowClass(item)"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ formatValue(item.value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.indice-mapa {
  animation: fadeSlideIn 0.4s ease-out;
  padding: 0.25rem 0;
}

.map-shell {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr) 300px;
  gap: 1rem;
  align-items: stretch;
}

.map-panel,
.map-controls,
.results-panel {
  background: #fff;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  box-shadow: 0 6px 22px rgba(33, 37, 41, 0.06);
}

.map-panel {
  min-height: 680px;
  padding: 1rem;
  position: relative;
}

.map-legend-container {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #edf0f2;
  box-shadow: 0 4px 12px rgba(33, 37, 41, 0.08);
}

.map-chart {
  width: 100%;
  height: 640px;
}

.map-state {
  display: grid;
  place-items: center;
  min-height: 640px;
  padding: 2rem;
}

.map-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.results-panel {
  display: flex;
  flex-direction: column;
  min-height: 680px;
  overflow: hidden;
}

.results-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #edf0f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.eyebrow {
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.controls-title,
.results-title {
  color: #212529;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
}

.results-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls-copy,
.results-copy {
  color: #6c757d;
  font-size: 0.84rem;
}

.controls-copy {
  margin-top: 0.25rem;
}

.results-copy {
  font-weight: 700;
  white-space: nowrap;
}

.control-group {
  display: grid;
  gap: 0.25rem;
}

.form-label {
  color: #495057;
  font-size: 0.76rem;
  font-weight: 800;
  margin-bottom: 0;
}

.form-select {
  border-color: #dfe3e6;
  border-radius: 8px;
  color: #212529;
  font-weight: 600;
}

.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.18rem rgba(101, 64, 150, 0.12);
}

.year-toggle-group {
  display: flex;
  background: #f8f9fa;
  border: 1px solid #dfe3e6;
  border-radius: 8px;
  overflow: hidden;
}

.year-toggle-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-right: 1px solid #dfe3e6;
  padding: 0.45rem 0;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-toggle-btn:last-child {
  border-right: none;
}

.year-toggle-btn:hover:not(.active) {
  background: #edf0f2;
  color: #495057;
}

.year-toggle-btn.active {
  color: #212529;
  font-weight: 800;
}

.index-selector-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-height: 200px;
  overflow: hidden;
}



.summary-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
  border-radius: 8px;
}

.summary-label {
  color: #5c6972;
  font-size: 0.8rem;
  font-weight: 700;
}

.summary-box strong {
  color: var(--color-primary);
  font-size: 1.35rem;
  line-height: 1;
}

.legend-note {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  row-gap: 0.6rem;
  column-gap: 0.5rem;
  color: #5c6972;
  font-size: 0.8rem;
  font-weight: 700;
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend-swatch.low {
  background: #F3BEC4;
}

.legend-swatch.mid {
  background: #E5E2EC;
}

.legend-swatch.high {
  background: #83e69b;
}

.results-table-wrap {
  overflow: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.results-table th,
.results-table td {
  padding: 0.35rem 0.75rem;
  border-bottom: 1px solid #edf0f2;
}

.results-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f8f9fa;
  color: #5c6972;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.results-table th:first-child,
.results-table td:first-child {
  width: 40px;
  color: #8c96a0;
  text-align: center;
}

.results-table th:last-child,
.results-table td:last-child {
  color: var(--color-primary);
  font-weight: 800;
  text-align: right;
}

.results-table tbody tr:hover {
  background: #f8f9fa;
}

.results-table tbody tr.row-top {
  background: #83e69b;
}

.results-table tbody tr.row-middle {
  background: #E5E2EC;
}

.results-table tbody tr.row-bottom {
  background: #F3BEC4;
}

.results-table tbody tr.row-top:hover {
  background: #5fd47d;
}

.results-table tbody tr.row-middle:hover {
  background: #D7D3E0;
}

.results-table tbody tr.row-bottom:hover {
  background: #e9b3ba;
}

.results-table tbody tr.row-top td:last-child {
  color: #146c2e;
}

.results-table tbody tr.row-bottom td:last-child {
  color: #a71d2a;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1100px) {
  .map-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .results-panel {
    grid-column: 1 / -1;
    min-height: 0;
  }
}

@media (max-width: 800px) {
  .map-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .map-panel {
    min-height: 520px;
    padding: 0.5rem;
  }

  .map-chart,
  .map-state {
    height: 500px;
    min-height: 500px;
  }
}
</style>
