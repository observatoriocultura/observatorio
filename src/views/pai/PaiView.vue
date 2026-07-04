<template>
  <main class="pai-layout container-fluid py-2">
    <nav class="pai-nav" aria-label="Navegacion PAI">
      <RouterLink
        v-for="item in visibleMenuItems"
        :key="item.key"
        :to="getTabRoute(item.key)"
        class="pai-nav-tab"
        :class="{ active: activeView === item.key }"
        :aria-current="activeView === item.key ? 'page' : undefined"
        @click="setActiveView(item.key)"
      >
        <i v-if="item.icon" class="bi me-2" :class="item.icon" aria-hidden="true"></i>
        {{ item.label }}
      </RouterLink>
    </nav>

    <p v-if="loading">Cargando investigaciones...</p>
    <p v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    <p v-else-if="investigacionesFiltradas.length === 0">
      No hay investigaciones registradas para este año.
    </p>

    <PaiPortada v-else-if="activeView === 'portada'" :investigaciones="investigacionesFiltradas" />
    <PaiExplorer
      v-else-if="activeView === 'explorar'"
      :investigaciones="investigacionesFiltradas"
    />
    <NotasView v-else-if="activeView === 'notas'" :notas="notas" />
    <AvanceSemanal v-else-if="activeView === 'avance'" :semanas="semanas" :avances="avances" />
    <PaiList
      v-else
      v-model:current-section="currentListSection"
      :investigaciones="investigacionesFiltradas"
      :notas="notas"
      :productos="productos"
      :selected-investigacion-id="selectedInvestigacionId"
    />
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { fetchGoogleSheetCsv } from '../../utils/googleSheets'
import { vigenciaPorYear } from './constants'
import PaiPortada from './parts/PaiPortada.vue'
import PaiExplorer from './parts/PaiExplorer.vue'
import PaiList from './parts/PaiList.vue'
import NotasView from './parts/NotasView.vue'
import AvanceSemanal from './parts/AvanceSemanal.vue'
import '../../assets/styles/scrd.css'
import '../../assets/styles/pai.css'

const route = useRoute()
const router = useRouter()

const investigaciones = ref([])
const productos = ref([])
const notas = ref([])
const semanas = ref([])
const avances = ref([])
const loading = ref(false)
const errorMessage = ref('')
const activeView = ref('avance')
const currentListSection = ref('list')
const selectedInvestigacionId = ref(null)
const menuItems = [
  { key: 'avance', label: 'Avance', icon: 'bi-graph-up', show: true },
  { key: 'portada', label: 'Inicio', icon: 'bi-house-door', show: false },
  { key: 'listado', label: 'Investigaciones', icon: 'bi-grid-3x3-gap', show: true },
  { key: 'explorar', label: 'Descripción', icon: 'bi-card-text', show: true },
  { key: 'notas', label: 'Notas', icon: 'bi-journal-text', show: false },
]
const validTabs = menuItems.map((item) => item.key)
const validSections = ['list', 'details']

const visibleMenuItems = computed(() => menuItems.filter((item) => item.show !== false))
const year = computed(() => Number(route.params.year) || 2025)
const vigenciaInfo = computed(() => vigenciaPorYear(year.value))
const normalizarYear = (value) => Number(value)
const investigacionesFiltradas = computed(() =>
  investigaciones.value.filter(
    (investigacion) =>
      normalizarYear(investigacion.year_vigencia) === year.value &&
      Number(investigacion.cantidad_productos) > 0,
  ),
)

const normalizeTab = (tab) => (validTabs.includes(tab) ? tab : 'portada')
const getDefaultSection = () => (route.query.investigacion_id ? 'details' : 'list')
const normalizeSection = (section) =>
  validSections.includes(section) ? section : getDefaultSection()

const setActiveView = (tab) => {
  activeView.value = normalizeTab(tab)
}

const getTabRoute = (tab) => ({
  query: {
    ...route.query,
    tab,
  },
})

const updateRouteQuery = (query) => {
  const nextQuery = {
    ...route.query,
    ...query,
  }

  const hasQueryChanged = Object.keys(nextQuery).some((key) => route.query[key] !== nextQuery[key])
  if (!hasQueryChanged) return

  router.replace({ query: nextQuery })
}

const updateRouteTab = (tab) => updateRouteQuery({ tab })
const updateRouteSection = (section) => updateRouteQuery({ seccion: section })

const cargarInvestigaciones = async () => {
  if (!supabase) {
    errorMessage.value = 'Supabase no está configurado.'
    investigaciones.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('gio_investigaciones')
    .select(
      'id, nombre_clave, titulo, tema, descripcion, linea_investigacion, year_vigencia, entidad, dependencia, palabras_clave, puntaje, avance, avance_planeacion, avance_instrumentos, avance_recoleccion, avance_documentacion, avance_finalizacion, cantidad_productos, cantidad_hallazgos, cantidad_radicados, cantidad_paginas',
    )
    .filter('year_vigencia', 'eq', String(year.value))
    .filter('cantidad_productos', 'gt', 0)
    .order('year_vigencia', { ascending: false })
    .order('puntaje', { ascending: false, nullsFirst: false })

  if (error) {
    errorMessage.value = 'No fue posible cargar las investigaciones.'
    investigaciones.value = []
  } else {
    investigaciones.value = data ?? []
  }

  loading.value = false
}

/**
 * Cargar productos desde supabase
 */
const cargarProductos = async () => {
  if (!supabase) {
    errorMessage.value = 'Supabase no está configurado.'
    productos.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('gio_productos')
    .select(
      'id, investigacion_id, tipo_producto, titulo, es_publico, url, url_publica, url_editable, created_at, orden, radicado_orfeo, paginas, descripcion, observaciones',
    )
    //.filter('year_vigencia', 'eq', String(year.value))
    .order('orden', { ascending: true })

  if (error) {
    errorMessage.value = 'No fue posible cargar los productos.'
    productos.value = []
  } else {
    productos.value = data ?? []
  }

  loading.value = false
}

const cargarNotas = async (vigencia) => {
  notas.value = []

  if (!vigencia?.file_id || !vigencia?.notas_gid) return

  try {
    notas.value = await fetchGoogleSheetCsv({
      fileId: vigencia.file_id,
      gid: vigencia.notas_gid,
    })
  } catch (error) {
    console.error('No fue posible cargar las notas del PAI.', error)
    notas.value = []
  }
}

const cargarSemanas = async (vigencia) => {
  semanas.value = []

  if (!vigencia?.file_id || !vigencia?.semanas_gid) return

  try {
    semanas.value = await fetchGoogleSheetCsv({
      fileId: vigencia.file_id,
      gid: vigencia.semanas_gid,
    })
  } catch (error) {
    console.error('No fue posible cargar las semanas del PAI.', error)
    semanas.value = []
  }
}

const cargarAvances = async (vigencia) => {
  avances.value = []

  if (!vigencia?.file_id || !vigencia?.avances_gid) return

  try {
    avances.value = await fetchGoogleSheetCsv({
      fileId: vigencia.file_id,
      gid: vigencia.avances_gid,
    })
  } catch (error) {
    console.error('No fue posible cargar los avances semanales del PAI.', error)
    avances.value = []
  }
}

watch(year, cargarInvestigaciones, { immediate: true })
watch(year, cargarProductos, { immediate: true })
watch(vigenciaInfo, cargarNotas, { immediate: true })
watch(vigenciaInfo, cargarSemanas, { immediate: true })
watch(vigenciaInfo, cargarAvances, { immediate: true })
watch(
  () => route.query.tab,
  (tab) => {
    const normalizedTab = normalizeTab(tab)
    activeView.value = normalizedTab
    updateRouteTab(normalizedTab)
  },
  { immediate: true },
)
watch(activeView, updateRouteTab)
watch(
  () => route.query.seccion,
  (section) => {
    const normalizedSection = normalizeSection(section)
    currentListSection.value = normalizedSection
    updateRouteSection(normalizedSection)
  },
  { immediate: true },
)
watch(currentListSection, updateRouteSection)
watch(
  () => route.query.investigacion_id,
  (investigacionId) => {
    if (!investigacionId) {
      selectedInvestigacionId.value = null
      return
    }

    selectedInvestigacionId.value = investigacionId
    if (!route.query.seccion) {
      currentListSection.value = 'details'
      updateRouteSection('details')
    }
    setActiveView('listado')
  },
  { immediate: true },
)
</script>

<style scoped>
.pai-layout {
  --pai-nav-primary: #32204a;
  --pai-nav-primary-light: #f0ebf7;
  --pai-nav-secondary: #5c6972;
}

.pai-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.pai-nav-tab {
  display: inline-flex;
  align-items: center;
  border-radius: 10px;
  padding: 0.45rem 1rem;
  color: var(--pai-nav-secondary);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.pai-nav-tab:hover,
.pai-nav-tab:focus {
  background-color: #f9f9fb;
  color: var(--pai-nav-primary);
}

.pai-nav-tab:focus {
  outline: 3px solid rgba(50, 32, 74, 0.12);
  outline-offset: 2px;
}

.pai-nav-tab.active {
  background-color: var(--pai-nav-primary-light);
  color: var(--pai-nav-primary);
}

@media (max-width: 600px) {
  .pai-nav-tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
