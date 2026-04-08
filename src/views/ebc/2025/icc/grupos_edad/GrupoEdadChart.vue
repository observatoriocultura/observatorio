<script setup>
import { ref, watch, onMounted, onUnmounted, inject } from 'vue'
import Highcharts from 'highcharts'
import { getPaletaColor as defaultGetPaletaColor } from '../constants.js'

const surveyConstants = inject('surveyConstants', {})
const getPaletaColor = surveyConstants.getPaletaColor || defaultGetPaletaColor

const props = defineProps({
  preguntaSeleccionada: {
    type: Object,
    default: () => ({}),
  },
  variableSeleccionada: {
    type: Object,
    default: () => null,
  },
  respuestaSeleccionada: {
    type: String,
    default: '',
  },
  tablaAgrupada: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const dataForChart = props.tablaAgrupada
  if (!dataForChart || dataForChart.length === 0 || !chartContainer.value) return

  const categories = dataForChart.map((d) => d.nombre)
  const data = dataForChart.map((d) => parseFloat(d.porcentaje.toFixed(1)))

  const variableStr = props.variableSeleccionada
    ? props.variableSeleccionada.enunciado_2 || props.variableSeleccionada.codigo_variable
    : ''
  const respuestaStr = props.respuestaSeleccionada || ''

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'column',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      backgroundColor: 'transparent',
    },
    title: {
      text: `${variableStr} :: ${respuestaStr}`,
      style: {
        fontWeight: '800',
        color: '#32204a',
        fontSize: '1.1rem',
      },
    },
    subtitle: {
      text: props.preguntaSeleccionada.enunciado_1 || '',
      style: { color: '#8c96a0' },
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: categories,
      labels: {
        style: {
          color: '#5c6972',
          fontWeight: '600',
        },
      },
    },
    yAxis: {
      title: {
        text: 'Porcentaje (%)',
        style: { color: '#8c96a0' },
      },
      labels: {
        format: '{value}',
        style: { color: '#5c6972' },
      },
      gridLineColor: '#f1f3f5',
      max: 100,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}%</b><br/>',
      shared: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#eef0f2',
      shadow: true,
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        borderRadius: 8,
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}%',
          style: {
            textOutline: 'none',
            color: '#32204a',
            fontWeight: '700'
          },
        },
      },
    },
    colors: getPaletaColor(props.preguntaSeleccionada?.dataviz_palette),
    legend: {
      enabled: false,
    },
    series: [
      {
        name: 'Porcentaje',
        data: data,
      },
    ],
  })
}

watch(
  () => props.tablaAgrupada,
  () => {
    initChart()
  },
  { deep: true },
)

onMounted(() => {
  setTimeout(() => {
    initChart()
  }, 100)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<template>
  <div class="grupo-edad-chart">
    <div v-if="loading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="tablaAgrupada.length === 0" class="alert alert-light border m-4 text-center">
       No hay datos para graficar con la selección actual.
    </div>

    <section v-show="!loading && tablaAgrupada.length > 0" class="section-chart">
      <div class="chart-wrapper card-premium">
        <div ref="chartContainer" class="highcharts-container"></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 450px;
  padding: 1rem;
}

.highcharts-container {
  width: 100%;
  height: 450px;
}
</style>
