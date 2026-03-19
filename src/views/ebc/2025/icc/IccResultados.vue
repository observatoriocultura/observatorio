<script setup>
import { ref, onMounted, inject, provide, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BarMultipleChart from './charts/barMultipleChart.vue'
import DonutChart from './charts/donutChart.vue'
import BarChart from './charts/barChart.vue'
import LocalidadChart from './charts/LocalidadChart.vue'
import IccDebug from './charts/IccDebug.vue'

const contentSection = ref('chart')
const codigoMedicion = inject('codigoMedicion')
const secciones = ref([])
const preguntas = ref([])
const variables = ref([])
const respuestas = ref([])
const localidades = ref([])
provide('localidades', localidades)
const loading = ref(true)
const seccionSeleccionada = ref(null)
const preguntaSeleccionada = ref(null)
const localidadSeleccionada = ref(null)
const route = useRoute()
const router = useRouter()

/** Datos desagregados — null = aún no cargados (lazy load) */
const respuestasLocalidad = ref(null)
const loadingDimension = ref(false)

/** Cache en módulo: persiste mientras la SPA esté montada */
const cacheDimensiones = {}

/**
 * Carga un archivo de respuestas desagregadas bajo demanda.
 * Si ya fue cargado (en ref o en cache), no hace ningún fetch.
 * @param {string} nombreArchivo - Nombre del archivo JSON
 * @param {import('vue').Ref} refDato - La ref donde guardar los datos
 */
const cargarDimension = async (nombreArchivo, refDato) => {
  if (refDato.value !== null) return // ya cargado

  if (cacheDimensiones[nombreArchivo]) {
    refDato.value = cacheDimensiones[nombreArchivo]
    return
  }

  loadingDimension.value = true
  try {
    const baseUrl = import.meta.env.BASE_URL
    const res = await fetch(`${baseUrl}content/mediciones/${codigoMedicion}/${nombreArchivo}`)
    const data = await res.json()
    cacheDimensiones[nombreArchivo] = data
    refDato.value = data
  } catch (e) {
    console.error(`Error cargando dimensión ${nombreArchivo}:`, e)
  } finally {
    loadingDimension.value = false
  }
}

/** Refleja la sección y pregunta activas como query params en la URL (?num_seccion=&num_pregunta=) */
const actualizarUrl = () => {
  const query = { ...route.query }
  if (seccionSeleccionada.value) query.num_seccion = seccionSeleccionada.value.num_seccion
  if (preguntaSeleccionada.value) query.num_pregunta = preguntaSeleccionada.value.indice_pregunta

  router.replace({ query })
}

/** Calcula el promedio ponderado de una variable usando suma_factor como peso. Retorna null si no hay factores. */
const calcularPromedioPonderado = (listaRespuestas) => {
  let sumaPonderada = 0
  let sumaFactores = 0

  listaRespuestas.forEach((r) => {
    const val = parseFloat(r.respuesta_number)
    const f = parseFloat(r.suma_factor)
    if (!isNaN(val) && !isNaN(f)) {
      sumaPonderada += val * f
      sumaFactores += f
    }
  })

  return sumaFactores > 0 ? sumaPonderada / sumaFactores : null
}

/** Etiquetas del eje X para los gráficos: usa enunciado_2 o, en su defecto, el código de variable */
const categorias = computed(() => {
  return variablesFiltradas.value.map((v) => v.enunciado_2 || v.codigo_variable)
})
const series = ref([])
const respuestasPregunta = ref([])

/** Lista de preguntas que pertenecen a la sección actualmente seleccionada */
const preguntasFiltradas = computed(() => {
  if (!seccionSeleccionada.value) return []
  return preguntas.value.filter((p) => p.num_seccion === seccionSeleccionada.value.num_seccion)
})

/**
 * Variables de la pregunta activa, enriquecidas con suma_factor total y promedio_ponderado.
 * Cruza variables[] con respuestasPregunta para agregar los factores de expansión por variable.
 */
const variablesFiltradas = computed(() => {
  if (!preguntaSeleccionada.value) return []
  return variables.value
    .filter((v) => v.indice_pregunta === preguntaSeleccionada.value.indice_pregunta)
    .map((v) => {
      const respuestasDeVariable = respuestasPregunta.value.filter(
        (r) => r.indice_variable === v.indice_variable,
      )
      const sumaTotal = respuestasDeVariable.reduce((acc, r) => acc + (r.suma_factor || 0), 0)
      const promedio = calcularPromedioPonderado(respuestasDeVariable)

      return { ...v, suma_factor: sumaTotal, promedio_ponderado: promedio }
    })
})

/** Población representada: toma el máximo de suma_factor entre todas las variables de la pregunta */
const sumatoriaFactor = computed(() => {
  return Math.max(...variablesFiltradas.value.map((v) => v.suma_factor), 0)
})

/** Valores únicos de respuesta_v2 presentes en la pregunta activa, ordenados numericamente. Definen las series del gráfico bar-multiple. */
const posiblesRespuestas = computed(() => {
  const valores = respuestasPregunta.value.map((r) => r.respuesta_v2)
  return [...new Set(valores)].sort((a, b) => a - b)
})

/**
 * Carga en paralelo los 5 archivos base de la medición y establece la selección inicial
 * de sección y pregunta (respetando query params de la URL si los hay).
 */
onMounted(async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL

    // 1. Cargar todas las definiciones básicas
    const [resSec, resPre, resVar, resRes, resLoc] = await Promise.all([
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/secciones.json`),
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/preguntas.json`),
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/variables.json`),
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/respuestas.json`),
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/localidades.json`),
    ])

    secciones.value = (await resSec.json()).filter((s) => Number(s.dataviz_display) === 1)
    preguntas.value = (await resPre.json()).filter((p) => Number(p.dataviz_display) === 1)
    variables.value = await resVar.json()
    respuestas.value = await resRes.json()
    localidades.value = await resLoc.json()

    // 2. Determinar selección inicial (URL o defecto)
    const urlSeccion = route.query.num_seccion
    const urlPregunta = route.query.num_pregunta

    if (urlSeccion && secciones.value.length > 0) {
      const encontrada = secciones.value.find((s) => String(s.num_seccion) === String(urlSeccion))
      seccionSeleccionada.value = encontrada || secciones.value[0]
    } else if (secciones.value.length > 0) {
      seccionSeleccionada.value = secciones.value[0]
    }

    if (seccionSeleccionada.value) {
      if (urlPregunta && preguntasFiltradas.value.length > 0) {
        const encontrada = preguntasFiltradas.value.find(
          (p) => String(p.indice_pregunta) === String(urlPregunta),
        )
        preguntaSeleccionada.value = encontrada || preguntasFiltradas.value[0]
      } else if (preguntasFiltradas.value.length > 0) {
        preguntaSeleccionada.value = preguntasFiltradas.value[0]
      }

      if (preguntaSeleccionada.value) {
        actualizarRespuestas()
        actualizarSeries()
      }
    }
  } catch (e) {
    console.error('Error cargando datos de resultados:', e)
  } finally {
    loading.value = false
  }
})

/** Sincroniza el estado interno si el usuario navega con el historial del navegador (atrás/adelante) */
watch(
  () => [route.query.num_seccion, route.query.num_pregunta],
  ([newSec, newPre]) => {
    if (loading.value) return

    const sec = secciones.value.find((s) => String(s.num_seccion) === String(newSec))
    if (sec && sec.num_seccion !== seccionSeleccionada.value?.num_seccion) {
      seccionSeleccionada.value = sec
    }

    const pre = preguntas.value.find((p) => String(p.indice_pregunta) === String(newPre))
    if (pre && pre.indice_pregunta !== preguntaSeleccionada.value?.indice_pregunta) {
      preguntaSeleccionada.value = pre
      actualizarRespuestas()
      actualizarSeries()
    }
  },
)

/** Cambia la sección activa y reinicia la pregunta a la primera de esa sección */
const seleccionarSeccion = (seccion) => {
  seccionSeleccionada.value = seccion
  preguntaSeleccionada.value = preguntasFiltradas.value[0] ?? null
  actualizarUrl()
  actualizarRespuestas()
  actualizarSeries()
}

/** Cambia la pregunta activa y refresca respuestas, series y URL */
const seleccionarPregunta = (pregunta) => {
  preguntaSeleccionada.value = pregunta
  actualizarUrl()
  actualizarRespuestas()
  actualizarSeries()
}

/**
 * Construye el array `series` para el gráfico bar-multiple.
 * Genera una serie por cada valor único de respuesta_v2, con suma_factor de cada variable como dato.
 */
const actualizarSeries = () => {
  if (!variablesFiltradas.value.length || !respuestasPregunta.value.length) {
    series.value = []
    return
  }

  series.value = posiblesRespuestas.value.map((tipoResp) => {
    return {
      name: `${tipoResp}`,
      data: variablesFiltradas.value.map((variable) => {
        const matches = respuestasPregunta.value.filter(
          (res) =>
            res.indice_variable === variable.indice_variable && res.respuesta_v2 === tipoResp,
        )
        return matches.reduce((sum, r) => sum + (r.suma_factor || 0), 0)
      }),
    }
  })
}

/**
 * Filtra las respuestas de la pregunta activa y calcula el porcentaje por variable.
 * La fuente de datos varía según el filtro activo:
 *   - Sin filtro       → respuestas.json (datos agregados, ya en memoria)
 *   - Con localidad    → respuestas_localidad.json, pre-filtrado por localidad_cod
 *   - (futuro) Sexo / grupo_edad → mismo patrón con sus propios archivos
 */
const actualizarRespuestas = () => {
  if (!preguntaSeleccionada.value || !respuestas.value.length) return

  // 1. Elegir la fuente de datos según los filtros activos
  let fuente = respuestas.value

  if (localidadSeleccionada.value && respuestasLocalidad.value) {
    fuente = respuestasLocalidad.value.filter(
      (r) => r.localidad_cod === localidadSeleccionada.value,
    )
  }
  // else if (sexoSeleccionado.value && respuestasSexo.value) { ... }
  // else if (grupoEdadSeleccionado.value && respuestasEdad.value) { ... }

  // 2. Filtrar por pregunta seleccionada
  const filtradas = fuente.filter(
    (r) => r.indice_pregunta === preguntaSeleccionada.value.indice_pregunta,
  )

  // 3. Sumar factores por variable (denominador para el porcentaje)
  const totalesPorVariable = {}
  filtradas.forEach((r) => {
    const idVar = r.indice_variable
    totalesPorVariable[idVar] = (totalesPorVariable[idVar] || 0) + (r.suma_factor || 0)
  })

  // 4. Calcular porcentaje de cada respuesta respecto al total de su variable
  respuestasPregunta.value = filtradas.map((r) => {
    const totalVar = totalesPorVariable[r.indice_variable] || 0
    return {
      ...r,
      porcentaje: totalVar > 0 ? (r.suma_factor / totalVar) * 100 : 0,
    }
  })
}

/** Cuando cambia la localidad: descarga respuestas_localidad.json si es la primera vez (lazy), luego recalcula */
watch(localidadSeleccionada, async (nuevaLocalidad) => {
  if (nuevaLocalidad) {
    await cargarDimension('respuestas_localidad.json', respuestasLocalidad)
  }
  actualizarRespuestas()
  actualizarSeries()
})

/** Asegurar carga de dimensión_localidad al entrar a la pestaña Localidad */
watch(contentSection, async (nuevaSeccion) => {
  if (nuevaSeccion === 'localidad') {
    await cargarDimension('respuestas_localidad.json', respuestasLocalidad)
  }
})
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
                <div class="d-flex w-100 justify-content-start align-items-center">
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
                <i class="bi bi-gear me-1"></i>Inspección (Data)
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'localidad' }"
                @click="contentSection = 'localidad'"
              >
                <i class="bi bi-gear me-1"></i>Localidad
              </button>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-2">
            <select
              v-model="localidadSeleccionada"
              class="form-select"
              :disabled="loadingDimension"
            >
              <option :value="null">Todas las localidades</option>
              <option
                v-for="localidad in localidades"
                :key="localidad.localidad_cod"
                :value="localidad.localidad_cod"
              >
                {{ localidad.localidad_residencia }}
              </option>
            </select>
            <div
              v-if="loadingDimension"
              class="text-muted small d-flex align-items-center gap-1 text-nowrap"
            >
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Cargando datos...
            </div>
          </div>

          <!-- MOSTRAR GRÁFICO SEGÚN EL TIPO DE PREGUNTA -->
          <div v-if="contentSection === 'chart'" class="mt-4">
            <!-- KPI de Promedio Ponderado -->
            <div
              v-if="variablesFiltradas.length > 0 && variablesFiltradas[0].unidad_medida"
              class="kpi-dashboard mb-4"
            >
              <div class="kpi-card shadow-sm">
                <div class="kpi-content">
                  <div class="kpi-question-name mb-1">{{ preguntaSeleccionada.nombre }}</div>
                  <div class="kpi-value-wrapper">
                    <span class="kpi-value">{{
                      variablesFiltradas[0].promedio_ponderado?.toFixed(1) || '0.0'
                    }}</span>
                  </div>
                  <span class="kpi-label mt-1">{{ variablesFiltradas[0].unidad_medida }}</span>
                </div>
                <div class="kpi-decoration"></div>
              </div>
            </div>

            <div class="graph-container card border-0 shadow-sm">
              <div class="card-body p-0">
                <!-- TIPO DE GRÁFICO BAR MULTIPLE -->
                <BarMultipleChart
                  v-if="preguntaSeleccionada.dataviz_chart_type === 'bar-multiple'"
                  :title="preguntaSeleccionada.nombre"
                  :subtitle="preguntaSeleccionada.enunciado_1"
                  :type="'bar'"
                  :series="series"
                  :categorias="categorias"
                />

                <!-- TIPO DE GRÁFICO column -->
                <BarChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'bar'"
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

          <div class="d-flex justify-content-between py-3">
            <div>
              <p v-if="preguntaSeleccionada.instruccion" class="text-muted italic small mt-3">
                <i class="bi bi-info-circle me-1"></i>{{ preguntaSeleccionada.instruccion }}
              </p>
            </div>
            <div>
              <p
                class="small"
                title="Población representada, pregunta o subpregunta con más respuestas"
              >
                <small class="text-muted">
                  Población representada:
                  {{ sumatoriaFactor.toLocaleString('es-CO', { maximumFractionDigits: 0 }) }}
                </small>
              </p>
            </div>
          </div>

          <!-- MOSTRAR TABLA DE DATOS (DEBUG) -->
          <div v-if="contentSection === 'table'">
            <IccDebug
              :variablesFiltradas="variablesFiltradas"
              :respuestasPregunta="respuestasPregunta"
              :sumatoriaFactor="sumatoriaFactor"
            />
          </div>

          <div v-if="contentSection === 'localidad'">
            <LocalidadChart 
              :variables="variablesFiltradas"
              :posiblesRespuestas="posiblesRespuestas"
              :respuestasLocalidad="respuestasLocalidad"
              :loading="loadingDimension"
            />
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
  border-top: 1px solid #5f4481;
  border-bottom: 1px solid #5f4481;
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

/* ESTILOS KPI */
.kpi-dashboard {
  display: flex;
  justify-content: flex-start;
}

.kpi-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  min-width: 240px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(50, 32, 74, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(50, 32, 74, 0.08) !important;
}

.kpi-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.kpi-question-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #5c6972;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
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
  gap: 0.6rem;
  justify-content: center;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: #32204a;
  line-height: 1.2;
}

.kpi-icon {
  font-size: 1rem;
  color: #b39ddb;
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
</style>
