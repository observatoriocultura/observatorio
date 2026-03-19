<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const props = defineProps({
  pregunta: {
    type: Object,
    default: () => ({
      enunciado_1: 'Cargando...',
    }),
  },
  respuestas: {
    type: Array,
    default: () => [],
  },
})

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Extraer las categorías y los datos agrupados por respuesta_v2
  const uniqueCategories = [...new Set(props.respuestas.map((d) => d.respuesta_v2))]
  // Intenta ordenar numéricamente si es posible, sino queda el orden original
  uniqueCategories.sort((a, b) => {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return 0
  })

  const categories = uniqueCategories
  const data = uniqueCategories.map((cat) => {
    const matches = props.respuestas.filter((r) => r.respuesta_v2 === cat)
    return matches.reduce((sum, r) => sum + (parseFloat(r.porcentaje) || 0), 0)
  })

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bar',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      backgroundColor: 'transparent',
    },
    title: {
      text: props.pregunta.enunciado_1,
      style: {
        fontWeight: '800',
        color: '#32204a',
      },
    },
    subtitle: {
      text: null,
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
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#eef0f2',
      shadow: true,
    },
    plotOptions: {
      bar: {
        colorByPoint: false, // Desactivado para usar el color único de la serie
        borderRadius: 4,
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}%',
          style: {
            textOutline: 'none',
            color: '#5c6972',
          },
        },
      },
    },
    legend: {
      enabled: false, // En un gráfico de barras simple con una serie, solemos ocultar la leyenda
    },
    series: [
      {
        name: 'Porcentaje',
        color: '#D7C9E9',
        data: data,
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

// Observar cambios en las respuestas para redibujar el gráfico
watch(
  () => props.respuestas,
  () => {
    initChart()
  },
  { deep: true },
)

// Observar cambios en la pregunta para actualizar solo el título
watch(
  () => props.pregunta,
  (newPregunta) => {
    if (chartInstance && newPregunta) {
      chartInstance.setTitle({ text: newPregunta.enunciado_1 })
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="bar-chart-wrapper">
    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.bar-chart-wrapper {
  width: 100%;
  min-height: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
}

.highcharts-container {
  width: 100%;
  height: calc(100vh - 280px);
}
</style>
