<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
// Opcional: Cargar módulos adicionales si se necesitan (ej. Exporting)
// import Exporting from 'highcharts/modules/exporting';
// Exporting(Highcharts);

import { inject } from 'vue'
import { getPaletaColor as defaultGetPaletaColor } from '../constants.js'

const surveyConstants = inject('surveyConstants', {})
const getPaletaColor = surveyConstants.getPaletaColor || defaultGetPaletaColor

const props = defineProps({
  title: {
    type: String,
    default: 'Gráfico de Resultados',
  },
  subtitle: {
    type: String,
    default: 'Fuente: Observatorio de Cultura',
  },
  pregunta: {
    type: Object,
    default: () => ({
      dataviz_palette: null,
    }),
  },
  type: {
    type: String,
    default: 'column', // 'column', 'bar', 'pie', 'line', etc.
  },
  series: {
    type: Array,
    default: () => [],
  },
  categorias: {
    type: Array,
    default: () => [],
  },
})

const chartContainer = ref(null)
let chartInstance = null

const normalizeAnswer = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const getPointValue = (point) => {
  if (typeof point === 'number') return point
  if (point && typeof point === 'object') return Number(point.y) || 0
  return 0
}

const getAnswerOrder = (value) => {
  const normalizedValue = normalizeAnswer(value)
  if (normalizedValue === 'si') return 0
  if (normalizedValue === 'no') return 1
  return 2
}

const getOrderedSeries = (series) => {
  return series
    .map((serie, index) => ({ serie, index }))
    .sort(
      (a, b) => getAnswerOrder(a.serie.name) - getAnswerOrder(b.serie.name) || a.index - b.index,
    )
    .map(({ serie }) => serie)
}

const getSortedChartData = () => {
  const yesSeries = props.series.find((serie) => normalizeAnswer(serie.name) === 'si')

  if (!yesSeries) {
    return {
      categorias: props.categorias,
      series: getOrderedSeries(props.series),
    }
  }

  const sortedIndexes = props.categorias
    .map((_, index) => {
      const total = props.series.reduce((sum, serie) => sum + getPointValue(serie.data?.[index]), 0)
      const yesValue = getPointValue(yesSeries.data?.[index])
      return {
        index,
        percentage: total > 0 ? (yesValue / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
    .map((item) => item.index)

  return {
    categorias: sortedIndexes.map((index) => props.categorias[index]),
    series: getOrderedSeries(
      props.series.map((serie) => ({
        ...serie,
        data: sortedIndexes.map((index) => serie.data?.[index] ?? 0),
      })),
    ),
  }
}

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Obtener la paleta de colores según la configuración de la pregunta
  const currentPalette = getPaletaColor(props.pregunta?.dataviz_palette)
  const sortedChartData = getSortedChartData()

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bar',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      backgroundColor: 'transparent',
    },
    title: {
      text: props.title,
      style: {
        fontWeight: '800',
        color: '#32204a',
      },
    },
    subtitle: {
      text: props.subtitle,
      style: {
        color: '#212529',
        fontSize: '15px',
        fontWeight: '500',
      },
    },
    credits: {
      enabled: false,
    },
    colors: currentPalette,
    xAxis: {
      categories: sortedChartData.categorias,
      crosshair: true,
      labels: {
        style: { color: '#5c6972' },
      },
    },
    yAxis: {
      min: 0,
      reversedStacks: false,
      title: {
        text: 'Porcentaje (%)',
        style: { color: '#8c96a0' },
      },
      labels: {
        style: { color: '#5c6972' },
      },
      gridLineColor: '#f1f3f5',
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
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
        stacking: 'percent',
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.1f}%',
          style: { textOutline: 'none' },
        },
      },
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        borderRadius: 4,
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        },
      },
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
      layout: 'horizontal',
      reversed: false,
      itemStyle: {
        color: '#5c6972',
        fontWeight: '600',
      },
      symbolRadius: 4,
    },
    series: sortedChartData.series,
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

// Reaccionar a cambios en las props para redibujar si es necesario
watch(
  () => props.type,
  () => {
    initChart()
  },
)

watch(
  () => props.title,
  () => {
    if (chartInstance) {
      chartInstance.setTitle({ text: props.title })
    }
  },
)
watch(
  () => props.series,
  () => {
    initChart()
  },
  { deep: true },
)

watch(
  () => props.categorias,
  () => {
    initChart()
  },
  { deep: true },
)
</script>

<template>
  <div class="icc-chart-wrapper card-premium">
    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.icc-chart-wrapper {
  font-family: 'Inter', sans-serif;
  width: 100%;
  min-height: 400px;
  padding: 1rem;
}

.highcharts-container {
  width: 100%;
  min-height: calc(100vh - 280px);
}
</style>
