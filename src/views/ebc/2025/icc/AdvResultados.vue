<script setup>
import { ref, onMounted, onUnmounted, inject, provide, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BarMultipleChart from './charts/BarMultipleChart.vue'
import BarYesSelectionChart from './charts/BarYesSelectionChart.vue'
import DonutChart from './charts/DonutChart.vue'
import BarChart from './charts/BarChart.vue'
import WordCloudChart from './charts/WordCloudChart.vue'
import LocalidadesView from './localidades/LocalidadesView.vue'
import GruposEdadView from './grupos_edad/GruposEdadView.vue'
import SexoView from './sexos/SexoView.vue'
import ClaseView from './clases/ClaseView.vue'
// import AdvCreditos from './AdvCreditos.vue'
import AdvDebug from './charts/AdvDebug.vue'
import AdvTable from './charts/AdvTable.vue'
import * as bootstrap from 'bootstrap'
import {
  GRUPOS_EDAD as DEFAULT_GRUPOS_EDAD,
  getNombreGrupoEdad as defaultGetNombreGrupoEdad,
  SEXOS as DEFAULT_SEXOS,
  getNombreSexo as defaultGetNombreSexo,
  CLASES as DEFAULT_CLASES,
  getNombreClase as defaultGetNombreClase,
} from './constants'
import AdvSearchQuestion from './AdvSearchQuestion.vue'

// Inyectar constantes dinámicas si están disponibles, si no usar las locales (ICC)
const surveyConstants = inject('surveyConstants', {})
const gruposEdad = surveyConstants.GRUPOS_EDAD || DEFAULT_GRUPOS_EDAD
const getNombreGrupoEdad = surveyConstants.getNombreGrupoEdad || defaultGetNombreGrupoEdad
const sexos = surveyConstants.SEXOS || DEFAULT_SEXOS
const getNombreSexo = surveyConstants.getNombreSexo || defaultGetNombreSexo
const clases = surveyConstants.CLASES || DEFAULT_CLASES
const getNombreClase = surveyConstants.getNombreClase || defaultGetNombreClase

const contentSection = ref('chart')
const totalesSubView = ref('viz') // 'viz' (Gráfico) o 'table' (Tabla)
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
const grupoEdadSeleccionado = ref(null)
const sexoSeleccionado = ref(null)
const claseSeleccionada = ref(null)
const detalleVariableSeleccionada = ref(null)
const detalleRespuestaSeleccionada = ref(null)
const route = useRoute()
const router = useRouter()

provide('seleccionarPreguntaDesdeBuscador', (pregunta) => {
  const seccionFound = secciones.value.find(
    (s) => String(s.num_seccion) === String(pregunta.num_seccion),
  )
  if (seccionFound) {
    seccionSeleccionada.value = seccionFound
    seleccionarPregunta(pregunta)
  }
})

/** Datos desagregados — null = aún no cargados (lazy load) */
const respuestasLocalidad = ref(null)
const respuestasEdad = ref(null)
const respuestasSexo = ref(null)
const respuestasClase = ref(null)
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

/**
 * Etiquetas del eje X para los gráficos: usa enunciado_2 o, en su defecto, el código de variable
 * Las categorías (para dataviz) son las variables en el modelo de datos
 * 2026-03-29
 */
const categorias = computed(() => {
  return variablesFiltradas.value.map((v) => v.enunciado_2 || v.codigo_variable)
})
const series = ref([])
const respuestasPregunta = ref([])

/** Lista de preguntas que pertenecen a la sección actualmente seleccionada */
const preguntasFiltradas = computed(() => {
  if (!seccionSeleccionada.value) return []
  return preguntas.value.filter(
    (p) => String(p.num_seccion) === String(seccionSeleccionada.value.num_seccion),
  )
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

/** Valores únicos de respuesta_v2 presentes en la pregunta activa, ordenados según dataviz_order_type. Definen las series del gráfico bar-multiple. */
const posiblesRespuestas = computed(() => {
  const valores = [...new Set(respuestasPregunta.value.map((r) => r.respuesta_v2))]
  const orderType = preguntaSeleccionada.value?.dataviz_order_type

  if (orderType === 'frecuency') {
    // Calcular el peso total de cada respuesta para ordenar por frecuencia descendente
    const pesos = {}
    respuestasPregunta.value.forEach((r) => {
      pesos[r.respuesta_v2] = (pesos[r.respuesta_v2] || 0) + (r.suma_factor || 0)
    })
    return valores.sort((a, b) => (pesos[b] || 0) - (pesos[a] || 0))
  }

  if (orderType === 'answer') {
    // Ordenar alfabéticamente (tratando de detectar números)
    return valores.sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),
    )
  }

  // Orden por defecto: numérico ascendente
  return valores.sort((a, b) => {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return String(a).localeCompare(String(b))
  })
})

/** Mantiene los selectores de detalle vigentes al cambiar pregunta o resultados */
watch(
  variablesFiltradas,
  (newVars) => {
    if (!newVars.length) {
      detalleVariableSeleccionada.value = null
      return
    }

    const seleccionActual = detalleVariableSeleccionada.value
    const variableVigente = seleccionActual
      ? newVars.find((v) => v.indice_variable === seleccionActual.indice_variable)
      : null

    detalleVariableSeleccionada.value = variableVigente || newVars[0]
  },
  { immediate: true },
)

watch(
  posiblesRespuestas,
  (newResps) => {
    if (!newResps.length) {
      detalleRespuestaSeleccionada.value = null
      return
    }

    const seleccionActual = detalleRespuestaSeleccionada.value
    const respuestaVigente =
      seleccionActual !== null && seleccionActual !== undefined
        ? newResps.find((r) => String(r) === String(seleccionActual))
        : null

    detalleRespuestaSeleccionada.value = respuestaVigente ?? newResps[0]
  },
  { immediate: true },
)

/** Etiqueta de filtros activos para añadir al título de los gráficos */
const labelFiltroActivo = computed(() => {
  if (localidadSeleccionada.value) {
    const loc = localidades.value.find(
      (l) => String(l.localidad_cod) === String(localidadSeleccionada.value),
    )
    return loc ? ` (Localidad ${loc.localidad_residencia})` : ''
  }
  if (grupoEdadSeleccionado.value) {
    const nombre = getNombreGrupoEdad(grupoEdadSeleccionado.value)
    return ` (${nombre})`
  }
  if (sexoSeleccionado.value) {
    const nombre = getNombreSexo(sexoSeleccionado.value)
    return ` (${nombre})`
  }
  if (claseSeleccionada.value) {
    const nombre = getNombreClase(claseSeleccionada.value)
    return ` (${nombre})`
  }
  return ''
})

/** Título principal del gráfico que incluye el filtro si está activo */
const tituloConFiltro = computed(() => {
  if (!preguntaSeleccionada.value) return ''
  return preguntaSeleccionada.value.nombre + labelFiltroActivo.value
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

    // Inicializar Tooltips de Bootstrap
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el))
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
    let seccionCambio = false
    if (sec && sec.num_seccion !== seccionSeleccionada.value?.num_seccion) {
      seccionSeleccionada.value = sec
      seccionCambio = true
    }

    const pre = preguntas.value.find((p) => String(p.indice_pregunta) === String(newPre))
    if (pre && pre.indice_pregunta !== preguntaSeleccionada.value?.indice_pregunta) {
      preguntaSeleccionada.value = pre
      actualizarRespuestas()
      actualizarSeries()
    } else if (seccionCambio && !newPre) {
      // Si cambió la sección y no hay pregunta en URL, forzar la primera de la sección
      preguntaSeleccionada.value = preguntasFiltradas.value[0] || null
      actualizarUrl()
      actualizarRespuestas()
      actualizarSeries()
    }
  },
)

/**
 * Maneja el cierre manual del colapsable de secciones tras una selección
 * 2026-04-06
 */
const cerrarSecciones = () => {
  const el = document.getElementById('listaSecciones')
  if (el) {
    const bsCollapse = bootstrap.Collapse.getInstance(el) || new bootstrap.Collapse(el)
    bsCollapse.hide()
  }
}

/**
 * Toglea (abre/cierra) el listado de secciones al hacer click en el selector principal
 * 2026-04-06
 */
const toggleSecciones = () => {
  const el = document.getElementById('listaSecciones')
  if (el) {
    const bsCollapse = bootstrap.Collapse.getInstance(el) || new bootstrap.Collapse(el)
    bsCollapse.toggle()
  }
}

/** Cambia la sección activa y reinicia la pregunta a la primera de esa sección */
const seleccionarSeccion = (seccion) => {
  seccionSeleccionada.value = seccion
  const primerasPreguntas = preguntas.value.filter(
    (p) => String(p.num_seccion) === String(seccion.num_seccion),
  )
  preguntaSeleccionada.value = primerasPreguntas[0] || null
  actualizarUrl()
  actualizarRespuestas()
  actualizarSeries()

  cerrarSecciones()
}

/** Cambia la pregunta activa y refresca respuestas, series y URL */
const seleccionarPregunta = (pregunta) => {
  preguntaSeleccionada.value = pregunta
  actualizarUrl()
  actualizarRespuestas()
  actualizarSeries()
}

const debeIgnorarNavegacionPorTeclado = (event) => {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.isComposing ||
    document.querySelector('.modal.show')
  ) {
    return true
  }

  const target = event.target
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], [role="textbox"], [role="listbox"], [role="combobox"], [role="menu"], [role="tablist"]',
    ),
  )
}

const navegarPreguntaRelativa = (direccion) => {
  if (loading.value || !preguntaSeleccionada.value) return false

  const indiceActual = preguntasFiltradas.value.findIndex(
    (pregunta) =>
      String(pregunta.indice_pregunta) === String(preguntaSeleccionada.value.indice_pregunta),
  )
  if (indiceActual < 0) return false

  const siguienteIndice = indiceActual + direccion
  const siguientePregunta = preguntasFiltradas.value[siguienteIndice]
  if (!siguientePregunta) return false

  seleccionarPregunta(siguientePregunta)
  return true
}

const manejarNavegacionPreguntasTeclado = (event) => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  if (debeIgnorarNavegacionPorTeclado(event)) return

  const direccion = event.key === 'ArrowRight' ? 1 : -1
  if (navegarPreguntaRelativa(direccion)) {
    event.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('keydown', manejarNavegacionPreguntasTeclado)
})

onUnmounted(() => {
  window.removeEventListener('keydown', manejarNavegacionPreguntasTeclado)
})

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
      (r) => String(r.localidad_cod) === String(localidadSeleccionada.value),
    )
  } else if (grupoEdadSeleccionado.value && respuestasEdad.value) {
    fuente = respuestasEdad.value.filter(
      (r) => Number(r.grupo_edad_pp_cod) === Number(grupoEdadSeleccionado.value),
    )
  } else if (sexoSeleccionado.value && respuestasSexo.value) {
    fuente = respuestasSexo.value.filter((r) => Number(r.sexo) === Number(sexoSeleccionado.value))
  } else if (claseSeleccionada.value && respuestasClase.value) {
    fuente = respuestasClase.value.filter(
      (r) => Number(r.clase) === Number(claseSeleccionada.value),
    )
  }

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
    grupoEdadSeleccionado.value = null // resetear otro filtro
    sexoSeleccionado.value = null // resetear otro filtro
    claseSeleccionada.value = null
    await cargarDimension('respuestas_localidad.json', respuestasLocalidad)
  }
  actualizarRespuestas()
  actualizarSeries()
})

/** Cuando cambia el grupo de edad */
watch(grupoEdadSeleccionado, async (nuevoGrupo) => {
  if (nuevoGrupo) {
    localidadSeleccionada.value = null // resetear otro filtro
    sexoSeleccionado.value = null // resetear otro filtro
    claseSeleccionada.value = null
    await cargarDimension('respuestas_edad.json', respuestasEdad)
  }
  actualizarRespuestas()
  actualizarSeries()
})

/** Cuando cambia el sexo */
watch(sexoSeleccionado, async (nuevoSexo) => {
  if (nuevoSexo) {
    localidadSeleccionada.value = null // resetear otro filtro
    grupoEdadSeleccionado.value = null // resetear otro filtro
    claseSeleccionada.value = null
    await cargarDimension('respuestas_sexo.json', respuestasSexo)
  }
  actualizarRespuestas()
  actualizarSeries()
})

/** Cuando cambia la clase */
watch(claseSeleccionada, async (nuevaClase) => {
  if (nuevaClase) {
    localidadSeleccionada.value = null
    grupoEdadSeleccionado.value = null
    sexoSeleccionado.value = null
    await cargarDimension('respuestas_clase.json', respuestasClase)
  }
  actualizarRespuestas()
  actualizarSeries()
})

/** Asegurar carga de dimensión_localidad al entrar a la pestañas de Localidades */
watch(contentSection, async (nuevaSeccion) => {
  if (nuevaSeccion === 'localidades') {
    await cargarDimension('respuestas_localidad.json', respuestasLocalidad)
  } else if (nuevaSeccion === 'edades') {
    await cargarDimension('respuestas_edad.json', respuestasEdad)
  } else if (nuevaSeccion === 'sexos') {
    await cargarDimension('respuestas_sexo.json', respuestasSexo)
  } else if (nuevaSeccion === 'clases') {
    await cargarDimension('respuestas_clase.json', respuestasClase)
  }
})
</script>

<template>
  <div class="adv-resultados container-fluid">
    <div class="row">
      <!-- Panel Izquierdo: Listado de Secciones -->
      <aside class="col-md-4 col-lg-3 sections-sidebar">
        <div class="sticky-top offset-navbar">
          <!-- SELECTOR DE SECCIONES -->
          <h4
            class="sidebar-title d-flex justify-content-between align-items-center pr-2"
            role="button"
            style="cursor: pointer; user-select: none"
            @click="toggleSecciones"
          >
            <span>SECCIONES <i class="bi bi-chevron-down small ms-1 opacity-50"></i></span>
            <span
              class="badge rounded-pill bg-light text-muted border text-center"
              style="min-width: 2.5rem"
              >{{ secciones.length }}</span
            >
          </h4>
          <div
            class="selector-seccion"
            role="button"
            aria-expanded="false"
            aria-controls="listaSecciones"
            @click="toggleSecciones"
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
                @click="seleccionarSeccion(seccion)"
              >
                <div class="d-flex w-100 justify-content-start align-items-center">
                  <span class="section-number">{{ seccion.num_seccion }}</span>
                  <span class="section-name text-truncate ms-2">{{ seccion.nombre_seccion }}</span>
                </div>
              </button>
            </div>
          </div>

          <div class="questions-container mt-4">
            <h4 class="sidebar-title d-flex justify-content-between align-items-center pr-2">
              <span
                >PREGUNTAS
                <i
                  class="bi bi-search ms-1 opacity-50 icon-search-btn"
                  role="button"
                  data-bs-toggle="modal"
                  data-bs-target="#searchQuestionModal"
                ></i
              ></span>
              <span
                class="badge rounded-pill bg-light text-muted border text-center"
                style="min-width: 2.5rem"
                >{{ preguntasFiltradas.length }}</span
              >
            </h4>
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
          <ul class="nav nav-tabs mb-2">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'chart' }"
                @click="contentSection = 'chart'"
              >
                <i class="bi bi-bar-chart-line me-1"></i>Totales
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'localidades' }"
                @click="contentSection = 'localidades'"
              >
                <i class="bi bi-geo-alt me-1"></i>Localidades
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'edades' }"
                @click="contentSection = 'edades'"
              >
                <i class="bi bi-person-vcard me-1"></i>Grupos de Edad
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'sexos' }"
                @click="contentSection = 'sexos'"
              >
                <i class="bi bi-people me-1"></i>Sexo
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'clases' }"
                @click="contentSection = 'clases'"
              >
                <i class="bi bi-house-door me-1"></i>Clase Vivienda
              </button>
            </li>
            <li class="nav-item">
              <!-- Link a créditos eliminado, ahora en AdvLayout.vue -->
            </li>
            <li class="nav-item d-none">
              <button
                class="nav-link"
                :class="{ active: contentSection === 'table' }"
                @click="contentSection = 'table'"
              >
                <i class="bi bi-gear me-1"></i>Inspección (Data)
              </button>
            </li>
          </ul>

          <section class="section-filters mb-4 px-1" v-if="contentSection === 'chart'">
            <div class="row align-items-center g-2 g-md-3">
              <!-- SUB-MENU DE ICONOS (A LA IZQUIERDA) -->
              <div class="col-auto">
                <div class="view-toggle-group shadow-sm">
                  <button
                    class="btn btn-view btn-sm px-3"
                    :class="{ active: totalesSubView === 'viz' }"
                    @click="totalesSubView = 'viz'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Ver Visualización Gráfica"
                  >
                    <i class="bi bi-bar-chart-fill"></i>
                  </button>
                  <button
                    class="btn btn-view btn-sm px-3"
                    :class="{ active: totalesSubView === 'table' }"
                    @click="totalesSubView = 'table'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Ver Tabla de Datos"
                  >
                    <i class="bi bi-table"></i>
                  </button>
                </div>
              </div>

              <div class="col-md">
                <select
                  v-model="localidadSeleccionada"
                  class="form-select select-premium"
                  :class="{ 'active-filter': localidadSeleccionada !== null }"
                  :disabled="loadingDimension"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Filtra los resultados generales por localidad"
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
              </div>
              <div class="col-md">
                <select
                  v-model="grupoEdadSeleccionado"
                  class="form-select select-premium"
                  :class="{ 'active-filter': grupoEdadSeleccionado !== null }"
                  :disabled="loadingDimension"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Filtra los resultados por rango de edad"
                >
                  <option :value="null">Todos los grupos de edad</option>
                  <option v-for="grupo in gruposEdad" :key="grupo.id" :value="grupo.id">
                    {{ grupo.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-md">
                <select
                  v-model="sexoSeleccionado"
                  class="form-select select-premium"
                  :class="{ 'active-filter': sexoSeleccionado !== null }"
                  :disabled="loadingDimension"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Filtra los resultados por sexo"
                >
                  <option :value="null">Todos los sexos</option>
                  <option v-for="sexo in sexos" :key="sexo.id" :value="sexo.id">
                    {{ sexo.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-md">
                <select
                  v-model="claseSeleccionada"
                  class="form-select select-premium"
                  :class="{ 'active-filter': claseSeleccionada !== null }"
                  :disabled="loadingDimension"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Filtra por clase de vivienda"
                >
                  <option :value="null">Todas las clases de vivienda</option>
                  <option v-for="clase in clases" :key="clase.id" :value="clase.id">
                    {{ clase.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </section>

          <!-- MOSTRAR CONTENIDO DE TOTALES (GRÁFICO O TABLA) -->
          <div v-if="contentSection === 'chart'" class="mt-4">
            <!-- 1. VISTA DE GRÁFICOS -->
            <div
              v-if="totalesSubView === 'viz'"
              class="graph-container card-premium overflow-hidden"
            >
              <div class="card-body p-0">
                <!-- TIPO DE GRÁFICO BAR MULTIPLE -->
                <BarMultipleChart
                  v-if="preguntaSeleccionada.dataviz_chart_type === 'bar-multiple'"
                  :title="tituloConFiltro"
                  :subtitle="preguntaSeleccionada.enunciado_1"
                  :pregunta="preguntaSeleccionada"
                  :type="'bar'"
                  :series="series"
                  :categorias="categorias"
                />

                <!-- TIPO DE GRÁFICO BAR BOOLEAN (Barras apiladas con solo dos categorías: Sí/No, Presente/Ausente, etc) -->
                <BarYesSelectionChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'bar-yes-selection'"
                  :title="tituloConFiltro"
                  :subtitle="preguntaSeleccionada.enunciado_1"
                  :pregunta="preguntaSeleccionada"
                  :type="'bar'"
                  :series="series"
                  :categorias="categorias"
                />

                <!-- TIPO DE GRÁFICO column -->
                <BarChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'bar'"
                  :title="tituloConFiltro"
                  :pregunta="preguntaSeleccionada"
                  :respuestas="respuestasPregunta"
                  :posiblesRespuestas="posiblesRespuestas"
                  :kpi-value="
                    variablesFiltradas.length > 0 ? variablesFiltradas[0].promedio_ponderado : null
                  "
                  :kpi-label="
                    variablesFiltradas.length > 0 ? variablesFiltradas[0].unidad_medida : null
                  "
                />

                <!-- TIPO DE GRÁFICO DONUT -->
                <DonutChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'donut'"
                  :title="tituloConFiltro"
                  :pregunta="preguntaSeleccionada"
                  :respuestas="respuestasPregunta"
                  :posiblesRespuestas="posiblesRespuestas"
                />

                <!-- TIPO DE GRÁFICO WORD CLOUD -->
                <WordCloudChart
                  v-else-if="preguntaSeleccionada.dataviz_chart_type === 'wordcloud'"
                  :title="tituloConFiltro"
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

            <!-- 2. VISTA DE TABLA PÚBLICA -->
            <div v-if="totalesSubView === 'table'">
              <AdvTable
                :variablesFiltradas="variablesFiltradas"
                :respuestasPregunta="respuestasPregunta"
                :sumatoriaFactor="sumatoriaFactor"
                :posiblesRespuestas="posiblesRespuestas"
              />
            </div>
          </div>

          <!-- MOSTRAR TABLA DE DATOS (DEBUG) -->
          <div v-if="contentSection === 'table'">
            <AdvDebug
              :variablesFiltradas="variablesFiltradas"
              :respuestasPregunta="respuestasPregunta"
              :sumatoriaFactor="sumatoriaFactor"
              :posiblesRespuestas="posiblesRespuestas"
            />
          </div>

          <div v-if="contentSection === 'localidades'">
            <LocalidadesView
              :preguntaSeleccionada="preguntaSeleccionada"
              :variables="variablesFiltradas"
              :posiblesRespuestas="posiblesRespuestas"
              :respuestasLocalidad="respuestasLocalidad"
              :loading="loadingDimension"
              v-model:variableSeleccionada="detalleVariableSeleccionada"
              v-model:respuestaSeleccionada="detalleRespuestaSeleccionada"
            />
          </div>

          <div v-if="contentSection === 'edades'">
            <GruposEdadView
              :preguntaSeleccionada="preguntaSeleccionada"
              :variables="variablesFiltradas"
              :posiblesRespuestas="posiblesRespuestas"
              :respuestasEdad="respuestasEdad"
              :loading="loadingDimension"
              v-model:variableSeleccionada="detalleVariableSeleccionada"
              v-model:respuestaSeleccionada="detalleRespuestaSeleccionada"
            />
          </div>

          <div v-if="contentSection === 'sexos'">
            <SexoView
              :preguntaSeleccionada="preguntaSeleccionada"
              :variables="variablesFiltradas"
              :posiblesRespuestas="posiblesRespuestas"
              :respuestasSexo="respuestasSexo"
              :loading="loadingDimension"
              v-model:variableSeleccionada="detalleVariableSeleccionada"
              v-model:respuestaSeleccionada="detalleRespuestaSeleccionada"
            />
          </div>

          <div v-if="contentSection === 'clases'">
            <ClaseView
              :preguntaSeleccionada="preguntaSeleccionada"
              :variables="variablesFiltradas"
              :posiblesRespuestas="posiblesRespuestas"
              :respuestasClase="respuestasClase"
              :loading="loadingDimension"
              v-model:variableSeleccionada="detalleVariableSeleccionada"
              v-model:respuestaSeleccionada="detalleRespuestaSeleccionada"
            />
          </div>

          <div v-if="contentSection === 'creditos'">
            <!-- AdvCreditos eliminado, ahora en AdvLayout.vue -->
          </div>

          <div v-if="contentSection !== 'creditos'" class="d-flex justify-content-between py-3">
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

    <!-- MODAL BUSCADOR DE PREGUNTAS -->
    <div
      class="modal fade"
      id="searchQuestionModal"
      tabindex="-1"
      aria-labelledby="searchModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg">
          <div class="p-2">
            <AdvSearchQuestion />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adv-resultados {
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
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5c6972;
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
}

.icon-search-btn {
  transition: all 0.2s ease;
}

.icon-search-btn:hover {
  opacity: 1 !important;
  color: var(--color-primary);
  transform: scale(1.1);
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
  min-width: 35px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 800;
  padding: 0 6px;
}

.section-item.active .section-number,
.active-number {
  background: #32204a;
  color: #fff;
}

/* ESTILOS PREGUNTAS */
.questions-menu {
  border-radius: var(--radius-premium) 0 0 var(--radius-premium);
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid #eef0f2;
}

.question-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8f9fa;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  background: transparent;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.question-item.active {
  background-color: #ffffff;
  color: var(--color-primary);
  border-top: 1px solid var(--color-primary-light);
  border-bottom: 1px solid var(--color-primary-light);
  border-left: 4px solid var(--color-primary);
  box-shadow: inset 0 0 10px rgba(50, 32, 74, 0.02);
}

.question-code {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--color-muted);
  background: #f1f3f5;
  padding: 0 6px;
  border-radius: 4px;
  min-width: 35px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-item.active .question-code {
  background: var(--color-primary);
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

.rounded-4 {
  border-radius: var(--radius-premium) !important;
}

/* --- ESTILOS SELECTOR DE VISTA (TABS) --- */
.nav-tabs {
  border-bottom: 1px solid #eef0f2 !important;
  gap: 1rem;
}

.nav-tabs .nav-link {
  border: none !important;
  color: var(--color-muted) !important;
  font-weight: 600;
  padding: 0.6rem 0.5rem;
  background: transparent !important;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.95rem;
}

.nav-tabs .nav-link:hover {
  color: var(--color-primary) !important;
}

.nav-tabs .nav-link.active {
  color: var(--color-primary) !important;
  font-weight: 800 !important;
  border-bottom: 2px solid #ffca28 !important;
  border-radius: 0;
}

.view-toggle-group {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 14px;
}

.btn-view {
  border: none;
  background: transparent;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-view:hover {
  color: #32204a;
  background: rgba(255, 255, 255, 0.5);
}

.btn-view.active {
  background: #ffffff;
  color: #32204a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
