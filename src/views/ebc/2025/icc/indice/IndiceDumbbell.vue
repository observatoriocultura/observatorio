<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import Dumbbell from 'highcharts/modules/dumbbell'

// Inicializar módulos de Highcharts
if (typeof HighchartsMore === 'function') {
  HighchartsMore(Highcharts)
}
if (typeof Dumbbell === 'function') {
  Dumbbell(Highcharts)
}

const props = defineProps({
  datosPorLocalidad: { type: Array, default: () => [] },
  indices: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  iccData: { type: Array, default: () => [] },
})

const chartContainer = ref(null)
let chartInstance = null

// Estado de selección
const selectedIndex = ref(null)

// Si el eje X debe estar fijo en 0.25 - 0.75
const fixedAxisX = ref(true)

// Años disponibles en la data
const year1 = ref(2023)
const year2 = ref(2025)

const yearColors = {
  2021: '#D9CBEA',
  2023: '#8D6ABB',
  2025: '#FFCA28',
}

// Inicializar selección por defecto: el índice general (cod === 0)
watch(
  () => props.indices,
  (newIndices) => {
    if (newIndices.length > 0 && selectedIndex.value === null) {
      const generalIndex = newIndices.find((i) => i.cod === 0)
      selectedIndex.value = generalIndex ? generalIndex.cod : newIndices[0].cod
    }
  },
  { immediate: true },
)

const selectIndex = (cod) => {
  selectedIndex.value = cod
}

// Obtener nombre del índice seleccionado
const getIndexName = computed(() => {
  if (selectedIndex.value === null) return ''
  const idx = props.indices.find((i) => i.cod === selectedIndex.value)
  return idx ? idx.nombre_corto || idx.nombre : ''
})

// Filtrar la data para el gráfico
const chartData = computed(() => {
  if (selectedIndex.value === null || !props.localidades || !props.iccData) return []

  // Mapeamos todas las localidades, incluyendo Bogotá (cod: 22)
  return props.localidades
    .map((loc) => {
      const reg1 = props.iccData.find(
        (d) =>
          d.localidad_cod === loc.cod &&
          d.indice_cod === selectedIndex.value &&
          d.año === year1.value,
      )
      const reg2 = props.iccData.find(
        (d) =>
          d.localidad_cod === loc.cod &&
          d.indice_cod === selectedIndex.value &&
          d.año === year2.value,
      )

      const lowVal = reg1 ? parseFloat(reg1.valor.toFixed(3)) : null
      const highVal = reg2 ? parseFloat(reg2.valor.toFixed(3)) : null

      let lineCol = '#654096'
      if (lowVal !== null && highVal !== null) {
        if (highVal > lowVal)
          lineCol = '#28a745' // Verde si aumentó
        else if (highVal < lowVal) lineCol = '#dc3545' // Rojo si disminuyó
      }

      return {
        name: loc.nombre,
        low: lowVal,
        high: highVal,
        connectorColor: lineCol,
        connectorWidth: 2,
      }
    })
    .filter((d) => d.low !== null && d.high !== null) // Solo localidades que tienen ambos datos
})

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!chartContainer.value || chartData.value.length === 0) return

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'dumbbell',
      inverted: true,
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
    },
    title: {
      text: `Cambio en ${getIndexName.value}`,
      style: {
        fontWeight: '800',
        color: '#32204a',
      },
    },
    subtitle: {
      text: `Comparación entre ${year1.value} y ${year2.value}`,
      style: {
        color: '#212529',
        fontSize: '15px',
      },
    },
    tooltip: {
      shared: true,
      pointFormatter: function () {
        return `<b>${this.name}</b><br/>${year1.value}: <b>${this.low}</b><br/>${year2.value}: <b>${this.high}</b><br/>Diferencia: <b>${(this.high - this.low).toFixed(3)}</b>`
      },
    },
    xAxis: {
      type: 'category',
      labels: {
        style: {
          color: '#5c6972',
          fontWeight: '600',
        },
      },
    },
    yAxis: {
      title: {
        text: 'Valor del Índice',
        style: { color: '#8c96a0' },
      },
      gridLineColor: '#f1f3f5',
      min: fixedAxisX.value ? 0.25 : undefined,
      max: fixedAxisX.value ? 0.75 : undefined,
    },
    plotOptions: {
      series: {
        dataSorting: {
          enabled: true,
          sortKey: 'high', // Ordenado por año 2
        },
        lowMarker: {
          fillColor: yearColors[year1.value] || '#9C88B3', // '#F0ACAC' o color temático
        },
        color: yearColors[year2.value] || '#654096',
        dataLabels: [
          {
            enabled: true,
            format: '{point.high:.3f}', // Primer índice Highcharts (posicionado al lado del punto "high")
            style: { fontSize: '10px', fontWeight: '500' },
          },
          {
            enabled: true,
            format: '{point.low:.3f}', // Segundo índice Highcharts (posicionado al lado del punto "low")
            style: { fontSize: '10px', fontWeight: '500' },
          },
        ],
      },
    },
    series: [
      {
        name: 'Cambio',
        data: chartData.value,
        showInLegend: false,
      },
      {
        name: `Valor en ${year1.value}`,
        type: 'scatter',
        color: yearColors[year1.value] || '#9C88B3',
        marker: { symbol: 'circle' },
      },
      {
        name: `Valor en ${year2.value}`,
        type: 'scatter',
        color: yearColors[year2.value] || '#654096',
        marker: { symbol: 'circle' },
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
  }
})

// Redibujar gráfico si cambia la data, la selección, o los años elegidos
watch(
  [selectedIndex, year1, year2, fixedAxisX, chartData],
  () => {
    initChart()
  },
  { deep: true },
)
</script>

<template>
  <div class="indice-dumbbell">
    <div class="row g-4">
      <!-- Panel Lateral (Selector de Índice / Subíndice y Años) -->
      <div class="col-md-3">
        <div class="indices-sidebar shadow-sm rounded bg-white p-2 mb-3">
          <label class="sidebar-label mb-2 px-2">Años a comparar</label>
          <div class="px-2 mb-2">
            <div class="row g-2">
              <div class="col-6">
                <select class="form-select form-select-sm" v-model="year1">
                  <option :value="2021">2021</option>
                  <option :value="2023">2023</option>
                  <option :value="2025">2025</option>
                </select>
              </div>
              <div class="col-6">
                <select class="form-select form-select-sm" v-model="year2">
                  <option :value="2021">2021</option>
                  <option :value="2023">2023</option>
                  <option :value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>
          <div class="axis-control px-2 pt-2 mt-2">
            <div class="form-check form-switch mb-0">
              <input
                id="fixedAxisX"
                v-model="fixedAxisX"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="fixedAxisX">Fijar eje X</label>
            </div>
          </div>
        </div>

        <div class="indices-sidebar shadow-sm rounded bg-white p-2">
          <label class="sidebar-label mb-2 px-2">Índice y subíndices</label>
          <div class="list-group list-group-flush">
            <button
              v-for="idx in indices"
              :key="idx.cod"
              type="button"
              class="list-group-item list-group-item-action sidebar-item"
              :class="{ active: selectedIndex === idx.cod }"
              @click="selectIndex(idx.cod)"
            >
              <div class="d-flex w-100 justify-content-between align-items-center">
                <span class="indice-nombre" :class="{ 'fw-bold': idx.cod === 0 }">{{
                  idx.nombre || idx.nombre_corto
                }}</span>
                <i v-if="selectedIndex === idx.cod" class="bi bi-chevron-right small"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel Central (Gráfico) -->
      <main class="col-md-9">
        <div class="card-premium h-100 p-3 shadow-sm rounded bg-white">
          <div v-if="chartData.length === 0 && selectedIndex !== null" class="alert alert-warning">
            No hay datos suficientes para comparar {{ year1 }} y {{ year2 }} en el índice
            seleccionado.
          </div>
          <div
            ref="chartContainer"
            class="highcharts-container w-100"
            style="min-height: 600px"
          ></div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.indice-dumbbell {
  animation: fadeSlideIn 0.4s ease-out;
  padding: 1rem 0;
}

.indices-sidebar {
  position: sticky;
  top: 1rem;
}

.sidebar-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #adb5bd;
  letter-spacing: 0.1em;
}

.sidebar-item {
  border: none !important;
  border-radius: 8px !important;
  margin-bottom: 2px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background-color: #f8f9fa;
  color: var(--color-primary);
}

.sidebar-item.active {
  background-color: var(--color-primary-light) !important;
  color: var(--color-primary) !important;
  font-weight: 800;
}

.axis-control {
  border-top: 1px solid #f1f3f5;
  color: #495057;
  font-size: 0.82rem;
  font-weight: 600;
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

.highcharts-container {
  width: 100%;
}
</style>
