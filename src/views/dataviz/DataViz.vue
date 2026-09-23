<template>
  <main class="container py-4 dataviz-explorer">
    <div v-if="loading" class="dataviz-loading" role="status">
      <div class="spinner-border" aria-hidden="true"></div>
      <span class="visually-hidden">Cargando tableros...</span>
    </div>

    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-2" type="button" @click="loadDashboards">
          Reintentar
        </button>
      </div>

      <header class="dataviz-header">
        <h1 class="dataviz-title">Tableros de visualización de datos</h1>
        <p class="dataviz-description">
          Explora los tableros con información sobre las culturas, prácticas y dinámicas de Bogotá.
        </p>
      </header>

      <section v-if="dashboards.length" aria-label="Listado de tableros">
        <div class="dataviz-search">
          <ListSearchInput
            v-model="searchInput"
            id="dataviz-search"
            placeholder="Buscar tableros..."
            aria-label="Buscar tableros de visualización de datos"
            clear-label="Limpiar búsqueda de tableros"
          />
          <p class="dataviz-search-counter" aria-live="polite">
            <span>{{ filteredDashboards.length }}</span> de {{ dashboards.length }} tableros
          </p>
        </div>

        <div v-if="filteredDashboards.length === 0" class="dataviz-empty">
          No se encontraron tableros para tu búsqueda.
        </div>

        <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          <div v-for="dashboard in filteredDashboards" :key="dashboard.id" class="col">
            <article class="card h-100 dashboard-card">
              <a
                v-if="dashboard.link"
                :href="dashboard.link"
                class="dashboard-thumbnail-link"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`Abrir tablero: ${dashboard.title}`"
              >
                <img
                  :src="getThumbnailUrl(dashboard)"
                  class="card-img-top object-fit-cover dashboard-thumbnail"
                  :alt="`Miniatura del tablero ${dashboard.title}`"
                  loading="lazy"
                  @error="useDefaultThumbnail"
                />
              </a>
              <img
                v-else
                :src="getThumbnailUrl(dashboard)"
                class="card-img-top object-fit-cover dashboard-thumbnail"
                :alt="`Miniatura del tablero ${dashboard.title}`"
                loading="lazy"
                @error="useDefaultThumbnail"
              />

              <div class="card-body dashboard-card-body">
                <span v-if="dashboard.yearHasta" class="dashboard-year">
                  {{ dashboard.yearHasta }}
                </span>

                <a
                  v-if="dashboard.link"
                  :href="dashboard.link"
                  class="dashboard-title-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2 class="card-title fw-bold mb-1 dashboard-title" :title="dashboard.title">
                    {{ dashboard.title }}
                  </h2>
                </a>
                <h2 v-else class="card-title fw-bold mb-1 dashboard-title" :title="dashboard.title">
                  {{ dashboard.title }}
                </h2>

                <p v-if="dashboard.description" class="dashboard-description">
                  {{ getDescriptionPreview(dashboard.description) }}
                </p>
                <button
                  v-if="hasMoreDescription(dashboard.description)"
                  type="button"
                  class="dashboard-more-button"
                  @click="openDashboardDetails(dashboard)"
                >
                  Ver más
                </button>

                <div v-if="dashboard.theme" class="dashboard-meta">
                  <span class="dashboard-theme" :title="dashboard.theme">
                    {{ dashboard.theme }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div v-else-if="!errorMessage" class="dataviz-empty">
        No hay tableros públicos disponibles.
      </div>
    </div>
  </main>

  <Teleport to="body">
    <div
      ref="detailModalElement"
      class="modal fade dataviz-modal"
      tabindex="-1"
      aria-labelledby="dataviz-detail-title"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <p v-if="selectedDashboard?.type" class="dashboard-type mb-1">
                {{ selectedDashboard.type }}
              </p>
              <h2 id="dataviz-detail-title" class="modal-title fs-5 fw-bold">
                {{ selectedDashboard?.title }}
              </h2>
            </div>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>
          <div v-if="selectedDashboard" class="modal-body">
            <p class="modal-description">
              {{ selectedDashboard.description || 'Este tablero no tiene una descripción disponible.' }}
            </p>
            <dl class="dashboard-detail-list">
              <template v-if="selectedDashboard.theme">
                <dt>Tema</dt>
                <dd>{{ selectedDashboard.theme }}</dd>
              </template>
              <template v-if="selectedDashboard.year">
                <dt>Periodo</dt>
                <dd>{{ selectedDashboard.year }}</dd>
              </template>
              <template v-if="selectedDashboard.platform">
                <dt>Plataforma</dt>
                <dd>{{ selectedDashboard.platform }}</dd>
              </template>
              <template v-if="selectedDashboard.status">
                <dt>Estado</dt>
                <dd>{{ selectedDashboard.status }}</dd>
              </template>
              <template v-if="selectedDashboard.keywords">
                <dt>Palabras clave</dt>
                <dd>{{ selectedDashboard.keywords }}</dd>
              </template>
            </dl>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
            <a
              v-if="selectedDashboard?.link"
              :href="selectedDashboard.link"
              class="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              data-bs-dismiss="modal"
            >
              Abrir tablero
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import ListSearchInput from '../../components/ListSearchInput.vue'
import { fetchGoogleSheetCsv } from '../../utils/googleSheets'

// Identificador del archivo de Google Sheets que contiene los tableros.
const sheetFileId = '1K4Ly_hU0j6-bIo-SAtXHMeBiizrUEsg4w8XE8o5Lpik'
// Identificador de la pestaña que se consulta dentro del archivo.
const sheetGid = '0'
// Ruta base configurada por Vite para construir URL públicas.
const baseUrl = import.meta.env.BASE_URL
// Imagen que se muestra cuando un tablero no tiene una miniatura válida.
const defaultThumbnailUrl = `${baseUrl}resources/images/app/portada_16_9.jpg`

// Lista normalizada de tableros públicos obtenidos desde Google Sheets.
const dashboards = ref([])
// Indica si la información todavía se está cargando.
const loading = ref(true)
// Guarda el mensaje que se muestra cuando falla la carga.
const errorMessage = ref('')
// Contiene el texto ingresado en el buscador.
const searchInput = ref('')
// Guarda el tablero que se presenta en la ventana modal.
const selectedDashboard = ref(null)
// Referencia al elemento HTML de la ventana modal.
const detailModalElement = ref(null)
// Conserva la instancia de Bootstrap utilizada para controlar la ventana modal.
let detailModalInstance = null

// Normaliza un texto para realizar búsquedas sin distinguir mayúsculas ni tildes.
const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

// Interpreta los valores admitidos por la hoja para determinar si un tablero es público.
const isPublic = (value) => {
  // Valor limpio que se compara con las variantes aceptadas.
  const normalized = normalizeText(value)
  if (!normalized) return false
  return ['1', 'si', 'true', 'publico', 'publica'].includes(normalized)
}

// Convierte una fila de la hoja en la estructura utilizada por las tarjetas.
const normalizeDashboard = (row, index) => {
  // Año inicial del periodo cubierto por el tablero.
  const startYear = row.year_desde?.trim()
  // Año final utilizado también como etiqueta visible en la tarjeta.
  const endYear = row.year_hasta?.trim()
  // Año de preparación usado cuando no existe un periodo definido.
  const preparationYear = row.year_preparacion?.trim()
  // Texto del periodo completo que se muestra en el detalle del tablero.
  const year = startYear
    ? endYear && endYear !== startYear
      ? `${startYear}–${endYear}`
      : startYear
    : preparationYear

  return {
    id: row.id?.trim() || row.codigo?.trim() || `tablero-${index}`,
    title: row.nombre?.trim() || row.titulo?.trim() || 'Tablero sin título',
    description: row.descripcion?.trim() || '',
    keywords: row.palabras_clave?.trim() || '',
    theme: row.tema?.trim() || '',
    year,
    yearHasta: endYear || '',
    platform: row.plataforma?.trim() || '',
    type: row.tipo_tablero?.trim() || row.tipo?.trim() || '',
    status: row.estado?.trim() || '',
    link: row.link?.trim() || row.url_publicacion?.trim() || '',
    public: isPublic(row.publico),
  }
}

// Construye la ruta de la miniatura a partir del identificador del tablero.
const getThumbnailUrl = (dashboard) =>
  `${baseUrl}content/dataviz/thumbnails/${encodeURIComponent(dashboard.id)}.jpg`

// Sustituye una miniatura que no pudo cargarse por la imagen predeterminada.
const useDefaultThumbnail = (event) => {
  // Elemento de imagen que produjo el error de carga.
  const image = event.currentTarget
  if (image.dataset.fallbackApplied) return

  image.dataset.fallbackApplied = 'true'
  image.src = defaultThumbnailUrl
}

// Devuelve una descripción de hasta 100 caracteres para la tarjeta.
const getDescriptionPreview = (description = '') => {
  // Arreglo de caracteres que permite recortar correctamente texto Unicode.
  const characters = Array.from(description)
  if (characters.length <= 100) return description

  return `${characters.slice(0, 99).join('').trimEnd()}…`
}

// Indica si la descripción completa debe estar disponible mediante “Ver más”.
const hasMoreDescription = (description = '') => Array.from(description).length > 100

// Filtra los tableros usando todos los términos escritos en el buscador.
const filteredDashboards = computed(() => {
  // Términos normalizados que deben aparecer en los datos del tablero.
  const terms = normalizeText(searchInput.value).split(/\s+/).filter(Boolean)
  if (!terms.length) return dashboards.value

  return dashboards.value.filter((dashboard) => {
    // Texto consolidado con los campos disponibles para la búsqueda.
    const searchableText = normalizeText(
      [
        dashboard.title,
        dashboard.description,
        dashboard.keywords,
        dashboard.theme,
        dashboard.year,
        dashboard.platform,
        dashboard.type,
        dashboard.status,
      ]
        .filter(Boolean)
        .join(' '),
    )

    return terms.every((term) => searchableText.includes(term))
  })
})

// Descarga la hoja, normaliza sus filas y conserva únicamente los tableros públicos.
const loadDashboards = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // Filas originales devueltas por el helper de Google Sheets.
    const rows = await fetchGoogleSheetCsv({
      fileId: sheetFileId,
      gid: sheetGid,
    })
    dashboards.value = rows.map(normalizeDashboard).filter((dashboard) => dashboard.public)
  } catch (error) {
    console.error('No fue posible cargar los tableros de Google Sheets.', error)
    errorMessage.value = 'No fue posible cargar los tableros. Intenta nuevamente más tarde.'
    dashboards.value = []
  } finally {
    loading.value = false
  }
}

// Selecciona un tablero e inicializa su ventana modal de detalle.
const openDashboardDetails = async (dashboard) => {
  selectedDashboard.value = dashboard
  await nextTick()
  if (!detailModalElement.value) return

  detailModalInstance = Modal.getOrCreateInstance(detailModalElement.value)
  detailModalInstance.show()
}

// Cierra y libera la instancia del modal antes de desmontar la vista.
onBeforeUnmount(() => {
  detailModalInstance?.hide()
  detailModalInstance?.dispose()
})

// Inicia la carga de tableros cuando la vista entra en pantalla.
onMounted(loadDashboards)
</script>

<style scoped>
.dataviz-explorer {
  min-height: 75vh;
  max-width: 1240px;
  padding-top: clamp(2.5rem, 5vw, 4.75rem) !important;
  padding-bottom: 5.5rem !important;
}

.dataviz-loading {
  display: grid;
  min-height: 45vh;
  place-content: center;
  color: #654096;
}

.dataviz-header {
  max-width: 760px;
  margin-bottom: 1.75rem;
}

.dataviz-title {
  margin: 0;
  color: #3f3f46;
  font-size: clamp(1.65rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.16;
}

.dataviz-description {
  margin: 0.95rem 0 0;
  color: #69717a;
  font-size: 0.98rem;
  line-height: 1.65;
}

.dataviz-search {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.85rem;
}

.dataviz-search :deep(.list-search-input) {
  flex: 1;
  min-width: 0;
  max-width: 500px;
}

.dataviz-search :deep(.list-search-control) {
  min-height: 3.15rem;
  border-color: #e5e1e9;
  border-radius: 0.85rem;
  box-shadow: 0 1px 3px rgb(31 19 45 / 3%);
}

.dataviz-search :deep(.list-search-control:focus-within) {
  border-color: #9d81ad;
  box-shadow: 0 0 0 3px rgb(101 64 150 / 10%);
}

.dataviz-search-counter {
  margin: 0 0 0 auto;
  color: #7c7883;
  font-size: 0.82rem;
  white-space: nowrap;
}

.dataviz-search-counter span {
  color: #332841;
  font-weight: 700;
}

.dashboard-card {
  overflow: hidden;
  border: 1px solid #e9e6ed;
  border-radius: 1.15rem;
  background: #fff;
  box-shadow: 0 3px 15px rgb(38 29 48 / 4%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.dashboard-card:hover {
  border-color: #d9cfdf;
  box-shadow: 0 14px 32px rgb(38 29 48 / 10%);
  transform: translateY(-4px);
}

.dashboard-thumbnail-link {
  display: block;
  overflow: hidden;
}

.dashboard-thumbnail {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-bottom: 1px solid #efecf1;
  background: #f6f4f8;
  transition: transform 0.25s ease;
}

.dashboard-thumbnail-link:hover .dashboard-thumbnail {
  transform: scale(1.025);
}

.dashboard-card-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.2rem 1.3rem 1.35rem;
}

.dashboard-year {
  display: inline-flex;
  align-items: center;
  min-height: 1.35rem;
  margin-bottom: 0.7rem;
  border-radius: 0.3rem;
  background: #fef3c7;
  padding: 0.15rem 0.5rem;
  color: #55515a;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  line-height: 1;
}

.dashboard-title {
  display: -webkit-box;
  overflow: hidden;
  color: #654096;
  font-size: 0.82rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.dashboard-description {
  display: -webkit-box;
  overflow: hidden;
  margin: 0.5rem 0 0;
  color: #6d717b;
  font-size: 0.84rem;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.dashboard-more-button {
  border: 0;
  background: transparent;
  margin-top: 0.35rem;
  padding: 0;
  color: #85818a;
  font-size: 0.72rem;
  font-weight: 500;
  text-decoration: none;
}

.dashboard-more-button:hover {
  color: #55515a;
}

.dashboard-title-link {
  color: inherit;
  text-decoration: none;
}

.dashboard-title-link:hover,
.dashboard-title-link:focus,
.dashboard-title-link:active,
.dashboard-title-link:hover .dashboard-title,
.dashboard-title-link:focus .dashboard-title,
.dashboard-title-link:active .dashboard-title {
  color: #654096;
  text-decoration: none;
}

.dashboard-type {
  color: #654096;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dashboard-meta {
  display: flex;
  width: 100%;
  margin-top: auto;
  padding-top: 1.15rem;
  color: #7f7b86;
  font-size: 0.76rem;
}

.dashboard-theme {
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-content {
  border: 0;
  border-radius: 1.2rem;
  box-shadow: 0 24px 80px rgb(24 16 35 / 20%);
}

.modal-header,
.modal-footer {
  border-color: #f0edf2;
}

.dataviz-modal .modal-header,
.dataviz-modal .modal-body,
.dataviz-modal .modal-footer {
  padding-right: clamp(1.25rem, 4vw, 2rem);
  padding-left: clamp(1.25rem, 4vw, 2rem);
}

.dataviz-modal .modal-header {
  padding-top: 1.6rem;
  padding-bottom: 1.3rem;
}

.dataviz-modal .modal-body {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.dataviz-modal .btn-primary {
  border-color: #654096;
  background: #654096;
}

.dataviz-modal .btn-primary:hover {
  border-color: #4d2d6a;
  background: #4d2d6a;
}

.dataviz-empty {
  border: 1px dashed #ddd5e4;
  border-radius: 1rem;
  background: #fbfafc;
  padding: 2.25rem 1.25rem;
  color: #6c6472;
  text-align: center;
}

.dashboard-title-link:focus-visible,
.dashboard-thumbnail-link:focus-visible,
.dashboard-more-button:focus-visible {
  border-radius: 0.75rem;
  outline: 3px solid rgb(101 64 150 / 35%);
  outline-offset: 4px;
}

.modal-description {
  color: #374151;
  line-height: 1.6;
  white-space: pre-line;
}

.dashboard-detail-list {
  display: grid;
  grid-template-columns: minmax(6rem, auto) minmax(0, 1fr);
  gap: 0.4rem 1rem;
  margin: 1.25rem 0 0;
}

.dashboard-detail-list dt {
  color: #687580;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.dashboard-detail-list dd {
  min-width: 0;
  margin: 0;
  color: #293744;
  overflow-wrap: anywhere;
}

@media (max-width: 767px) {
  .dataviz-search {
    align-items: stretch;
    flex-direction: column;
    gap: 0.55rem;
  }

  .dataviz-search-counter {
    margin-left: 0;
  }

  .dashboard-detail-list {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.15rem;
  }

  .dashboard-detail-list dd:not(:last-child) {
    margin-bottom: 0.65rem;
  }
}
</style>
