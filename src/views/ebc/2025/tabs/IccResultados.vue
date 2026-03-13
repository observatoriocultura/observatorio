<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import IccChart from './IccChart.vue'
import DonutChart from './donutChart.vue'
import BarChart from './barChart.vue'

const contentSection = ref('table')
const codigoMedicion = inject('codigoMedicion')
const secciones = ref([])
const preguntas = ref([])
const variables = ref([])
const respuestas = ref([])
const loading = ref(true)
const seccionSeleccionada = ref(null)
const preguntaSeleccionada = ref(null)
const categorias = computed(() => {
  return variablesFiltradas.value.map((v) => v.enunciado_2 || v.codigo_variable)
})
const series = ref([])
const respuestasPregunta = ref([])

const preguntasFiltradas = computed(() => {
  if (!seccionSeleccionada.value) return []
  return preguntas.value.filter((p) => p.num_seccion === seccionSeleccionada.value.num_seccion)
})

const variablesFiltradas = computed(() => {
  if (!preguntaSeleccionada.value) return []
  return variables.value
    .filter((v) => v.indice_pregunta === preguntaSeleccionada.value.indice_pregunta)
    .map((v) => {
      // Sumar los factores de todas las respuestas asociadas a esta variable
      const sumaTotal = respuestasPregunta.value
        .filter((r) => r.indice_variable === v.indice_variable)
        .reduce((acc, r) => acc + (r.suma_factor || 0), 0)
      return { ...v, suma_factor: sumaTotal }
    })
})

/** Obtener los tipos de respuestas únicas (V2) para generar las series */
const posiblesRespuestas = computed(() => {
  const valores = respuestasPregunta.value.map((r) => r.respuesta_v2)
  return [...new Set(valores)].sort((a, b) => a - b)
})

onMounted(async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL
    const response = await fetch(`${baseUrl}content/mediciones/${codigoMedicion}/secciones.json`)
    secciones.value = await response.json()
    if (secciones.value.length > 0) {
      seccionSeleccionada.value = secciones.value[0]
    }
    const responsePreguntas = await fetch(
      `${baseUrl}content/mediciones/${codigoMedicion}/preguntas.json`,
    )
    preguntas.value = await responsePreguntas.json()
    const responseVariables = await fetch(
      `${baseUrl}content/mediciones/${codigoMedicion}/variables.json`,
    )
    variables.value = await responseVariables.json()
    const responseRespuestas = await fetch(
      `${baseUrl}content/mediciones/${codigoMedicion}/respuestas.json`,
    )
    respuestas.value = await responseRespuestas.json()

    // Seleccionar primera pregunta de la primera sección
    if (preguntasFiltradas.value.length > 0) {
      preguntaSeleccionada.value = preguntasFiltradas.value[0]
      actualizarRespuestas()
      actualizarSeries()
    }
  } catch (e) {
    console.error('Error cargando secciones:', e)
  } finally {
    loading.value = false
  }
})

/**
 * Selecciona una sección y actualiza la pregunta seleccionada
 * @param {Object} seccion - Objeto de sección
 */
const seleccionarSeccion = (seccion) => {
  seccionSeleccionada.value = seccion
  // Resetear pregunta al cambiar de sección
  if (preguntasFiltradas.value.length > 0) {
    preguntaSeleccionada.value = preguntasFiltradas.value[0]
  } else {
    preguntaSeleccionada.value = null
  }
}

/**
 * Selecciona una pregunta y actualiza las respuestas y series
 * @param {Object} pregunta - Objeto de pregunta
 */
const seleccionarPregunta = (pregunta) => {
  preguntaSeleccionada.value = pregunta
  actualizarRespuestas()
  actualizarSeries()
}

/**
 * Actualiza las series del gráfico
 */
const actualizarSeries = () => {
  if (!variablesFiltradas.value.length || !respuestasPregunta.value.length) {
    series.value = []
    return
  }

  // Generamos una serie por cada tipo de respuesta única
  series.value = posiblesRespuestas.value.map((tipoResp) => {
    return {
      name: `${tipoResp}`, // Dejamos solo el valor de la respuesta para una leyenda más limpia
      data: variablesFiltradas.value.map((variable) => {
        // Buscamos la respuesta que coincida con esta variable y este tipo de respuesta
        const r = respuestasPregunta.value.find(
          (res) =>
            res.indice_variable === variable.indice_variable && res.respuesta_v2 === tipoResp,
        )
        return r ? r.suma_factor : 0 // Si no hay dato para esa combinación, ponemos 0
      }),
    }
  })
}

/** Calcular las categorías (Variables) */
// Eliminado: ahora es una propiedad computada

const actualizarRespuestas = () => {
  if (!preguntaSeleccionada.value || !respuestas.value.length) return

  respuestasPregunta.value = respuestas.value.filter(
    (r) => r.indice_pregunta === preguntaSeleccionada.value.indice_pregunta,
  )
  console.log(
    `Respuestas filtradas para la pregunta ${preguntaSeleccionada.value.etiqueta_1}:`,
    respuestasPregunta.value,
  )
}
</script>

<template>
  <div class="icc-resultados container-fluid">
    <div class="row">
      <!-- Panel Izquierdo: Listado de Secciones -->
      <aside class="col-md-4 col-lg-3 sections-sidebar">
        <div class="sticky-top offset-navbar">
          <!-- SELECTOR DE SECCIONES -->
          <div
            class="selector-seccion"
            data-bs-toggle="collapse"
            href="#listaSecciones"
            role="button"
            aria-expanded="false"
            aria-controls="listaSecciones"
          >
            <div class="d-flex align-items-center">
              <span class="section-number active-number">{{
                seccionSeleccionada?.num_seccion
              }}</span>
              <span class="ms-2">{{ seccionSeleccionada?.nombre_seccion }}</span>
            </div>
            <i class="bi bi-chevron-down"></i>
          </div>
          <!-- LISTA DE SECCIONES -->
          <div class="collapse" id="listaSecciones">
            <div class="list-group list-group-flush section-menu">
              <button
                v-for="seccion in secciones"
                :key="seccion.num_seccion"
                type="button"
                class="list-group-item list-group-item-action section-item"
                :class="{ active: seccionSeleccionada?.num_seccion === seccion.num_seccion }"
                data-bs-toggle="collapse"
                data-bs-target="#listaSecciones"
                @click="seleccionarSeccion(seccion)"
              >
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <span class="section-number">{{ seccion.num_seccion }}</span>
                  <span class="section-name text-truncate ms-2">{{ seccion.nombre_seccion }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- LISTADO DE PREGUNTAS -->
          <div class="questions-container mt-4">
            <h4 class="sidebar-title">Preguntas</h4>
            <div class="list-group list-group-flush questions-menu shadow-sm">
              <button
                v-for="pregunta in preguntasFiltradas"
                :key="pregunta.indice_pregunta"
                type="button"
                class="list-group-item list-group-item-action question-item"
                :class="{
                  active: preguntaSeleccionada?.indice_pregunta === pregunta.indice_pregunta,
                }"
                @click="seleccionarPregunta(pregunta)"
              >
                <div class="d-flex align-items-start">
                  <span class="question-code me-2">{{ pregunta.etiqueta_1 }}</span>
                  <span class="question-text small">{{ pregunta.nombre }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="col-md-8 col-lg-9 content-area">
        <div v-if="preguntaSeleccionada" class="question-detail">
          <!-- SELECTOR DE VISTA -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'chart' }"
                @click="contentSection = 'chart'"
              >
                <i class="bi bi-bar-chart-line me-1"></i>Visualización
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'table' }"
                @click="contentSection = 'table'"
              >
                <i class="bi bi-bug me-1"></i>Depuración (Data)
              </button>
            </li>
          </ul>

          <!-- MOSTRAR GRÁFICO SEGÚN EL TIPO DE PREGUNTA -->
          <div v-if="contentSection === 'chart'" class="mt-4">
            <div class="graph-container card border-0 shadow-sm">
              <div class="card-body p-0">
                <!-- TIPO DE GRÁFICO BAR MULTIPLE -->
                <IccChart
                  v-if="preguntaSeleccionada.dataviz_chart_type === 'bar-multiple'"
                  :title="preguntaSeleccionada.nombre"
                  :subtitle="preguntaSeleccionada.enunciado_1"
                  :type="'bar'"
                  :series="series"
                  :categorias="categorias"
                />

                <!-- TIPO DE GRÁFICO column -->
                <BarChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'column'"
                  :pregunta="preguntaSeleccionada"
                  :respuestas="respuestasPregunta"
                />

                <!-- TIPO DE GRÁFICO DONUT -->
                <DonutChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'donut'"
                  :pregunta="preguntaSeleccionada"
                  :respuestas="respuestasPregunta"
                />

                <!-- PARA TIPOS DE GRÁFICOS AÚN NO IMPEMENTADOS -->
                <div v-else class="pending-viz py-5 text-center px-3">
                  <i class="bi bi-tools display-4 text-muted mb-3"></i>
                  <h5 class="text-secondary">Pendiente construcción</h5>
                  <p class="text-muted">
                    El tipo de gráfico
                    <strong>{{ preguntaSeleccionada.dataviz_chart_type }}</strong> aún no ha sido
                    implementado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p v-if="preguntaSeleccionada.instruccion" class="text-muted italic small mt-3">
            <i class="bi bi-info-circle me-1"></i>{{ preguntaSeleccionada.instruccion }}
          </p>

          <!-- MOSTRAR TABLA DE DATOS (DEBUG) -->
          <div v-if="contentSection === 'table'">
            <div id="debug-tables" class="mt-4">
              <h6 class="text-uppercase text-muted small fw-bold mb-3">Variables</h6>
              <table class="table table-sm table-bordered small mb-4">
                <thead class="bg-light">
                  <tr>
                    <th class="text-center">indice_variable</th>
                    <th>codigo_variable</th>
                    <th>enunciado_2</th>
                    <th>unidad_medida</th>
                    <th class="text-end">suma_factor (total)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="variable in variablesFiltradas" :key="variable.codigo_variable">
                    <td class="text-center">{{ variable.indice_variable }}</td>
                    <td>
                      <code>{{ variable.codigo_variable }}</code>
                    </td>
                    <td>{{ variable.enunciado_2 }}</td>
                    <td>
                      <span class="text-muted">{{ variable.unidad_medida }}</span>
                    </td>
                    <td class="text-end fw-bold text-primary font-monospace">
                      {{ variable.suma_factor.toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <h6 class="text-uppercase text-muted small fw-bold mb-3">RESPUESTAS</h6>
              <table class="table table-sm table-bordered small">
                <thead class="bg-light">
                  <tr>
                    <th>codigo_variable</th>
                    <th class="text-center">indice_variable</th>
                    <th class="text-center">respuesta</th>
                    <th class="text-center">respuesta_v2</th>
                    <th class="text-end">suma_factor</th>
                    <th class="text-end">cantidad_respuestas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(resp, index) in respuestasPregunta" :key="index">
                    <td>
                      <code>{{ resp.codigo_variable }}</code>
                    </td>
                    <td class="text-center">{{ resp.indice_variable }}</td>
                    <td class="text-start">{{ resp.respuesta }}</td>
                    <td class="text-start">{{ resp.respuesta_v2 }}</td>
                    <td class="text-end font-monospace">{{ resp.suma_factor.toFixed(2) }}</td>
                    <td class="text-end">{{ resp.cantidad_respuestas }}</td>
                  </tr>
                  <tr v-if="respuestasPregunta.length === 0">
                    <td colspan="6" class="text-center py-3 text-muted">No entries found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else-if="seccionSeleccionada" class="section-welcome py-5 text-center">
          <i class="bi bi-arrow-left-circle display-1 text-light mb-3 d-block"></i>
          <h3>{{ seccionSeleccionada.nombre_seccion }}</h3>
          <p class="text-muted">
            Seleccione una pregunta del panel izquierdo para ver sus resultados detallados.
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.icc-resultados {
  padding-top: 0rem;
}

.sections-sidebar {
  border-right: 0px solid #eef0f2;
  padding-right: 0rem;
}

.offset-navbar {
  top: 1rem;
}

.sidebar-title {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8c96a0;
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
}

.section-menu {
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  border: 1px solid #eef0f2;
  border-top: none;
}

.selector-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #32204a;
  background-color: #f0ebf7;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.selector-seccion[aria-expanded='true'] {
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}

.selector-seccion:hover {
  background-color: #e5dcf4;
}

.selector-seccion i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.selector-seccion[aria-expanded='true'] i {
  transform: rotate(180deg);
}

.section-item {
  border: none;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #5c6972;
  transition: all 0.2s ease;
}

.section-item:hover {
  background-color: #f9f9fb;
  color: #32204a;
}

.section-item.active {
  background-color: #f0ebf7;
  color: #32204a;
  border-left: 4px solid #32204a;
}

.section-number {
  font-size: 0.75rem;
  background: #eef0f2;
  color: #8c96a0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 800;
}

.section-item.active .section-number,
.active-number {
  background: #32204a;
  color: #fff;
}

/* ESTILOS PREGUNTAS */
.questions-menu {
  border-radius: 12px 0 0 12px;
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid #eef0f2;
}

.question-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8f9fa;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item:hover {
  background-color: #f9f9fb;
}

.question-item.active {
  background-color: #ffffff;
  color: #32204a;
  border-left: 4px solid #32204a;
  box-shadow: inset 0 0 10px rgba(50, 32, 74, 0.02);
}

.question-code {
  font-size: 0.7rem;
  font-weight: 800;
  color: #8c96a0;
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 35px;
  text-align: center;
}

.question-item.active .question-code {
  background: #32204a;
  color: #fff;
}

.question-text {
  line-height: 1.3;
  font-weight: 500;
}

.question-item.active .question-text {
  font-weight: 700;
}

/* Scrollbar personalizado para la lista de preguntas */
.questions-menu::-webkit-scrollbar {
  width: 4px;
}

.questions-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.questions-menu::-webkit-scrollbar-thumb {
  background: #ced4da;
  border-radius: 10px;
}

.questions-menu::-webkit-scrollbar-thumb:hover {
  background: #8c96a0;
}

.content-area {
  padding-left: 2rem;
}

.detail-header h2 {
  font-size: 1.25rem;
  font-weight: 900;
  color: #32204a;
}

.graph-placeholder {
  background: #fdfdfd;
  border-radius: 16px;
  min-height: 400px;
}

@media (max-width: 768px) {
  .sections-sidebar {
    border-right: none;
    border-bottom: 1px solid #eef0f2;
    padding-right: 0;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }
  .content-area {
    padding-left: 0;
  }
}
</style>
