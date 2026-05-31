<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import { getPaletaColor as defaultGetPaletaColor } from '../constants.js'

const surveyConstants = inject('surveyConstants', {})
const getPaletaColor = surveyConstants.getPaletaColor || defaultGetPaletaColor

const props = defineProps({
  title: {
    type: String,
    default: 'Grafico de Resultados',
  },
  subtitle: {
    type: String,
    default: '',
  },
  pregunta: {
    type: Object,
    default: () => ({
      enunciado_1: 'Cargando...',
      dataviz_palette: null,
    }),
  },
  variables: {
    type: Array,
    default: () => [],
  },
  respuestas: {
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

const MIN_CHART_HEIGHT = 520
const CHART_VERTICAL_CHROME = 180
const HEIGHT_PER_CATEGORY = 48

const calcularPromedioPonderado = (listaRespuestas) => {
  let sumaPonderada = 0
  let sumaFactores = 0

  listaRespuestas.forEach((respuesta) => {
    const valor = parseFloat(respuesta.respuesta_number)
    const factor = parseFloat(respuesta.suma_factor)

    if (!Number.isNaN(valor) && !Number.isNaN(factor)) {
      sumaPonderada += valor * factor
      sumaFactores += factor
    }
  })

  return sumaFactores > 0 ? sumaPonderada / sumaFactores : null
}

const unidadMedida = computed(() => {
  return props.variables.find((variable) => variable.unidad_medida)?.unidad_medida || ''
})

const chartData = computed(() => {
  return props.variables
    .map((variable, index) => {
      const respuestasVariable = props.respuestas.filter(
        (respuesta) => respuesta.indice_variable === variable.indice_variable,
      )
      const promedio =
        variable.promedio_ponderado ?? calcularPromedioPonderado(respuestasVariable)
      const valor = promedio === null || promedio === undefined ? null : Number(promedio)

      return {
        name: props.categorias[index] || variable.enunciado_2 || variable.codigo_variable,
        y: Number.isFinite(valor) ? valor : null,
        sumaFactor: variable.suma_factor || 0,
        unidadMedida: variable.unidad_medida || unidadMedida.value,
      }
    })
    .sort((a, b) => {
      if (a.y === null && b.y === null) return 0
      if (a.y === null) return 1
      if (b.y === null) return -1
      return b.y - a.y
    })
})

const formatValue = (value, decimals = 2) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'Sin dato'
  return Highcharts.numberFormat(Number(value), decimals, ',', '.')
}

const getAxisMax = () => {
  const max = Number(props.pregunta?.dataviz_max)
  return Number.isFinite(max) ? max : undefined
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const initChart = () => {
  destroyChart()

  if (!chartContainer.value || chartData.value.length === 0) return

  const currentPalette = getPaletaColor(props.pregunta?.dataviz_palette)
  const seriesColor = currentPalette[0] || '#5d4294'
  const chartHeight = Math.max(
    MIN_CHART_HEIGHT,
    chartData.value.length * HEIGHT_PER_CATEGORY + CHART_VERTICAL_CHROME,
  )

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bar',
      height: chartHeight,
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
      text: props.subtitle || props.pregunta?.enunciado_1 || '',
      style: {
        color: '#212529',
        fontSize: '15px',
        fontWeight: '500',
      },
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: chartData.value.map((item) => item.name),
      crosshair: true,
      labels: {
        style: {
          color: '#5c6972',
          fontWeight: '600',
        },
      },
    },
    yAxis: {
      min: 0,
      max: getAxisMax(),
      tickInterval: 1,
      title: {
        text: unidadMedida.value || 'Promedio ponderado',
        style: { color: '#8c96a0' },
      },
      labels: {
        formatter: function () {
          return formatValue(this.value, 0)
        },
        style: { color: '#5c6972' },
      },
      gridLineColor: '#f1f3f5',
    },
    tooltip: {
      formatter: function () {
        const point = this.point
        const unidad = point.unidadMedida ? ` ${point.unidadMedida}` : ''
        return `
          <span style="font-size:10px">${point.category}</span><br/>
          <span style="color:${point.color}">\u25CF</span>
          Promedio ponderado: <b>${formatValue(point.y)}${unidad}</b><br/>
          Factor expandido: <b>${Highcharts.numberFormat(point.sumaFactor || 0, 0, ',', '.')}</b>
        `
      },
      useHTML: true,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#eef0f2',
      shadow: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        pointPadding: 0.16,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          formatter: function () {
            if (this.y === null || this.y === undefined) return ''
            const unidad = this.point.unidadMedida ? ` ${this.point.unidadMedida}` : ''
            return `${formatValue(this.y)}${unidad}`
          },
          style: {
            textOutline: 'none',
            color: '#5c6972',
            fontWeight: '700',
          },
        },
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: 'Promedio ponderado',
        color: seriesColor,
        data: chartData.value,
      },
    ],
  })
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  destroyChart()
})

watch(
  () => [props.variables, props.respuestas, props.categorias, props.pregunta],
  () => {
    initChart()
  },
  { deep: true },
)

watch(
  () => props.title,
  (newTitle) => {
    if (chartInstance) {
      chartInstance.setTitle({ text: newTitle })
    }
  },
)
</script>

<template>
  <div class="bar-number-chart-wrapper card-premium">
    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.bar-number-chart-wrapper {
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
