<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import { inject } from 'vue'
import { getPaletaColor as defaultGetPaletaColor } from '../constants.js'

const surveyConstants = inject('surveyConstants', {})
const getPaletaColor = surveyConstants.getPaletaColor || defaultGetPaletaColor

const props = defineProps({
  title: {
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
  respuestas: {
    type: Array,
    default: () => [],
  },
  posiblesRespuestas: {
    type: Array,
    default: () => [],
  },
  kpiValue: {
    type: Number,
    default: null,
  },
  kpiLabel: {
    type: String,
    default: null,
  },
})

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Obtener la paleta de colores según la configuración de la pregunta
  const currentPalette = getPaletaColor(props.pregunta?.dataviz_palette)
  // Usar el primer color de la paleta para todo el gráfico
  const seriesColor = currentPalette[0] || '#5d4294'

  // Usamos las posiblesRespuestas pasadas por el padre para respetar el orden deseado (dataviz_order_type)
  const categories = props.posiblesRespuestas.length > 0 
    ? props.posiblesRespuestas 
    : [...new Set(props.respuestas.map((d) => d.respuesta_v2))].sort((a, b) => {
        const numA = parseFloat(a)
        const numB = parseFloat(b)
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB
        return String(a).localeCompare(String(b))
      })

  const data = categories.map((cat) => {
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
      text: props.title,
      style: {
        fontWeight: '800',
        color: '#32204a',
      },
    },
    subtitle: {
      text: props.pregunta?.enunciado_1 || '',
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
        colorByPoint: false, // Desactivado: todas las barras del mismo color
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
      enabled: false,
    },
    series: [
      {
        name: 'Porcentaje',
        color: seriesColor,
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
  () => [props.respuestas, props.posiblesRespuestas],
  () => {
    initChart()
  },
  { deep: true },
)

// Observar cambios en el título para actualizarlo sin redibujar todo
watch(
  () => props.title,
  (newTitle) => {
    if (chartInstance && newTitle) {
      chartInstance.setTitle({ text: newTitle })
    }
  },
)

// Observar cambios en la pregunta para actualizar solo el título como fallback
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
  <div class="bar-chart-wrapper card-premium position-relative">
    
    <!-- KPI Overlay -->
    <div v-if="kpiValue !== null && kpiLabel" class="kpi-overlay shadow-sm">
      <div class="kpi-content text-center">
        <div class="kpi-value-wrapper">
          <span class="kpi-value">{{ Number(kpiValue).toFixed(1) }}</span>
        </div>
        <span class="kpi-label mt-1">{{ kpiLabel }}</span>
      </div>
      <div class="kpi-decoration"></div>
    </div>

    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.position-relative {
  position: relative;
}

.kpi-overlay {
  position: absolute;
  top: 15px;
  right: 25px;
  z-index: 10;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  border: 1px solid rgba(238, 240, 242, 0.5);
  overflow: hidden;
  pointer-events: none;
}

.kpi-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.kpi-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8c96a0;
  display: block;
}

.kpi-value-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: #32204a;
  line-height: 1.2;
}

.kpi-decoration {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(50, 32, 74, 0.03) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.bar-chart-wrapper {
  font-family: 'Inter', sans-serif;
  width: 100%;
  min-height: 400px;
  padding: 1rem;
}

.highcharts-container {
  width: 100%;
  height: calc(100vh - 280px);
}
</style>
