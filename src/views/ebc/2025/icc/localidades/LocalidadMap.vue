<script setup>
import { ref, watch, computed, onMounted, onUnmounted, inject } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'

// Registrar el módulo de mapa si no está registrado
if (typeof HighchartsMap === 'function' && !Highcharts.MapChart) {
  HighchartsMap(Highcharts)
}

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
  respuestasLocalidad: {
    type: Array,
    default: () => null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const localidades = inject('localidades', ref([]))
const geojson = ref(null)
const loadingMap = ref(true)

// Computar la agrupación por localidad y sumar factores para el mapa
const dataMap = computed(() => {
  if (!props.respuestasLocalidad || !props.variableSeleccionada || !props.respuestaSeleccionada)
    return []

  const varId = props.variableSeleccionada.indice_variable
  const respVal = props.respuestaSeleccionada

  return localidades.value.map((loc) => {
    // 1. Obtener todas las respuestas de esa variable en esta localidad
    const respuestasVariableLocalidad = props.respuestasLocalidad.filter(
      (r) => String(r.localidad_cod) === String(loc.localidad_cod) && r.indice_variable === varId,
    )

    // 2. Filtrar solo las que coinciden con la opción de respuesta seleccionada
    const respuestasOpcionEspecifica = respuestasVariableLocalidad.filter(
      (r) => String(r.respuesta_v2) === String(respVal),
    )

    const sumaTotalVariable = respuestasVariableLocalidad.reduce(
      (acc, curr) => acc + (parseFloat(curr.suma_factor) || 0),
      0,
    )
    const sumaRespuestaEspecifica = respuestasOpcionEspecifica.reduce(
      (acc, curr) => acc + (parseFloat(curr.suma_factor) || 0),
      0,
    )

    const porcentaje =
      sumaTotalVariable > 0 ? (sumaRespuestaEspecifica / sumaTotalVariable) * 100 : 0

    // Usaremos el código numérico directo para el mapeo (CODIGO_LOC en GeoJSON)
    const locId = Number(loc.localidad_cod)

    return {
      'hc-key': locId,
      value: parseFloat(porcentaje.toFixed(1)),
      nombre: loc.localidad_residencia,
      poblacion: Math.round(sumaRespuestaEspecifica),
      total: Math.round(sumaTotalVariable),
    }
  })
})

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (!geojson.value || !chartContainer.value || dataMap.value.length === 0) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = Highcharts.mapChart(chartContainer.value, {
    chart: {
      map: geojson.value,
      backgroundColor: 'transparent',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      height: 600,
    },
    title: {
      text: null,
    },
    subtitle: {
      text: null,
    },
    credits: { enabled: false },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom',
      },
    },
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#F5F3FF'], // Color muy claro (bajo %)
        [0.5, '#9370DB'], // Color medio
        [1, '#654096'], // Color oscuro (alto %)
      ],
      labels: {
        format: '{value}%',
        style: { color: '#64748b', fontWeight: '600' },
      },
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderRadius: 10,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 12,
      borderWidth: 0,
      shadow: true,
      useHTML: true,
      headerFormat: '',
      pointFormat: `
        <div style="padding: 10px; min-width: 150px;">
          <div style="font-size: 14px; font-weight: 800; color: #32204a; margin-bottom: 8px; border-bottom: 2px solid #f0f0f0; padding-bottom: 4px;">
            {point.nombre}
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #64748b;">Porcentaje:</span>
            <span style="font-weight: 700; color: #654096;">{point.value}%</span>
          </div>
          <div style="font-size: 11px; color: #94a3b8;">
            <div>Pob. Estimada: <b>{point.poblacion}</b></div>
            <div>Base: <b>{point.total}</b></div>
          </div>
        </div>
      `,
    },
    series: [
      {
        data: dataMap.value,
        name: 'Porcentaje',
        joinBy: ['CODIGO_LOC', 'hc-key'],
        states: {
          hover: {
            color: '#FCD34D',
            borderColor: '#32204a',
            borderWidth: 2,
          },
        },
        dataLabels: {
          enabled: true,
          format: '{point.nombre}',
          style: {
            fontSize: '9px',
            textOutline: 'none',
            color: '#333',
          },
        },
      },
    ],
  })
}

// Cargar GeoJSON al montar
onMounted(async () => {
  try {
    loadingMap.value = true
    const baseUrl = import.meta.env.BASE_URL || '/'
    const response = await fetch(`${baseUrl}resources/maps/localidades_bogota_corte.json`)
    if (!response.ok) throw new Error('No se pudo cargar el mapa')
    geojson.value = await response.json()

    setTimeout(() => {
      initChart()
      loadingMap.value = false
    }, 200)
  } catch (error) {
    console.error('Error cargando el mapa GeoJSON:', error)
    loadingMap.value = false
  }
})

// Observar cambios en los datos para refrescar el mapa
watch(
  [dataMap, geojson],
  () => {
    if (geojson.value && dataMap.value.length > 0) {
      initChart()
    }
  },
  { deep: true },
)

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<template>
  <div class="localidad-map">
    <div v-if="loading || loadingMap" class="p-5 text-center">
      <div class="spinner-grow text-primary mb-3"></div>
      <p class="text-muted">Cargando mapa...</p>
    </div>

    <div v-else-if="dataMap.length === 0" class="alert alert-light border m-4 text-center">
      No hay datos geográficos para la selección actual.
    </div>

    <div
      v-show="!loading && !loadingMap && dataMap.length > 0"
      class="map-wrapper card-premium"
    >
      <div ref="chartContainer" class="highcharts-map-container"></div>
      <p class="map-note mb-0">
        La localidad de Sumapaz aparece incompleta, su geometría fue modificada únicamente con
        fines de visualización
      </p>
    </div>
  </div>
</template>

<style scoped>
.localidad-map {
  height: 100%;
}

.map-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 680px;
  padding: 1rem;
}

.highcharts-map-container {
  flex: 1;
  width: 100%;
  min-height: 600px;
}

.map-note {
  margin-top: 0.75rem;
  font-size: 0.78rem;
  line-height: 1.45;
  font-weight: 400;
  color: #94a3b8;
}
</style>
