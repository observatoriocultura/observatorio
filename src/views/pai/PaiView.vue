<template>
  <main class="container-fluid py-2">
    <ul class="nav nav-tabs mb-4">
      <li v-for="item in menuItems" :key="item.key" class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: activeView === item.key }"
          :aria-current="activeView === item.key ? 'page' : undefined"
          @click="setActiveView(item.key)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>

    <p v-if="loading">Cargando investigaciones...</p>
    <p v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    <p v-else-if="investigacionesFiltradas.length === 0">
      No hay investigaciones registradas para este año.
    </p>

    <PaiPortada
      v-else-if="activeView === 'portada'"
      :investigaciones="investigacionesFiltradas"
    />
    <PaiList
      v-else
      v-model:current-section="currentListSection"
      :investigaciones="investigacionesFiltradas"
      :selected-investigacion-id="selectedInvestigacionId"
    />
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import PaiPortada from './parts/PaiPortada.vue'
import PaiList from './parts/PaiList.vue'
import '../../assets/styles/scrd.css'
import '../../assets/styles/pai.css'

const route = useRoute()
const router = useRouter()

const investigaciones = ref([])
const loading = ref(false)
const errorMessage = ref('')
const activeView = ref('portada')
const currentListSection = ref('list')
const selectedInvestigacionId = ref(null)
const menuItems = [
  { key: 'portada', label: 'Portada' },
  { key: 'listado', label: 'Investigaciones' },
]
const validTabs = menuItems.map((item) => item.key)
const validSections = ['list', 'details']

const year = computed(() => Number(route.params.year) || 2025)
const normalizarYear = (value) => Number(value)
const investigacionesFiltradas = computed(() =>
  investigaciones.value.filter(
    (investigacion) => normalizarYear(investigacion.year_vigencia) === year.value,
  ),
)

const normalizeTab = (tab) => (validTabs.includes(tab) ? tab : 'portada')
const getDefaultSection = () => (route.query.investigacion_id ? 'details' : 'list')
const normalizeSection = (section) =>
  validSections.includes(section) ? section : getDefaultSection()

const setActiveView = (tab) => {
  activeView.value = normalizeTab(tab)
}

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
      'id, nombre_clave, titulo, descripcion, linea_investigacion, year_vigencia, avance, avance_planeacion, avance_instrumentos, avance_recoleccion, avance_documentacion, avance_finalizacion',
    )
    .filter('year_vigencia', 'eq', String(year.value))
    .order('id', { ascending: true })

  if (error) {
    errorMessage.value = 'No fue posible cargar las investigaciones.'
    investigaciones.value = []
  } else {
    investigaciones.value = data ?? []
  }

  loading.value = false
}

watch(year, cargarInvestigaciones, { immediate: true })
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
