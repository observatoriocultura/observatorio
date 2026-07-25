<template>
  <main class="meta-pdd-page meta-pdd-control-page">
    <div class="page-container">
      <header class="page-header">
        <div class="title-block">
          <p class="eyebrow">Control interno · Meta Plan Distrital de Desarrollo 2024-2027</p>
          <h1>Mediciones Observatorio</h1>
        </div>

        <aside class="summary-strip" aria-label="Resumen de mediciones">
          <div class="summary-item">
            <span class="summary-label">Registradas</span>
            <strong>{{ loading ? '—' : mediciones.length }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Meta</span>
            <strong>{{ MEDICIONES_REQUERIDAS }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Faltantes</span>
            <strong>{{ loading ? '—' : medicionesPendientes }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Avance general</span>
            <strong>{{ loading ? '—' : `${avanceMeta}%` }}</strong>
          </div>
        </aside>
      </header>

      <section class="tracking-files" aria-labelledby="archivos-seguimiento-titulo">
        <div class="tracking-files-heading">
          <i class="bi bi-file-earmark-spreadsheet" aria-hidden="true"></i>
          <h2 id="archivos-seguimiento-titulo">Archivos fuente</h2>
        </div>
        <div class="tracking-files-list">
          <a
            v-for="archivo in archivosSeguimiento"
            :key="archivo.year"
            class="tracking-file-link"
            :href="archivo.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Abrir archivo de seguimiento ${archivo.year}`"
          >
            <span class="tracking-file-icon" aria-hidden="true">
              <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            </span>
            <span class="tracking-file-copy">
              <strong>{{ archivo.year }}</strong>
            </span>
            <i class="bi bi-arrow-up-right tracking-file-arrow" aria-hidden="true"></i>
          </a>
        </div>
      </section>

      <section class="filters-panel" aria-label="Filtros de mediciones">
        <nav class="year-filter" aria-label="Filtrar mediciones por año">
          <button
            type="button"
            class="year-filter-item"
            :class="{ active: selectedYear === null }"
            :aria-pressed="selectedYear === null"
            @click="selectedYear = null"
          >
            <span>Todas</span>
            <strong>{{ mediciones.length }}</strong>
          </button>
          <button
            v-for="year in YEARS"
            :key="year"
            type="button"
            class="year-filter-item"
            :class="{ active: selectedYear === year }"
            :aria-pressed="selectedYear === year"
            @click="selectedYear = year"
          >
            <span>{{ year }}</span>
            <strong>{{ medicionesPorAnio.get(year) ?? 0 }}</strong>
          </button>
        </nav>

        <label class="search-field" for="buscar-mediciones">
          <i class="bi bi-search" aria-hidden="true"></i>
          <span class="visually-hidden">Buscar mediciones</span>
          <input
            id="buscar-mediciones"
            v-model="busqueda"
            type="search"
            placeholder="Buscar por título, línea de investigación, tema o expediente"
            autocomplete="off"
          />
        </label>
      </section>

      <section class="list-toolbar" aria-labelledby="mediciones-titulo">
        <div>
          <h2 id="mediciones-titulo">Listado de mediciones</h2>
          <p>
            <template v-if="medicionesFiltradas.length === mediciones.length">
              {{ mediciones.length }} registros disponibles
            </template>
            <template v-else>
              {{ medicionesFiltradas.length }} de {{ mediciones.length }} registros visibles
            </template>
          </p>
        </div>

        <span class="filter-context">
          {{ selectedYear === null ? 'Todas las vigencias' : `Vigencia ${selectedYear}` }}
        </span>
      </section>

      <div v-if="loading" class="status-panel" role="status">
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span>Cargando mediciones...</span>
      </div>

      <div v-else-if="errorMessage" class="status-panel status-panel-error" role="alert">
        <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-else-if="medicionesFiltradas.length === 0" class="status-panel">
        <i class="bi bi-search" aria-hidden="true"></i>
        <span>
          {{
            busqueda || selectedYear !== null
              ? 'No hay mediciones que coincidan con los filtros.'
              : 'No hay mediciones disponibles.'
          }}
        </span>
      </div>

      <section v-else class="measurements-list" aria-label="Tabla de mediciones">
        <table class="meta-pdd-table">
          <caption class="visually-hidden">
            Mediciones de control de la Meta PDD 2027
          </caption>
          <colgroup>
            <col class="col-number" />
            <col class="col-year" />
            <col class="col-id" />
            <col class="col-measurement" />
            <col class="col-linea" />
            <col class="col-count" />
            <col class="col-count" />
            <col class="col-count" />
            <col class="col-count" />
            <col class="col-radicado" />
            <col class="col-progress" />
            <col class="col-action" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="number-cell">N.º</th>
              <th scope="col">Vigencia</th>
              <th scope="col" class="id-cell">ID</th>
              <th scope="col">Medición</th>
              <th scope="col">Línea de investigación</th>
              <th scope="col" class="count-heading">Productos</th>
              <th scope="col" class="count-heading">Radicados</th>
              <th scope="col" class="count-heading">Hallazgos</th>
              <th scope="col" class="count-heading">Páginas</th>
              <th scope="col">Expediente Orfeo</th>
              <th scope="col">Avance</th>
              <th scope="col"><span class="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="medicion in medicionesFiltradas" :key="medicion.id">
              <td class="number-cell" data-label="Número">{{ numeroMedicion(medicion) }}</td>
              <td class="meta-cell year-cell" data-label="Vigencia">
                <span class="year-badge" :class="vigenciaClass(medicion.year_vigencia)">
                  {{ displayValue(medicion.year_vigencia) }}
                </span>
              </td>
              <td class="id-cell" data-label="ID">{{ medicion.id }}</td>
              <td class="medicion-cell" data-label="Medición">
                <a
                  v-if="tieneProductos(medicion)"
                  class="measurement-title-link"
                  :href="medicionUrl(medicion)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ nombreClaveSinId(medicion.nombre_clave) }}
                </a>
                <strong v-else>{{ nombreClaveSinId(medicion.nombre_clave) }}</strong>
                <span v-if="medicion.investigadores" class="investigadores-line text-muted">
                  {{ medicion.investigadores }}
                </span>
              </td>
              <td class="meta-cell linea-cell" data-label="Línea de investigación">
                <span
                  v-if="medicion.linea_investigacion"
                  class="label linea-badge"
                  :class="getLineaClass(medicion.linea_investigacion)"
                >
                  {{ medicion.linea_investigacion }}
                </span>
                <span v-else class="linea-empty">Sin línea registrada</span>
              </td>
              <td
                class="meta-cell count-cell"
                :class="indicadorClass(medicion.cantidad_productos, 'productos')"
                data-label="Productos"
              >
                {{ formatNumber(medicion.cantidad_productos) }}
              </td>
              <td
                class="meta-cell count-cell"
                :class="indicadorClass(medicion.cantidad_radicados, 'radicados')"
                data-label="Radicados"
              >
                {{ formatNumber(medicion.cantidad_radicados) }}
              </td>
              <td
                class="meta-cell count-cell"
                :class="indicadorClass(medicion.cantidad_hallazgos, 'hallazgos')"
                data-label="Hallazgos"
              >
                {{ formatNumber(medicion.cantidad_hallazgos) }}
              </td>
              <td
                class="meta-cell count-cell"
                :class="indicadorClass(medicion.cantidad_paginas, 'paginas')"
                data-label="Páginas"
              >
                {{ formatNumber(medicion.cantidad_paginas) }}
              </td>
              <td
                class="meta-cell radicado-cell"
                :class="expedienteClass(medicion.expediente_orfeo)"
                data-label="Expediente Orfeo"
              >
                {{ displayValue(medicion.expediente_orfeo) }}
              </td>
              <td class="meta-cell" data-label="Avance">
                <div class="progress-copy">
                  <span>{{ avance(medicion) }}%</span>
                  <div
                    class="progress-track"
                    role="progressbar"
                    :aria-valuenow="avance(medicion)"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-label="`Avance: ${avance(medicion)}%`"
                  >
                    <span :style="{ width: `${avance(medicion)}%` }"></span>
                  </div>
                </div>
              </td>
              <td class="action-cell">
                <a
                  v-if="tieneProductos(medicion)"
                  class="open-button"
                  :href="medicionUrl(medicion)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Abrir</span>
                  <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import '../../../assets/styles/scrd.css'
import { supabase } from '../../../lib/supabase'
import { toClassName } from '../../../utils/text'

const BUCKET = 'investigaciones'
const FILE_PATH = 'meta_pdd_2027/investigaciones.json'
const YEARS = [2024, 2025, 2026, 2027]
const MEDICIONES_REQUERIDAS = 120
const archivosSeguimiento = [
  {
    year: 2024,
    url: 'https://docs.google.com/spreadsheets/d/1vdCB9ZOyay0eHCqSxNVKcylW4FHU0jeHyAL0kuM2OB0/edit?gid=1209666804#gid=1209666804',
  },
  {
    year: 2025,
    url: 'https://docs.google.com/spreadsheets/d/1E26lwaWDXqi6kvbjr_uOCvr6jVbs_85DHD571CvoBQ0/edit?gid=1209666804#gid=1209666804',
  },
  {
    year: 2026,
    url: 'https://docs.google.com/spreadsheets/d/1u0WZmcJRNEUEb5kDJtwS2loSNIG7lORmgJuiWdBhMz8/edit?gid=1209666804#gid=1209666804',
  },
]

const mediciones = ref([])
const busqueda = ref('')
const selectedYear = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const avanceMeta = computed(() => {
  if (loading.value) return 0

  const total = mediciones.value.reduce((suma, medicion) => suma + avance(medicion), 0)
  return mediciones.value.length ? Math.round(total / mediciones.value.length) : 0
})

const medicionesPendientes = computed(() =>
  Math.max(0, MEDICIONES_REQUERIDAS - mediciones.value.length),
)

const medicionesPorAnio = computed(() =>
  mediciones.value.reduce((conteo, medicion) => {
    const year = Number(medicion.year_vigencia)
    conteo.set(year, (conteo.get(year) ?? 0) + 1)
    return conteo
  }, new Map()),
)

const numerosPorId = computed(
  () => new Map(mediciones.value.map((medicion, index) => [medicion.id, index + 1])),
)

const medicionesFiltradas = computed(() => {
  const termino = busqueda.value.trim().toLocaleLowerCase()

  return mediciones.value.filter((medicion) => {
    const coincideConElAnio =
      selectedYear.value === null || Number(medicion.year_vigencia) === selectedYear.value
    const coincideConLaBusqueda =
      !termino ||
      [
        medicion.id,
        medicion.nombre_clave,
        medicion.tema,
        medicion.linea_investigacion,
        medicion.investigador_responsable,
        medicion.expediente_orfeo,
        medicion.estado,
      ].some((value) =>
        String(value ?? '')
          .toLocaleLowerCase()
          .includes(termino),
      )

    return coincideConElAnio && coincideConLaBusqueda
  })
})

const displayValue = (value, fallback = 'No registrado') => value || fallback

const nombreClaveSinId = (value) => {
  const nombreClave = String(value ?? '').trim()
  const nombreSinId = nombreClave.replace(/^(?:ID\s*)?\d+\s+/i, '').trim()

  return nombreSinId || 'Sin nombre clave'
}

const formatNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? new Intl.NumberFormat('es-CO').format(number) : '0'
}

const indicadorClass = (value, tipo) => {
  const number = Number(value)

  if (!Number.isFinite(number) || number === 0) return 'cell-alert-danger'

  const isWarning =
    (tipo === 'productos' && number === 1) ||
    (tipo === 'hallazgos' && number >= 1 && number <= 3) ||
    (tipo === 'radicados' && number === 1) ||
    (tipo === 'paginas' && number >= 1 && number <= 10)

  return isWarning ? 'cell-alert-warning' : ''
}

const expedienteClass = (value) =>
  String(value ?? '').trim() ? '' : 'cell-alert-danger'

const getLineaClass = (linea) => `bg-${toClassName(linea)}`

const avance = (medicion) => {
  const value = Number(medicion.avance)
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
}

const numeroMedicion = (medicion) => numerosPorId.value.get(medicion.id) ?? 0

const medicionUrl = (medicion) =>
  `https://observatoriocultura.github.io/observatorio/#/investigaciones?investigacion_id=${encodeURIComponent(medicion.id)}`

const tieneProductos = (medicion) => Number(medicion.cantidad_productos) > 0

const vigenciaClass = (year) => {
  const normalizedYear = Number(year)

  if (normalizedYear === 2024) return 'year-badge-yellow'
  if (normalizedYear === 2025) return 'year-badge-purple'
  if (normalizedYear === 2026) return 'year-badge-yellow-alt'
  if (normalizedYear === 2027) return 'year-badge-purple-alt'
  return 'year-badge-default'
}

const cargarMediciones = async () => {
  if (!supabase) {
    errorMessage.value = 'Supabase no está configurado.'
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH)
    const response = await fetch(data.publicUrl)

    if (!response.ok) {
      throw new Error(`No fue posible descargar el archivo (${response.status}).`)
    }

    const contenido = await response.json()
    if (!Array.isArray(contenido)) {
      throw new Error('El archivo de mediciones no tiene el formato esperado.')
    }

    mediciones.value = contenido
  } catch (error) {
    console.error('No fue posible cargar las mediciones de la Meta PDD.', error)
    errorMessage.value = 'No fue posible cargar las mediciones. Intenta nuevamente más tarde.'
    mediciones.value = []
  } finally {
    loading.value = false
  }
}

onMounted(cargarMediciones)
</script>

<style scoped>
.meta-pdd-page {
  --meta-primary: #4b2f73;
  --meta-primary-soft: #f1ecf7;
  --meta-accent: #0f766e;
  --meta-accent-soft: #e8f3f1;
  --meta-warning-soft: #fff5d6;
  --meta-warning: #8a650e;
  --meta-ink: #24212a;
  --meta-muted: #6f6876;
  --meta-soft: #f6f5f7;
  --meta-border: #e3dfe8;
  --meta-line: #eeeaf2;
  min-height: 100vh;
  padding: clamp(1rem, 2.2vw, 2rem);
  background: #f8f7f9;
}

.page-container {
  width: min(100%, 1500px);
  margin-inline: auto;
}

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(520px, 580px);
  align-items: end;
  gap: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--meta-border);
}

.tracking-files {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--meta-border);
  border-radius: 8px;
  background-color: #fff;
}

.tracking-files-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.tracking-files-heading > i {
  color: var(--meta-accent);
  font-size: 1.2rem;
}

.tracking-files-heading h2 {
  margin: 0;
  color: var(--meta-ink);
  font-size: 0.82rem;
  font-weight: 800;
  white-space: nowrap;
}

.tracking-files-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem;
}

.tracking-file-link {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  border: 1px solid #d9ebe8;
  border-radius: 8px;
  padding: 0.4rem 0.45rem;
  background-color: var(--meta-accent-soft);
  color: var(--meta-ink);
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.tracking-file-link:hover,
.tracking-file-link:focus-visible {
  border-color: var(--meta-accent);
  background-color: #dff0ed;
  outline: 0;
  transform: translateY(-0.05rem);
}

.tracking-file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 1.45rem;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 6px;
  background-color: #fff;
  color: var(--meta-accent);
  font-size: 0.8rem;
}

.tracking-file-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.tracking-file-copy strong {
  color: var(--meta-ink);
  font-size: 0.78rem;
  line-height: 1.1;
}

.tracking-file-arrow {
  color: var(--meta-accent);
  font-size: 0.68rem;
}

.title-block {
  max-width: 860px;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--meta-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: var(--meta-ink);
  font-size: clamp(1.55rem, 2.4vw, 2.25rem);
  font-weight: 800;
  line-height: 1.12;
}

.summary-strip {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--meta-border);
  border-radius: 8px;
  background-color: #fff;
}

.summary-item {
  display: flex;
  min-height: 4.25rem;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: 0.65rem 0.8rem;
  border-right: 1px solid var(--meta-line);
}

.summary-item:last-child {
  border-right: 0;
}

.summary-label {
  display: block;
  color: var(--meta-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.summary-item strong {
  display: block;
  margin-top: 0.22rem;
  color: var(--meta-ink);
  font-size: 1.45rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.filters-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--meta-border);
  border-radius: 8px;
  background-color: #fff;
}

.year-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.year-filter-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.25rem;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 0.4rem 0.7rem;
  background: #f7f6f8;
  color: var(--meta-muted);
  font-size: 0.82rem;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;
}

.year-filter-item strong {
  min-width: 1.35rem;
  border-radius: 999px;
  padding: 0.12rem 0.35rem;
  background-color: #fff;
  color: var(--meta-primary);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
}

.year-filter-item:hover,
.year-filter-item:focus-visible {
  border-color: rgba(75, 47, 115, 0.22);
  background-color: var(--meta-primary-soft);
  color: var(--meta-primary);
  outline: 0;
}

.year-filter-item.active {
  background-color: var(--meta-primary);
  color: #fff;
}

.year-filter-item.active strong {
  background-color: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  min-height: 2.45rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--meta-border);
  border-radius: 8px;
  background-color: #fff;
  color: #928b99;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-field:focus-within {
  border-color: rgba(75, 47, 115, 0.62);
  box-shadow: 0 0 0 0.2rem rgba(75, 47, 115, 0.1);
}

.search-field input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--meta-ink);
  font-size: 0.85rem;
}

.search-field input::placeholder {
  color: #9b95a0;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.list-toolbar h2 {
  margin: 0;
  color: var(--meta-ink);
  font-size: 1rem;
  font-weight: 800;
}

.list-toolbar p {
  margin: 0.2rem 0 0;
  color: var(--meta-muted);
  font-size: 0.78rem;
}

.filter-context {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  border: 1px solid var(--meta-border);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background-color: #fff;
  color: var(--meta-muted);
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 180px;
  border: 1px dashed #d9d1df;
  border-radius: 8px;
  background-color: #fff;
  color: var(--meta-muted);
}

.status-panel-error {
  border-color: #edc7cb;
  color: #842029;
}

.measurements-list {
  border: 1px solid var(--meta-border);
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 0.35rem 1rem rgba(40, 33, 48, 0.05);
}

.meta-pdd-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  color: #3d3743;
}

.col-number {
  width: 4.5rem;
}

.col-id {
  width: 5.5rem;
}

.col-measurement {
  width: 25%;
}

.col-linea {
  width: 13%;
}

.col-count {
  width: 5.5%;
}

.col-year {
  width: 7rem;
}

.col-radicado {
  width: 12%;
}

.col-progress {
  width: 11%;
}

.col-action {
  width: 5.8rem;
}

.meta-pdd-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid var(--meta-border);
  background-color: #f5f3f7;
  color: #6d6574;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.045em;
  text-align: left;
  text-transform: uppercase;
}

.count-heading {
  text-align: center !important;
}

.meta-pdd-table th:first-child {
  border-top-left-radius: 8px;
}

.meta-pdd-table th:last-child {
  border-top-right-radius: 8px;
}

.meta-pdd-table td {
  padding: 0.82rem 0.75rem;
  border-bottom: 1px solid var(--meta-line);
  background-color: #fff;
  font-size: 0.8rem;
  line-height: 1.4;
  vertical-align: middle;
  overflow-wrap: anywhere;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.meta-pdd-table tbody tr:last-child td {
  border-bottom: 0;
}

.meta-pdd-table tbody tr:hover td {
  background-color: #fbfafc;
}

.meta-pdd-table tbody tr:hover td:first-child {
  box-shadow: inset 3px 0 0 var(--meta-primary);
}

.number-cell {
  color: #7f7787;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  text-align: center !important;
}

.meta-pdd-table tbody .number-cell {
  color: var(--meta-primary);
  font-size: 0.76rem;
  font-weight: 700;
}

.id-cell {
  color: var(--meta-primary);
  font-size: 1.05rem;
  font-variant-numeric: tabular-nums;
  font-weight: 900;
  text-align: center !important;
}

.medicion-cell strong {
  display: block;
  color: var(--meta-ink);
  font-size: 0.88rem;
  font-weight: 750;
  line-height: 1.3;
}

.measurement-title-link {
  display: block;
  color: var(--meta-ink);
  font-size: 0.88rem;
  font-weight: 750;
  line-height: 1.3;
  text-decoration: none;
  transition: color 0.18s ease;
}

.measurement-title-link:hover,
.measurement-title-link:focus-visible {
  color: var(--meta-primary);
  outline: 0;
  text-decoration: underline;
  text-decoration-thickness: 0.08rem;
  text-underline-offset: 0.18rem;
}

.investigadores-line {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.72rem;
  line-height: 1.35;
}

.meta-cell {
  color: #4b4551;
}

.linea-cell {
  line-height: 1.25;
}

.linea-badge {
  white-space: normal;
}

.linea-empty {
  color: var(--meta-muted);
  font-size: 0.72rem;
}

.count-cell {
  color: var(--meta-primary);
  font-size: 0.85rem !important;
  font-variant-numeric: tabular-nums;
  font-weight: 850;
  text-align: center;
}

.cell-alert-danger {
  background-color: #fde6e6 !important;
  color: #842029 !important;
}

.cell-alert-warning {
  background-color: #fff0d8 !important;
  color: #975b05 !important;
}

.radicado-cell {
  font-size: 0.72rem !important;
  font-variant-numeric: tabular-nums;
}

.year-cell {
  text-align: center;
}

.year-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.8rem;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  font-weight: 850;
  line-height: 1.2;
}

.year-badge-yellow {
  border-color: #f0d989;
  background-color: #fff4c7;
  color: #70520a;
}

.year-badge-purple {
  border-color: #d7c4ef;
  background-color: #f0e7fb;
  color: #56327f;
}

.year-badge-yellow-alt {
  border-color: #ead48f;
  background-color: #fff7d8;
  color: #765a16;
}

.year-badge-purple-alt {
  border-color: #cdb8e6;
  background-color: #eadff6;
  color: #4b2f73;
}

.year-badge-default {
  border-color: var(--meta-border);
  background-color: #f7f6f8;
  color: var(--meta-muted);
}

.progress-copy {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--meta-ink);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

.progress-track {
  flex: 1;
  height: 0.34rem;
  overflow: hidden;
  border-radius: 999px;
  background-color: #ebe8ef;
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background-color: var(--meta-accent);
}

.action-cell {
  text-align: right;
}

.open-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-height: 2rem;
  border: 1px solid rgba(75, 47, 115, 0.22);
  border-radius: 8px;
  padding: 0.34rem 0.58rem;
  background-color: var(--meta-primary-soft);
  color: var(--meta-primary);
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.open-button:hover,
.open-button:focus-visible {
  background-color: var(--meta-primary);
  color: #fff;
  outline: 0;
  transform: translateY(-0.05rem);
}

@media (max-width: 1100px) {
  .page-header,
  .filters-panel {
    grid-template-columns: 1fr;
  }

  .summary-strip {
    max-width: 580px;
  }

  .measurements-list {
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .meta-pdd-table,
  .meta-pdd-table tbody {
    display: block;
    width: 100%;
  }

  .meta-pdd-table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .meta-pdd-table tbody {
    display: grid;
    gap: 0.75rem;
  }

  .meta-pdd-table tbody tr {
    display: grid;
    grid-template-columns: 3.25rem minmax(0, 1fr) auto;
    overflow: visible;
    border: 1px solid var(--meta-border);
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 0.25rem 0.8rem rgba(40, 33, 48, 0.04);
  }

  .meta-pdd-table td {
    display: grid;
    grid-template-columns: minmax(7rem, 22%) minmax(0, 1fr);
    grid-column: 2 / 4;
    gap: 0.65rem;
    width: auto;
    padding: 0.6rem 0.85rem;
    border-bottom: 1px solid var(--meta-line);
    background: transparent;
  }

  .meta-pdd-table td::before {
    content: attr(data-label);
    color: #817986;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .meta-pdd-table .number-cell {
    display: flex;
    grid-column: 1;
    grid-row: 1 / 3;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem 0.4rem;
    border-right: 1px solid var(--meta-line);
    border-bottom: 0;
    background-color: #faf9fb;
    box-shadow: inset 3px 0 0 var(--meta-primary);
  }

  .meta-pdd-table .number-cell::before,
  .meta-pdd-table .medicion-cell::before,
  .meta-pdd-table .action-cell::before {
    content: none;
  }

  .meta-pdd-table .medicion-cell {
    display: block;
    grid-column: 2;
    grid-row: 1;
    padding: 0.9rem 0.75rem;
  }

  .meta-pdd-table .action-cell {
    display: flex;
    grid-column: 3;
    grid-row: 1;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 0.8rem 0.8rem 0.8rem 0;
    border-bottom: 1px solid var(--meta-line);
  }

  .meta-pdd-table tbody tr:last-child td {
    border-bottom: 1px solid var(--meta-line);
  }

  .meta-pdd-table tbody tr td:last-child,
  .meta-pdd-table tbody tr .meta-cell:last-of-type {
    border-bottom: 0;
  }

  .progress-copy {
    max-width: 280px;
  }
}

@media (max-width: 720px) {
  .meta-pdd-page {
    padding: 0.85rem;
  }

  .tracking-files {
    grid-template-columns: 1fr;
  }

  .tracking-files-list {
    grid-template-columns: 1fr;
  }

  .page-header {
    gap: 0.9rem;
  }

  .summary-strip {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-right: 0;
    border-bottom: 1px solid var(--meta-line);
  }

  .summary-item:last-child {
    border-bottom: 0;
  }

  .year-filter-item {
    flex: 1 1 5.2rem;
    min-width: 0;
    padding-inline: 0.45rem;
  }

  .list-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-context {
    width: fit-content;
  }

  .meta-pdd-table td {
    grid-template-columns: 6.5rem minmax(0, 1fr);
  }
}

@media (max-width: 460px) {
  .year-filter-item {
    padding-inline: 0.25rem;
    font-size: 0.76rem;
  }

  .meta-pdd-table tbody tr {
    grid-template-columns: 2.6rem minmax(0, 1fr) auto;
  }

  .meta-pdd-table td {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    padding-inline: 0.7rem;
  }

  .meta-pdd-table .number-cell {
    padding-inline: 0.2rem;
  }

  .open-button {
    padding-inline: 0.5rem;
  }
}
</style>
