<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import IndiceSelector from './IndiceSelector.vue'

if (typeof HighchartsMore === 'function') {
  HighchartsMore(Highcharts)
}

const props = defineProps({
  indices: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  iccData: { type: Array, default: () => [] },
  modelValue: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue'])

const chartContainer = ref(null)
let chartInstance = null

const yearX = 2023
const yearY = 2025

const selectedIndex = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
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
  return (
    selectedIndexInfo.value?.nombre ||
    selectedIndexInfo.value?.nombre_corto ||
    'Índice de Cultura Ciudadana'
  )
})

const formatValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/D'
  return Number(value).toFixed(3)
}

const formatPopulation = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/D'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(value))
}

const getValue = (localidadCod, year) => {
  const record = props.iccData.find(
    (d) =>
      Number(d.localidad_cod) === Number(localidadCod) &&
      d.indice_cod === selectedIndex.value &&
      Number(d['año']) === year,
  )

  return record ? Number(record.valor) : null
}

const chartData = computed(() => {
  if (selectedIndex.value === null) return []

  return props.localidades
    .map((loc) => {
      const valueX = getValue(loc.cod, yearX)
      const valueY = getValue(loc.cod, yearY)
      const population = Number(loc.poblacion)

      if (valueX === null || valueY === null || !Number.isFinite(population) || population <= 0) {
        return null
      }

      const diff = valueY - valueX

      return {
        name: loc.nombre,
        x: Number(valueX.toFixed(3)),
        y: Number(valueY.toFixed(3)),
        z: Math.round(population),
        poblacion: population,
        diferencia: diff,
        color: diff >= 0 ? '#83E69B' : 'rgba(220, 53, 69, 0.58)',
        marker: {
          lineColor: diff >= 0 ? '#1e7e34' : '#bd2130',
          lineWidth: 1,
        },
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.z - a.z)
})

const axisRange = computed(() => {
  const values = chartData.value.flatMap((point) => [point.x, point.y])
  if (!values.length) return { min: 0.25, max: 0.75 }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.12, 0.02)

  return {
    min: Math.max(0, Number((min - padding).toFixed(2))),
    max: Math.min(1, Number((max + padding).toFixed(2))),
  }
})

const decreasedCount = computed(() => {
  return chartData.value.filter((point) => point.diferencia < 0).length
})

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!chartContainer.value || chartData.value.length === 0) return

  const { min, max } = axisRange.value

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bubble',
      plotBorderWidth: 1,
      zooming: { type: 'xy' },
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    title: {
      text: `Comparación en ${selectedIndexName.value}`,
      style: {
        fontWeight: '800',
        color: '#32204a',
      },
    },
    subtitle: {
      text: `${yearX} en eje X · ${yearY} en eje Y · tamaño por población`,
      style: {
        color: '#212529',
        fontSize: '15px',
      },
    },
    xAxis: {
      min,
      max,
      gridLineWidth: 1,
      gridLineColor: '#f1f3f5',
      title: {
        text: `Valor del índice en ${yearX}`,
        style: { color: '#8c96a0' },
      },
      labels: {
        format: '{value:.2f}',
        style: {
          color: '#5c6972',
          fontWeight: '600',
        },
      },
    },
    yAxis: {
      min,
      max,
      startOnTick: false,
      endOnTick: false,
      gridLineColor: '#f1f3f5',
      title: {
        text: `Valor del índice en ${yearY}`,
        style: { color: '#8c96a0' },
      },
      labels: {
        format: '{value:.2f}',
        style: {
          color: '#5c6972',
          fontWeight: '600',
        },
      },
      plotLines: [
        {
          value: 0,
          width: 0,
        },
      ],
    },
    tooltip: {
      useHTML: true,
      borderWidth: 0,
      borderRadius: 8,
      shadow: true,
      headerFormat: '',
      pointFormatter() {
        const diff = Number(this.diferencia)
        const diffText = `${diff >= 0 ? '+' : ''}${diff.toFixed(3)}`

        return `
          <div style="padding: 10px; min-width: 190px;">
            <div style="font-size: 14px; font-weight: 800; color: #32204a; margin-bottom: 8px; border-bottom: 1px solid #edf0f2; padding-bottom: 5px;">
              ${this.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${selectedIndexName.value}</div>
            <div><span style="color:#64748b;">${yearX}:</span> <b>${formatValue(this.x)}</b></div>
            <div><span style="color:#64748b;">${yearY}:</span> <b>${formatValue(this.y)}</b></div>
            <div><span style="color:#64748b;">Diferencia:</span> <b>${diffText}</b></div>
            <div><span style="color:#64748b;">Población:</span> <b>${formatPopulation(this.poblacion)}</b></div>
          </div>
        `
      },
    },
    plotOptions: {
      bubble: {
        minSize: 12,
        maxSize: 72,
        zMin: 0,
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          allowOverlap: false,
          style: {
            color: '#343a40',
            fontSize: '10px',
            fontWeight: '700',
            textOutline: 'none',
          },
        },
      },
      series: {
        animation: {
          duration: 450,
        },
      },
    },
    series: [
      {
        type: 'line',
        name: 'Sin cambio',
        data: [
          [min, min],
          [max, max],
        ],
        color: '#8c96a0',
        dashStyle: 'Dash',
        marker: {
          enabled: false,
        },
        enableMouseTracking: false,
        showInLegend: false,
      },
      {
        name: 'Localidades',
        data: chartData.value,
      },
    ],
  })
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

watch(
  [selectedIndex, chartData],
  () => {
    initChart()
  },
  { deep: true },
)
</script>

<template>
  <div class="indice-bubbles">
    <div class="row g-4">
      <div class="col-md-3">
        <div class="indices-sidebar shadow-sm rounded bg-white p-2">
          <IndiceSelector
            v-model="selectedIndex"
            :indices="sortedIndices"
            label="Índice o subíndice"
          />
        </div>

        <div class="bubble-notes shadow-sm rounded bg-white p-3 mt-3">
          <div class="note-row">
            <span class="note-dot up"></span>
            <span>Mayor valor en 2025</span>
          </div>
          <div class="note-row">
            <span class="note-dot down"></span>
            <span>Menor valor en 2025</span>
          </div>
          <div class="note-row">
            <span class="note-size"></span>
            <span>Tamaño por población</span>
          </div>
        </div>
      </div>

      <main class="col-md-6">
        <div class="card-premium h-100 p-3 shadow-sm rounded bg-white">
          <div v-if="chartData.length === 0 && selectedIndex !== null" class="alert alert-warning">
            No hay datos suficientes de 2023, 2025 y población para el índice seleccionado.
          </div>
          <div class="bubble-chart-wrap">
            <div ref="chartContainer" class="highcharts-container w-100"></div>
          </div>
        </div>
      </main>

      <aside class="col-md-3">
        <div class="reading-panel shadow-sm rounded bg-white p-3">
          <h3 class="reading-title">Lectura del gráfico</h3>
          <ul class="reading-list">
            <li>
              <span class="reading-marker base"></span>
              <span>Cada burbuja representa una <strong>localidad</strong>.</span>
            </li>
            <li>
              <span class="reading-marker axis"></span>
              <span>
                El eje <strong>X</strong> muestra el valor en <strong>2023</strong> y el eje
                <strong>Y</strong> el valor en <strong>2025</strong>.
              </span>
            </li>
            <li>
              <span class="reading-marker up"></span>
              <span>
                Si la burbuja queda <strong>por encima de la diagonal</strong>, el valor fue mayor
                en 2025.
              </span>
            </li>
            <li>
              <span class="reading-marker down"></span>
              <span>
                Si queda <strong>por debajo de la diagonal</strong>, el valor disminuyó frente a
                2023.
              </span>
            </li>
            <li>
              <span class="reading-marker size"></span>
              <span>El <strong>tamaño</strong> de la burbuja corresponde a la población.</span>
            </li>
          </ul>
          <p class="reading-note">
            Para 2025
            <strong class="reading-note-count">{{ decreasedCount }}</strong> localidades
            disminuyeron el valor
            <span v-if="selectedIndex == 0">del </span>
            <span v-else>del subíndice de </span>
            <strong>{{ selectedIndexName }}</strong
            >.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.indice-bubbles {
  animation: fadeSlideIn 0.4s ease-out;
  padding: 1rem 0;
}

.indices-sidebar {
  position: sticky;
  top: 1rem;
  max-height: 70vh;
  overflow: hidden;
}

.bubble-notes {
  color: #495057;
  font-size: 0.82rem;
  font-weight: 700;
}

.reading-panel {
  position: sticky;
  top: 1rem;
  color: #495057;
}

.reading-title {
  color: #32204a;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 0.65rem;
}

.reading-list {
  display: grid;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.reading-list li {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 0.55rem;
  align-items: start;
  font-size: 0.88rem;
  line-height: 1.55;
}

.reading-list strong {
  color: #32204a;
  font-weight: 800;
}

.reading-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 0.33rem;
}

.reading-marker.base {
  background: #e5e2ec;
  border: 1px solid #654096;
}

.reading-marker.axis {
  background: #ffca28;
  border: 1px solid #d39e00;
}

.reading-marker.up {
  background: #83e69b;
  border: 1px solid #1e7e34;
}

.reading-marker.down {
  background: rgba(220, 53, 69, 0.72);
  border: 1px solid #bd2130;
}

.reading-marker.size {
  width: 16px;
  height: 16px;
  background: #f8f9fa;
  border: 2px solid #8c96a0;
  margin-left: -2px;
  margin-top: 0.23rem;
}

.reading-note {
  margin: 1rem 0 0;
  padding-top: 0.9rem;
  border-top: 1px solid #edf0f2;
  color: #5c6972;
  font-size: 0.9rem;
  line-height: 1.5;
}

.reading-note strong {
  color: #32204a;
  font-weight: 800;
}

.reading-note-count {
  color: #dc3545;
}

.note-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.25rem 0;
}

.note-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
}

.note-dot.up {
  background: rgba(40, 167, 69, 0.72);
  border: 1px solid #1e7e34;
}

.note-dot.down {
  background: rgba(220, 53, 69, 0.72);
  border: 1px solid #bd2130;
}

.note-size {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e5e2ec;
  border: 1px solid #654096;
}

.highcharts-container {
  width: 100%;
  height: 100%;
}

.bubble-chart-wrap {
  width: min(100%, 620px, calc(100vh - 190px));
  height: min(620px, calc(100vh - 190px));
  aspect-ratio: 1 / 1;
  min-height: 440px;
  margin: 0 auto;
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

@media (max-width: 800px) {
  .bubble-chart-wrap {
    width: min(100%, calc(100vh - 170px));
    height: min(520px, calc(100vh - 170px));
    min-height: 380px;
  }

  .reading-panel {
    position: static;
  }
}
</style>
