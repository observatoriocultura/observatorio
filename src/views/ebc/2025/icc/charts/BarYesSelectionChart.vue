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
const SELECTION_ANSWER_CANDIDATES = ['Sí', 'De acuerdo', 'Seleccionado']
const SMALL_SELECTION_LABEL_THRESHOLD = 3

const normalizeAnswer = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const NORMALIZED_SELECTION_ANSWER_CANDIDATES = SELECTION_ANSWER_CANDIDATES.map((answer) =>
  normalizeAnswer(answer),
)

const getSelectionAnswerPriority = (value) => {
  return NORMALIZED_SELECTION_ANSWER_CANDIDATES.indexOf(normalizeAnswer(value))
}

const findSelectionSeries = () => {
  return props.series
    .map((serie) => ({
      serie,
      priority: getSelectionAnswerPriority(serie.name),
    }))
    .filter(({ priority }) => priority !== -1)
    .sort((a, b) => a.priority - b.priority)
    .map(({ serie }) => serie)[0]
}

const getPointValue = (point) => {
  if (typeof point === 'number') return point
  if (point && typeof point === 'object') return Number(point.y) || 0
  return 0
}

const getAnswerOrder = (value) => {
  const normalizedValue = normalizeAnswer(value)
  const selectionPriority = getSelectionAnswerPriority(normalizedValue)
  if (selectionPriority !== -1) return selectionPriority
  if (normalizedValue === 'no') return SELECTION_ANSWER_CANDIDATES.length
  return SELECTION_ANSWER_CANDIDATES.length + 1
}

const getOrderedSeries = (series) => {
  return series
    .map((serie, index) => ({ serie, index }))
    .sort(
      (a, b) => getAnswerOrder(a.serie.name) - getAnswerOrder(b.serie.name) || a.index - b.index,
    )
    .map(({ serie }) => serie)
}

const buildSelectionPoint = (value, percentage) => ({
  y: value,
  dataLabels:
    percentage < SMALL_SELECTION_LABEL_THRESHOLD
      ? {
          inside: false,
          align: 'left',
          x: 8,
          style: {
            color: undefined,
            textOutline: 'none',
          },
        }
      : {
          inside: true,
          align: 'center',
          x: 0,
          style: {
            color: '#ffffff',
            textOutline: 'none',
          },
        },
})

const getSortedChartData = () => {
  const selectionSeries = findSelectionSeries()

  if (!selectionSeries) {
    return {
      categorias: props.categorias,
      series: getOrderedSeries(props.series),
      selectionAnswer: null,
    }
  }

  const normalizedSelectionAnswer = normalizeAnswer(selectionSeries.name)
  const sortedIndexes = props.categorias
    .map((_, index) => {
      const total = props.series.reduce((sum, serie) => sum + getPointValue(serie.data?.[index]), 0)
      const selectionValue = getPointValue(selectionSeries.data?.[index])
      return {
        index,
        selectionValue,
        percentage: total > 0 ? (selectionValue / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  return {
    categorias: sortedIndexes.map((item) => props.categorias[item.index]),
    series: getOrderedSeries(
      props.series.map((serie) => ({
        ...serie,
        data: sortedIndexes.map((item) => {
          const value = serie.data?.[item.index] ?? 0

          if (normalizeAnswer(serie.name) !== normalizedSelectionAnswer) {
            return value
          }

          return buildSelectionPoint(value, item.percentage)
        }),
      })),
    ),
    selectionAnswer: selectionSeries.name,
  }
}

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Obtener la paleta de colores según la configuración de la pregunta
  const currentPalette = getPaletaColor(props.pregunta?.dataviz_palette)
  const sortedChartData = getSortedChartData()
  const normalizedSelectionAnswer = normalizeAnswer(sortedChartData.selectionAnswer)

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
      shared: true,
      useHTML: true,
      formatter() {
        const selectionPoint = this.points?.find(
          (point) => normalizeAnswer(point.series.name) === normalizedSelectionAnswer,
        )

        if (!selectionPoint) {
          return false
        }

        return `
          <div>
            <div style="color:${selectionPoint.color}">
              ${selectionPoint.series.name}: <b>${Highcharts.numberFormat(selectionPoint.percentage, 1)}%</b>
            </div>
            <div>
              Estimado población: <b>${Highcharts.numberFormat(selectionPoint.y, 0)}</b>
            </div>
          </div>
        `
      },
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
          allowOverlap: true,
          crop: false,
          overflow: 'allow',
          formatter() {
            if (normalizeAnswer(this.series.name) !== normalizedSelectionAnswer) return null
            return `${Highcharts.numberFormat(this.point.percentage, 1)}%`
          },
          style: {
            color: '#ffffff',
            textOutline: 'none',
          },
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
      enabled: false,
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
