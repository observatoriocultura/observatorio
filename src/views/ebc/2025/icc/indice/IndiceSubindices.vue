<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Highcharts from 'highcharts'

const props = defineProps({
  datosPorLocalidad: { type: Array, default: () => [] },
  indices: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  numPeriodos: { type: Number, default: 0 },
  iccData: { type: Array, default: () => [] },
})

const selectedLocalidad = ref('')
const chartContainer = ref(null)
let chartInstance = null

/** Subíndices (excluye el índice general cod=0) */
const subindices = computed(() => props.indices.filter((i) => i.cod !== 0))

/** Años únicos ordenados ascendente para la progresión en el tiempo */
const años = computed(() => {
  const set = new Set()
  props.iccData.forEach((d) => set.add(d.año))
  return Array.from(set).sort((a, b) => a - b)
})

/** Categorías del eje X */
const categories = computed(() => subindices.value.map((i) => i.nombre_corto))

function renderChart() {
  if (!chartContainer.value || !subindices.value.length || !años.value.length) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const locCod = selectedLocalidad.value === '' ? 22 : Number(selectedLocalidad.value)
  const locNombre =
    selectedLocalidad.value === ''
      ? 'Bogotá (Total)'
      : props.localidades.find((l) => l.cod === locCod)?.nombre || 'Localidad'

  // Preparar series (una por cada año)
  const seriesData = años.value.map(año => {
    return {
      name: `Año ${año}`,
      data: subindices.value.map(idx => {
        const registro = props.iccData.find(
          (d) => d.localidad_cod === locCod && d.indice_cod === idx.cod && d.año === año
        )
        const val = registro ? registro.valor : 0
        // Retornamos el valor truncado/redondeado o 0 si no existe
        return Number(val.toFixed(4))
      })
    }
  })

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'column',
      height: 500
    },
    title: {
      text: `Resultados Históricos Subíndices - ${locNombre}`
    },
    subtitle: {
      text: 'Comparativa de las dimensiones del ICC por periodo de medición'
    },
    xAxis: {
      categories: categories.value,
      title: {
        text: null
      },
      gridLineWidth: 1,
      lineWidth: 0,
       labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      min: 0,
      max: 1, // El índice se mueve entre 0 y 1
      title: {
        text: 'Valor del Índice (0 - 1)',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      gridLineWidth: 1
    },
    tooltip: {
      valueDecimals: 4,
      shared: true
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        dataLabels: {
          enabled: false // Desactivado por defecto para no saturar, el tooltip ayuda
        },
        groupPadding: 0.1
      }
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      floating: false,
      borderWidth: 1,
      backgroundColor: 'var(--highcharts-background-color, #ffffff)',
      shadow: true
    },
    credits: {
      enabled: false
    },
    series: seriesData,
    responsive: {
      rules: [{
        condition: {
          maxWidth: 600
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          },
          xAxis: {
            labels: {
              rotation: -45,
              step: 1
            }
          }
        }
      }]
    }
  })
}

onMounted(() => {
  if (props.iccData.length && props.indices.length) {
    renderChart()
  }
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

watch(selectedLocalidad, () => {
  renderChart()
})

watch(
  () => [props.iccData, props.indices],
  () => {
    if (props.iccData.length && props.indices.length) {
      renderChart()
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="indice-subindices">
    <div class="filter-section mb-4">
      <div class="filter-group">
        <label for="localidad-select" class="form-label">Localidad:</label>
        <select id="localidad-select" class="form-select" v-model="selectedLocalidad">
          <option value="">Bogotá (Total)</option>
          <option v-for="loc in localidades" :key="loc.cod" :value="loc.cod">
            {{ loc.nombre }}
          </option>
        </select>
      </div>
    </div>

    <div class="chart-section shadow-sm p-3 bg-white rounded">
      <div ref="chartContainer" class="highcharts-container"></div>
    </div>
  </div>
</template>

<style scoped>
.indice-subindices {
  padding: 1rem;
}

.filter-section {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #495057;
}

.chart-section {
  width: 100%;
}

.highcharts-container {
  width: 100%;
}

@media (max-width: 600px) {
  .filter-group {
    min-width: 100%;
  }
}
</style>
