<script setup>
import { ref, watch, computed, onMounted, onUnmounted, inject } from 'vue'
import Highcharts from 'highcharts'

const props = defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
  posiblesRespuestas: {
    type: Array,
    default: () => [],
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
const variableSeleccionada = ref(null)
const respuestaSeleccionada = ref(null)

// Seleccionar la primera variable disponible automáticamente
watch(
  () => props.variables,
  (newVariables) => {
    if (newVariables && newVariables.length > 0) {
      variableSeleccionada.value = newVariables[0]
    } else {
      variableSeleccionada.value = null
    }
  },
  { immediate: true, deep: true },
)

// Seleccionar la primera respuesta disponible automáticamente
watch(
  () => props.posiblesRespuestas,
  (newRespuestas) => {
    if (newRespuestas && newRespuestas.length > 0) {
      respuestaSeleccionada.value = newRespuestas[0]
    } else {
      respuestaSeleccionada.value = null
    }
  },
  { immediate: true, deep: true },
)

// Computar la agrupación por localidad y sumar factores
const tablaAgrupada = computed(() => {
  if (!props.respuestasLocalidad || props.respuestasLocalidad.length === 0) return []
  if (!variableSeleccionada.value || !respuestaSeleccionada.value) return []

  const varId = variableSeleccionada.value.indice_variable
  const respVal = respuestaSeleccionada.value

  const resultados = localidades.value.map((loc) => {
    // 1. Obtener todas las respuestas de esa variable en esta localidad (para calcular la base/denominador)
    const respuestasVariableLocalidad = props.respuestasLocalidad.filter(
      (r) => String(r.localidad_cod) === String(loc.localidad_cod) && r.indice_variable === varId,
    )

    // 2. Filtrar solo las que coinciden con la opción de respuesta seleccionada (numerador)
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

    return {
      codigo: loc.localidad_cod,
      nombre: loc.localidad_residencia,
      suma_factor: sumaRespuestaEspecifica,
      suma_factor_total: sumaTotalVariable,
      porcentaje: porcentaje,
    }
  })

  // Mostrar primero las de mayor porcentaje y opcionalmente mayor población
  return resultados.sort((a, b) => b.porcentaje - a.porcentaje)
})

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const dataForChart = tablaAgrupada.value
  if (!dataForChart || dataForChart.length === 0 || !chartContainer.value) return

  const categories = dataForChart.map((d) => d.nombre)
  const data = dataForChart.map((d) => parseFloat(d.porcentaje.toFixed(1)))

  const variableStr = variableSeleccionada.value
    ? variableSeleccionada.value.enunciado_2 || variableSeleccionada.value.codigo_variable
    : ''
  const respuestaStr = respuestaSeleccionada.value || ''

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bar',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      backgroundColor: 'transparent',
    },
    title: {
      text: `Porcentaje: ${respuestaStr}`,
      style: {
        fontWeight: '800',
        color: '#32204a',
        fontSize: '1.2rem',
      },
    },
    subtitle: {
      text: variableStr,
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
        format: '{value}%',
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
      bar: {
        colorByPoint: false,
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
        data: data,
        color: '#D7C9E9',
      },
    ],
  })
}

watch(
  tablaAgrupada,
  () => {
    if (!chartContainer.value) return
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
  <div class="localidad-chart">
    <!-- 1. FILTROS SELECT -->
    <section class="section-filters mb-4">
      <div class="card border-0 shadow-sm p-4 rounded-4">
        <div class="row g-4">
          <div class="col-md-6">
            <label for="variableSelect" class="form-label fw-bold text-muted small text-uppercase">
              <i class="bi bi-funnel me-1"></i> Variable de análisis
            </label>
            <select id="variableSelect" class="form-select select-premium" v-model="variableSeleccionada">
              <option :value="null" disabled>Seleccione una variable</option>
              <option v-for="(variable, idx) in variables" :key="idx" :value="variable">
                {{ variable.enunciado_2 || variable.codigo_variable }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="respuestaSelect" class="form-label fw-bold text-muted small text-uppercase">
              <i class="bi bi-card-checklist me-1"></i> Opción de Respuesta
            </label>
            <select id="respuestaSelect" class="form-select select-premium" v-model="respuestaSeleccionada">
              <option :value="null" disabled>Seleccione una opción de respuesta</option>
              <option v-for="(respuesta, idx) in posiblesRespuestas" :key="idx" :value="respuesta">
                {{ respuesta }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. GRÁFICO HIGHCHARTS -->
    <section v-show="!loading && tablaAgrupada.length > 0" class="section-chart mb-5">
      <div class="chart-wrapper shadow-sm border-0 rounded-4">
        <div ref="chartContainer" class="highcharts-container"></div>
      </div>
    </section>

    <!-- 3. TABLA DE RESULTADOS -->
    <section class="section-table mb-5">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-header bg-white border-0 py-3 px-4">
          <h6 class="text-uppercase text-muted fw-bold small mb-0">
            <i class="bi bi-table text-primary me-2"></i>Resultados por Localidad
          </h6>
        </div>

        <div v-if="loading" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Procesando...</span>
          </div>
          <div class="text-muted mt-2 small">Cargando dimensión localidad...</div>
        </div>

        <div
          v-else-if="!props.respuestasLocalidad || tablaAgrupada.length === 0"
          class="alert alert-warning m-4"
        >
          <i class="bi bi-exclamation-triangle me-2"></i> No se encontraron datos para la combinación
          seleccionada.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th scope="col" class="text-center border-0 py-3" style="width: 100px">Código</th>
                <th scope="col" class="border-0 py-3">Localidad</th>
                <th scope="col" class="text-end text-nowrap border-0 py-3">
                  Población (Opc. Seleccionada)
                </th>
                <th scope="col" class="text-end text-nowrap border-0 py-3">Total Variable</th>
                <th scope="col" class="text-end text-nowrap border-0 py-3">% Respuesta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in tablaAgrupada" :key="fila.codigo">
                <td class="text-center text-muted small">{{ fila.codigo }}</td>
                <td class="fw-semibold text-dark">{{ fila.nombre }}</td>
                <td class="text-end fw-bold text-primary">
                  {{ Math.round(fila.suma_factor).toLocaleString('es-CO') }}
                </td>
                <td class="text-end text-muted small">
                  {{ Math.round(fila.suma_factor_total).toLocaleString('es-CO') }}
                </td>
                <td class="text-end fw-bold text-success" style="font-size: 1.1rem">
                  {{ fila.porcentaje.toFixed(1) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 4. INDICADOR DE SELECCIÓN ACTUAL -->
    <section class="section-selection">
      <div class="card bg-dark border-0 shadow-sm p-4 rounded-4 text-white">
        <h6 class="text-uppercase text-white-50 fw-bold small mb-4">
          <i class="bi bi-info-circle text-info me-2"></i>Selección Actual del Usuario
        </h6>
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="selection-pill">
              <span class="label">Variable</span>
              <span class="value">{{ variableSeleccionada ? (variableSeleccionada.enunciado_2 || variableSeleccionada.codigo_variable) : 'Ninguna' }}</span>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="selection-pill">
              <span class="label">Código</span>
              <span class="value font-monospace text-info">{{ variableSeleccionada ? variableSeleccionada.indice_variable : '---' }}</span>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="selection-pill">
              <span class="label">Respuesta</span>
              <span class="value">{{ respuestaSeleccionada || 'Ninguna' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.localidad-chart {
  min-height: 400px;
}

.select-premium {
  border: 1px solid #eef0f2;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.select-premium:focus {
  border-color: #32204a;
  box-shadow: 0 0 0 4px rgba(50, 32, 74, 0.05);
  background-color: #fff;
}

.chart-wrapper {
  width: 100%;
  min-height: 500px;
  background: #ffffff;
  padding: 1.5rem 0;
}

.highcharts-container {
  width: 100%;
  height: 600px;
}

.table thead th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f1f5f9;
}

.selection-pill {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.selection-pill .label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.selection-pill .value {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
}

.rounded-4 {
  border-radius: 1rem !important;
}
</style>
