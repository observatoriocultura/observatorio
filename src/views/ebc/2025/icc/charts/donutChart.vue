<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const colorsPalette = ['#003366', '#00AEEF', '#F9A825', '#D32F2F', '#388E3C', '#7B1FA2']

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
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

  // Agrupar los valores de la suma_factor para cada categoría
  const uniqueCategories = [...new Set(props.respuestas.map((d) => d.respuesta_v2))]
  uniqueCategories.sort((a, b) => {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return 0
  })

  const serieData = uniqueCategories.map((cat) => {
    const matches = props.respuestas.filter((r) => r.respuesta_v2 === cat)
    return {
      name: cat,
      y: matches.reduce((sum, r) => sum + (parseFloat(r.suma_factor) || 0), 0),
    }
  })

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'pie',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      backgroundColor: 'transparent',
    },
    title: {
      text: props.title || props.pregunta.enunciado_1,
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
    colors: colorsPalette,
    tooltip: {
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{point.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.0f}</b> ({point.percentage:.1f}%)</td></tr>',
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
      pie: {
        innerSize: '60%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            textOutline: 'none',
            color: '#5c6972',
          },
        },
        showInLegend: true,
      },
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
      layout: 'horizontal',
      itemStyle: {
        color: '#5c6972',
        fontWeight: '600',
      },
      symbolRadius: 4,
    },
    series: [
      {
        name: 'Resultados',
        colorByPoint: true,
        data: serieData,
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

// Observar cambios en el título
watch(
  () => props.title,
  (newTitle) => {
    if (chartInstance && newTitle) {
      chartInstance.setTitle({ text: newTitle })
    }
  },
)

// Observar cambios en la pregunta como fallback
watch(
  () => props.pregunta,
  (newPregunta) => {
    if (chartInstance && newPregunta && !props.title) {
      chartInstance.setTitle({ text: newPregunta.enunciado_1 })
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="donut-chart-wrapper card-premium">
    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.donut-chart-wrapper {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
}

.highcharts-container {
  width: 100%;
  height: calc(100vh - 320px);
}
</style>
