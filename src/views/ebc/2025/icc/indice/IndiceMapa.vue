<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'

if (typeof HighchartsMap === 'function' && !Highcharts.MapChart) {
  HighchartsMap(Highcharts)
}

const props = defineProps({
  indices: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  iccData: { type: Array, default: () => [] },
})

const chartContainer = ref(null)
const geojson = ref(null)
const loadingMap = ref(true)
const selectedYear = ref(2025)
const selectedIndex = ref(null)
let chartInstance = null

const TOP_COLOR = '#DBF0E0'
const BOTTOM_COLOR = '#F3BEC4'
const DEFAULT_COLOR = '#FFF0C1'

const availableYears = computed(() => {
  const years = new Set()
  props.iccData.forEach((d) => {
    if (d['año'] !== null && d['año'] !== undefined) years.add(Number(d['año']))
  })
  return Array.from(years).sort((a, b) => b - a)
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
  () => props.indices,
  (indices) => {
    if (!indices.length || selectedIndex.value !== null) return
    const generalIndex = indices.find((idx) => idx.key === 'indice' || idx.cod === 0)
    selectedIndex.value = generalIndex ? generalIndex.cod : indices[0].cod
  },
  { immediate: true },
)

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
        <div class="controls-header">
          <p class="eyebrow mb-1">Mapa ICC</p>
          <h3 class="controls-title mb-0">Resultado por localidad</h3>
          <p class="controls-copy mb-0">Valores en escala 0 - 1.</p>
        </div>

        <div class="control-group">
          <label class="form-label" for="indice-map-year">Año</label>
          <select id="indice-map-year" v-model="selectedYear" class="form-select">
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label class="form-label" for="indice-map-index">Índice o subíndice</label>
          <select id="indice-map-index" v-model="selectedIndex" class="form-select">
            <option v-for="idx in sortedIndices" :key="idx.cod" :value="idx.cod">
              {{ idx.nombre_corto || idx.nombre }}
            </option>
          </select>
        </div>

        <div class="summary-box">
          <span class="summary-label">Bogotá D.C. total</span>
          <strong>{{ formatValue(bogotaValue) }}</strong>
        </div>

        <div class="legend-note">
          <span class="legend-swatch high"></span>
          <span>3 mayores</span>
          <span class="legend-swatch mid"></span>
          <span>Intermedias</span>
          <span class="legend-swatch low"></span>
          <span>3 menores</span>
        </div>
      </aside>

      <div class="map-panel card-premium">
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
          <p class="eyebrow mb-1">Resultados</p>
          <h3 class="results-title mb-0">{{ selectedIndexName }}</h3>
          <p class="results-copy mb-0">{{ selectedYear }}</p>
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
  grid-template-columns: 280px minmax(0, 1fr) 320px;
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
  padding: 1rem 1rem 0.8rem;
  border-bottom: 1px solid #edf0f2;
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

.controls-copy,
.results-copy {
  color: #6c757d;
  font-size: 0.84rem;
  margin-top: 0.25rem;
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
  grid-template-columns: auto 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 0.35rem;
  color: #5c6972;
  font-size: 0.76rem;
  font-weight: 700;
}

.legend-swatch {
  width: 16px;
  height: 10px;
  border-radius: 4px;
}

.legend-swatch.low {
  background: #dc3545;
}

.legend-swatch.mid {
  background: #d9cbea;
}

.legend-swatch.high {
  background: #28a745;
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
  padding: 0.65rem 0.75rem;
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
  background: rgba(40, 167, 69, 0.16);
}

.results-table tbody tr.row-middle {
  background: #d9cbea;
}

.results-table tbody tr.row-bottom {
  background: rgba(220, 53, 69, 0.16);
}

.results-table tbody tr.row-top:hover {
  background: rgba(40, 167, 69, 0.18);
}

.results-table tbody tr.row-middle:hover {
  background: #cbb8e2;
}

.results-table tbody tr.row-bottom:hover {
  background: rgba(220, 53, 69, 0.18);
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
