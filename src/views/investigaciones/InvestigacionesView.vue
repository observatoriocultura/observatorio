<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else>
      <div v-if="investigaciones.length === 0" class="alert alert-info">
        No hay investigaciones disponibles.
      </div>

      <InvestigacionesLista
        v-show="section === 'results'"
        v-model:search-term="searchInput"
        :investigaciones="investigacionesFiltradas"
        :base-url="baseUrl"
        @select="showDetail"
      />

      <FichaInvestigacion
        v-if="section === 'detail' && currentInvestigacion"
        :investigacion="currentInvestigacion"
        :productos="productosFiltrados"
        :hallazgos="hallazgosFiltrados"
        :base-url="baseUrl"
        @back="goBack"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FichaInvestigacion from './FichaInvestigacion.vue'
import InvestigacionesLista from './InvestigacionesLista.vue'

const router = useRouter()
const route = useRoute()

const investigaciones = ref([])
const productos = ref([])
const hallazgos = ref([])
const loading = ref(true)
const section = ref('results')
const currentInvestigacion = ref(null)
const searchInput = ref('')
const baseUrl = import.meta.env.BASE_URL

const removeDiacritics = (text) =>
  text
    ? text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : ''

const normalizeText = (value) => removeDiacritics(value).trim()

const investigacionesFiltradas = computed(() => {
  if (!searchInput.value.trim()) return investigaciones.value

  const terms = normalizeText(searchInput.value).split(/\s+/)

  return investigaciones.value.filter((investigacion) => {
    const fullText = removeDiacritics(
      [
        investigacion.titulo,
        investigacion.descripcion,
        investigacion.linea_investigacion,
        investigacion.palabras_clave,
        investigacion.anio,
      ]
        .filter(Boolean)
        .join(' '),
    )

    return terms.every((term) => fullText.includes(term))
  })
})

const productosFiltrados = computed(() => {
  if (!currentInvestigacion.value) return []

  return productos.value.filter(
    (producto) =>
      producto.investigacion_id === currentInvestigacion.value.id &&
      producto.titulo &&
      normalizeText(producto.incluir_en_ficha) === 'si' &&
      producto.url &&
      producto.url.trim() !== '',
  )
})

const hallazgosFiltrados = computed(() => {
  if (!currentInvestigacion.value) return []

  return hallazgos.value
    .filter(
      (hallazgo) => String(hallazgo.investigacion_id) === String(currentInvestigacion.value.id),
    )
    .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
})

const showDetail = (inv) => {
  currentInvestigacion.value = inv
  section.value = 'detail'
  window.scrollTo(0, 0)

  router.push({ query: { investigacion_id: inv.id } })
}

const goBack = () => {
  section.value = 'results'
  currentInvestigacion.value = null

  const query = { ...route.query }
  delete query.investigacion_id
  router.push({ query })
}

onMounted(async () => {
  try {
    const res = await fetch(`${baseUrl}content/investigaciones/investigaciones.json`)
    if (!res.ok) throw new Error('No se pudo cargar el archivo de investigaciones')
    const data = await res.json()
    investigaciones.value = data

    try {
      const prodRes = await fetch(`${baseUrl}content/investigaciones/productos.json`)
      if (prodRes.ok) {
        productos.value = await prodRes.json()
      }
    } catch (error) {
      console.error('Error cargando productos', error)
    }

    try {
      const hallazgosRes = await fetch(`${baseUrl}content/investigaciones/hallazgos.json`)
      if (hallazgosRes.ok) {
        hallazgos.value = await hallazgosRes.json()
      }
    } catch (error) {
      console.error('Error cargando hallazgos', error)
    }

    const invId = route.query.investigacion_id
    if (invId) {
      const found = data.find((inv) => String(inv.id) === String(invId))
      if (found) {
        currentInvestigacion.value = found
        section.value = 'detail'
      }
    }
  } catch {
    investigaciones.value = []
  } finally {
    loading.value = false
  }
})
</script>
