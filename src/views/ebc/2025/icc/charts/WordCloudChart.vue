<script setup>
import { onMounted, onUnmounted, ref, watch, inject } from 'vue'
import Highcharts from 'highcharts'
import wordcloudModule from 'highcharts/modules/wordcloud'

// Inicializar el módulo wordcloud si no lo está
if (typeof Highcharts.seriesTypes.wordcloud === 'undefined') {
  wordcloudModule(Highcharts)
}

const surveyConstants = inject('surveyConstants', {})
const getPaletaColor = surveyConstants.getPaletaColor || (() => ['#32204a', '#5c6972', '#ffca28'])

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
})

const chartContainer = ref(null)
let chartInstance = null

// Opciones de respuesta que se deben excluir de la nube de palabras
const EXCLUDED_OPTIONS = ['no identificado', 'no aplica', 'ninguna', 'no sabe / no responde']

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Procesar las respuestas para el WordCloud
  const wordMap = new Map()

  props.respuestas.forEach((r) => {
    // Tomamos la respuesta completa como una única entidad
    let text = String(r.respuesta_v2 || '').trim()

    // Ignorar valores vacíos o nulos
    if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'nan') return

    // Normalizar para agrupar (comparar en minúsculas)
    const key = text.toLowerCase()

    // Excluir si está en la lista negra
    if (EXCLUDED_OPTIONS.includes(key)) return

    const weightToAdd = parseFloat(r.suma_factor) || 1

    if (!wordMap.has(key)) {
      wordMap.set(key, { name: text, weight: weightToAdd })
    } else {
      const entry = wordMap.get(key)
      entry.weight += weightToAdd
    }
  })

  // Convertir el mapa a la estructura requerida por Highcharts [{name, weight}]
  const data = Array.from(wordMap.values())
    // Ordenar por peso y tomar las top 50 para no saturar
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 50)

  const currentPalette = getPaletaColor(props.pregunta?.dataviz_palette)

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'wordcloud',
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
    colors: currentPalette,
    tooltip: {
      headerFormat: '<span style="font-size: 16px"><b>{point.name}</b></span><br>',
      pointFormat: 'Frecuencia (ponderada): <b>{point.weight:.1f}</b>'
    },
    series: [{
      type: 'wordcloud',
      data: data,
      name: 'Frecuencia',
      placementStrategy: 'center',
      rotation: {
          from: 0,
          to: 0,
          orientations: 1
      },
    }]
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

watch(
  () => props.respuestas,
  () => {
    initChart()
  },
  { deep: true },
)

watch(
  () => props.title,
  (newTitle) => {
    if (chartInstance && newTitle) {
      chartInstance.setTitle({ text: newTitle })
    }
  },
)
</script>

<template>
  <div class="wordcloud-chart-wrapper card-premium">
    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.wordcloud-chart-wrapper {
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
