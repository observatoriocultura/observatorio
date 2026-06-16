<template>
  <div class="pai-list-layout">
    <SearchForm
      v-model:search-term="searchTerm"
      v-model:selected-linea="selectedLinea"
      v-model:selected-entidad="selectedEntidad"
      :result-count="investigacionesFiltradas.length"
      :total-count="props.investigaciones.length"
    />

    <ColumnasAvance
      :investigaciones="props.investigaciones"
      :selected-investigacion-id="activeInvestigacionId"
    />
    <template v-if="activeSection === 'list'">
      <div v-if="investigacionesFiltradas.length > 0" class="investigaciones-container">
        <RouterLink
          v-for="investigacion in investigacionesFiltradas"
          :key="investigacion.id"
          :to="getInvestigacionRoute(investigacion)"
          class="investigacion-card"
          :class="{ 'investigacion-card-active': isInvestigacionActive(investigacion.id) }"
          @click="selectInvestigacion(investigacion)"
        >
          <p class="investigacion-tags mb-1">
            <span
              v-if="investigacion.linea_investigacion"
              class="label"
              :class="getLineaClass(investigacion.linea_investigacion)"
            >
              {{ investigacion.linea_investigacion }}
            </span>
            <span v-else>Sin linea registrada</span>
            <span
              v-if="getInvestigacionEntidad(investigacion)"
              class="label"
              :class="getEntidadClass(getInvestigacionEntidad(investigacion))"
            >
              {{ getInvestigacionEntidad(investigacion) }}
            </span>
          </p>
          <h3 class="h5 mb-2">{{ investigacion.nombre_clave }}</h3>
          <p>{{ investigacion.titulo }}</p>
          <div class="investigacion-metricas" aria-label="Indicadores numericos">
            <div
              v-for="indicador in indicadoresNumericos"
              :key="indicador.key"
              class="investigacion-metrica"
            >
              <span>{{ indicador.label }}</span>
              <strong>{{ formatIndicador(investigacion[indicador.key], indicador.type) }}</strong>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else class="investigacion-empty">
        <p>No hay investigaciones que coincidan con la busqueda.</p>
      </div>
    </template>

    <InvestigacionView
      v-else-if="currentInvestigacion"
      class="investigacion-current"
      :investigacion="currentInvestigacion"
      :notas="props.notas"
      :productos="props.productos"
      @back="setCurrentSection('list')"
    />

    <div v-else class="investigacion-empty">
      <p>Selecciona una investigacion para ver el detalle de avance.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toClassName } from '../../../utils/text'
import ColumnasAvance from './ColumnasAvance.vue'
import InvestigacionView from './InvestigacionView.vue'
import SearchForm from './SearchForm.vue'

const props = defineProps({
  investigaciones: {
    type: Array,
    default: () => [],
  },
  notas: {
    type: Array,
    default: () => [],
  },
  productos: {
    type: Array,
    default: () => [],
  },
  currentSection: {
    type: String,
    default: null,
    validator: (value) => value === null || ['list', 'details'].includes(value),
  },
  selectedInvestigacionId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:currentSection'])

const route = useRoute()
const localCurrentSection = ref('list')
const currentInvestigacionId = ref(null)
const searchTerm = ref('')
const selectedLinea = ref('')
const selectedEntidad = ref('')
const validSections = ['list', 'details']
const normalizeSection = (section) => (validSections.includes(section) ? section : null)
const requestedInvestigacionId = computed(
  () => props.selectedInvestigacionId ?? route.query.investigacion_id ?? null,
)
const activeInvestigacionId = computed(() => currentInvestigacionId.value ?? requestedInvestigacionId.value)
const activeSection = computed(
  () => normalizeSection(route.query.seccion) ?? props.currentSection ?? localCurrentSection.value,
)
const currentInvestigacion = computed(
  () =>
    props.investigaciones.find(
      (investigacion) => String(investigacion.id) === String(currentInvestigacionId.value),
    ) ?? null,
)
const normalizeSearchText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const getInvestigacionEntidad = (investigacion) =>
  investigacion.entidad_corto ??
  investigacion.entidad ??
  investigacion.entidad_solicitante ??
  investigacion.entidad_responsable ??
  ''

const investigacionesFiltradas = computed(() => {
  const search = normalizeSearchText(searchTerm.value)
  const linea = normalizeSearchText(selectedLinea.value)
  const entidad = normalizeSearchText(selectedEntidad.value)
  if (!search && !linea && !entidad) return props.investigaciones

  return props.investigaciones.filter((investigacion) => {
    const matchesLinea =
      !linea || normalizeSearchText(investigacion.linea_investigacion) === linea
    const matchesEntidad = !entidad || normalizeSearchText(getInvestigacionEntidad(investigacion)) === entidad

    if (!matchesLinea || !matchesEntidad) return false
    if (!search) return true

    const searchableText = [
      investigacion.nombre_clave,
      investigacion.titulo,
      investigacion.descripcion,
      investigacion.linea_investigacion,
      getInvestigacionEntidad(investigacion),
      investigacion.palabras_clave,
    ]
      .map(normalizeSearchText)
      .join(' ')

    return searchableText.includes(search)
  })
})

const setCurrentSection = (section) => {
  localCurrentSection.value = section
  emit('update:currentSection', section)
}

const selectInvestigacion = (investigacion) => {
  currentInvestigacionId.value = investigacion.id
  setCurrentSection('details')
}

const isInvestigacionActive = (investigacionId) =>
  String(investigacionId) === String(activeInvestigacionId.value)

const getInvestigacionRoute = (investigacion) => ({
  query: {
    ...route.query,
    tab: 'listado',
    seccion: 'details',
    investigacion_id: investigacion.id,
  },
})

watch(
  () => props.investigaciones,
  (investigaciones) => {
    if (investigaciones.length === 0) {
      currentInvestigacionId.value = null
      if (activeSection.value !== 'details') {
        setCurrentSection('list')
      }
      return
    }

    if (requestedInvestigacionId.value !== null) {
      const requestedInvestigacion = investigaciones.find(
        (investigacion) => String(investigacion.id) === String(requestedInvestigacionId.value),
      )

      if (requestedInvestigacion) {
        currentInvestigacionId.value = requestedInvestigacion.id
        return
      }
    }

    const hasCurrentInvestigacion = investigaciones.some(
      (investigacion) => String(investigacion.id) === String(currentInvestigacionId.value),
    )

    if (!hasCurrentInvestigacion) {
      currentInvestigacionId.value = null
      if (activeSection.value !== 'details') {
        setCurrentSection('list')
      }
    }
  },
  { immediate: true },
)

watch(
  requestedInvestigacionId,
  (investigacionId) => {
    if (investigacionId === null || investigacionId === undefined) return

    const selectedInvestigacion = props.investigaciones.find(
      (investigacion) => String(investigacion.id) === String(investigacionId),
    )

    if (!selectedInvestigacion) return

    currentInvestigacionId.value = selectedInvestigacion.id
    if (props.currentSection === null) {
      setCurrentSection('details')
    }
  },
  { immediate: true },
)

watch(searchTerm, () => {
  setCurrentSection('list')
})

watch(selectedLinea, () => {
  setCurrentSection('list')
})

watch(selectedEntidad, () => {
  setCurrentSection('list')
})

const getLineaClass = (linea) => `bg-${toClassName(linea)}`
const getEntidadClass = (entidad) => `bg-${toClassName(entidad)}`
const getAvanceValue = (value) => {
  const avance = Number(value)
  if (!Number.isFinite(avance)) return 0
  return Math.min(Math.max(Math.round(avance), 0), 100)
}
const formatAvance = (value) => `${getAvanceValue(value)}%`
const indicadoresNumericos = [
  { key: 'avance', label: 'Avance', type: 'percent' },
  { key: 'cantidad_productos', label: 'Productos' },
  { key: 'cantidad_paginas', label: 'Páginas' },
  { key: 'cantidad_hallazgos', label: 'Hallazgos' },
  { key: 'cantidad_radicados', label: 'Radicados' },
]
const formatNumber = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return new Intl.NumberFormat('es-CO').format(number)
}
const formatIndicador = (value, type) => (type === 'percent' ? formatAvance(value) : formatNumber(value))
</script>

<style scoped>
.pai-list-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  width: 100%;
}

.investigacion-current {
  min-width: 0;
}

.investigacion-empty {
  border: 1px dashed #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
  color: #6c757d;
}

.investigacion-empty p {
  margin: 0;
}

.investigaciones-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  width: 100%;
}

.investigacion-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
  color: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.investigacion-card:hover,
.investigacion-card:focus {
  border-color: #654096;
}

.investigacion-card:focus {
  outline: 3px solid rgba(101, 64, 150, 0.18);
  outline-offset: 2px;
}

.investigacion-card-active {
  border-color: #654096;
  box-shadow: inset 0 0 0 1px #654096;
}

.investigacion-card h3 {
  font-size: 1rem;
  line-height: 1.25;
}

.investigacion-card p {
  font-size: 0.875rem;
  line-height: 1.35;
}

.investigacion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.investigacion-metricas {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.75rem;
}

.investigacion-metrica {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.15rem;
  border-top: 1px solid #eeeeee;
  padding-top: 0.35rem;
}

.investigacion-metrica span {
  color: #6c757d;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
  text-transform: uppercase;
}

.investigacion-metrica strong {
  color: #212529;
  font-size: 0.86rem;
  line-height: 1.1;
}

@media (min-width: 576px) {
  .investigaciones-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .investigaciones-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1600px) {
  .investigaciones-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
