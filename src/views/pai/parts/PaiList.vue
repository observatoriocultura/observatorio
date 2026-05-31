<template>
  <div class="pai-list-layout">
    <template v-if="activeSection === 'list'">
      <div class="pai-list-search">
        <ListSearchInput
          v-model="searchTerm"
          placeholder="Buscar investigaciones..."
          aria-label="Buscar investigaciones"
        />
      </div>

      <div v-if="investigacionesFiltradas.length > 0" class="investigaciones-container">
        <RouterLink
          v-for="investigacion in investigacionesFiltradas"
          :key="investigacion.id"
          :to="getInvestigacionRoute(investigacion)"
          class="investigacion-card"
          :class="{ 'investigacion-card-active': currentInvestigacion?.id === investigacion.id }"
          @click="selectInvestigacion(investigacion)"
        >
          <p class="mb-1">
            <span
              v-if="investigacion.linea_investigacion"
              class="label"
              :class="getLineaClass(investigacion.linea_investigacion)"
            >
              {{ investigacion.linea_investigacion }}
            </span>
            <span v-else>Sin linea registrada</span>
          </p>
          <h3 class="h5 mb-2">{{ investigacion.nombre_clave }}</h3>
          <p>{{ investigacion.titulo }}</p>
          <div class="avance-indicadores" aria-label="Indicadores de avance">
            <div v-for="indicador in indicadoresAvance" :key="indicador.key" class="avance-item">
              <span class="label avance-etapa" :class="indicador.className">
                {{ indicador.label }}
              </span>
              <div
                class="progress"
                role="progressbar"
                :aria-label="indicador.title"
                :aria-valuenow="getAvanceValue(investigacion[indicador.key])"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="progress-bar"
                  :style="{ width: `${getAvanceValue(investigacion[indicador.key])}%` }"
                ></div>
              </div>
              <strong class="avance-valor">
                {{ formatAvance(investigacion[indicador.key]) }}
              </strong>
              <span class="visually-hidden">
                {{ indicador.title }}:
                {{ formatAvance(investigacion[indicador.key]) }}
              </span>
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
import ListSearchInput from '../../../components/ListSearchInput.vue'
import { toClassName } from '../../../utils/text'
import { etapasInvestigacion } from '../constants'
import InvestigacionView from './InvestigacionView.vue'

const props = defineProps({
  investigaciones: {
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
const validSections = ['list', 'details']
const normalizeSection = (section) => (validSections.includes(section) ? section : null)
const requestedInvestigacionId = computed(
  () => props.selectedInvestigacionId ?? route.query.investigacion_id ?? null,
)
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

const investigacionesFiltradas = computed(() => {
  const search = normalizeSearchText(searchTerm.value)
  if (!search) return props.investigaciones

  return props.investigaciones.filter((investigacion) => {
    const searchableText = [
      investigacion.nombre_clave,
      investigacion.titulo,
      investigacion.descripcion,
      investigacion.linea_investigacion,
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
  () => props.selectedInvestigacionId,
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

const getLineaClass = (linea) => `bg-${toClassName(linea)}`
const campoAvancePorEtapa = {
  P: 'avance_planeacion',
  I: 'avance_instrumentos',
  R: 'avance_recoleccion',
  D: 'avance_documentacion',
  F: 'avance_finalizacion',
}
const clasePorEtapa = {
  P: 'etapa-planeacion',
  I: 'etapa-instrumento',
  R: 'etapa-recoleccion',
  D: 'etapa-documentacion',
  F: 'etapa-finalizacion',
}
const indicadoresAvance = etapasInvestigacion.map((etapa) => ({
  key: campoAvancePorEtapa[etapa.codigo],
  label: etapa.codigo,
  title: `Avance de ${etapa.nombre}`,
  className: clasePorEtapa[etapa.codigo],
}))
const getAvanceValue = (value) => {
  const avance = Number(value)
  if (!Number.isFinite(avance)) return 0
  return Math.min(Math.max(Math.round(avance), 0), 100)
}
const formatAvance = (value) => `${getAvanceValue(value)}%`
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

.pai-list-search {
  width: min(100%, 32rem);
  justify-self: center;
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

.avance-indicadores {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.75rem;
}

.avance-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 2.25rem;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.avance-etapa {
  display: inline-flex;
  width: 1.35rem;
  height: 1.35rem;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #212529;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
}

.avance-valor {
  color: #212529;
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: right;
}

.avance-item .progress {
  height: 0.35rem;
  border-radius: 999px;
  background-color: #e9ecef;
}

.avance-item .progress-bar {
  border-radius: inherit;
  background-color: #654096;
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

@media (min-width: 1200px) {
  .investigaciones-container {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
