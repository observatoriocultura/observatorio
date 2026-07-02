<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

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
import { supabase } from '../../lib/supabase'
import FichaInvestigacion from './FichaInvestigacion.vue'
import InvestigacionesLista from './InvestigacionesLista.vue'

const router = useRouter()
const route = useRoute()

const investigaciones = ref([])
const productos = ref([])
const hallazgos = ref([])
const loading = ref(true)
const errorMessage = ref('')
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
        investigacion.tema,
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
      String(producto.investigacion_id) === String(currentInvestigacion.value.id) &&
      producto.titulo &&
      shouldIncludeProducto(producto) &&
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

const shouldIncludeProducto = (producto) => {
  const incluirEnFicha = normalizeText(producto.incluir_en_ficha)
  if (incluirEnFicha) return incluirEnFicha === 'si'

  const esPublico = normalizeText(producto.es_publico)
  if (esPublico) return esPublico === 'si'

  return true
}

const normalizeInvestigacion = (investigacion) => ({
  ...investigacion,
  anio: investigacion.anio ?? investigacion.year_vigencia,
  entidad_solicitante:
    investigacion.entidad_solicitante ?? investigacion.entidad ?? investigacion.dependencia,
  carpeta_productos: investigacion.carpeta_productos ?? investigacion.url_carpeta_productos,
})

const normalizeProducto = (producto) => ({
  ...producto,
  url: producto.url ?? producto.url_publica ?? producto.url_editable,
  incluir_en_ficha:
    producto.incluir_en_ficha ?? (normalizeText(producto.es_publico) === 'si' ? 'si' : 'no'),
})

const normalizeHallazgo = (hallazgo, index) => ({
  ...hallazgo,
  investigacion_id:
    hallazgo.investigacion_id ??
    hallazgo.id_investigacion ??
    hallazgo.investigacionId ??
    hallazgo.investigacion,
  orden: hallazgo.orden ?? index + 1,
  titulo: hallazgo.titulo ?? hallazgo.nombre ?? hallazgo.hallazgo ?? '',
  texto:
    hallazgo.texto ??
    hallazgo.descripcion ??
    hallazgo.contenido ??
    hallazgo.detalle ??
    hallazgo.resumen ??
    '',
  unidad_medida: hallazgo.unidad_medida ?? hallazgo.unidad ?? hallazgo.medida,
})

const cargarHallazgosLocales = async () => {
  const response = await fetch(`${baseUrl}content/investigaciones/hallazgos.json`)
  if (!response.ok) {
    throw new Error('No fue posible cargar los hallazgos locales.')
  }

  return response.json()
}

const cargarInvestigaciones = async () => {
  const { data, error } = await supabase
    .from('gio_investigaciones')
    .select(
      'id, nombre_clave, titulo, tema, descripcion, linea_investigacion, year_vigencia, entidad, dependencia, palabras_clave, estado, url_carpeta_productos, investigadores, expediente_orfeo, objetivo, puntaje, cantidad_productos, cantidad_hallazgos, cantidad_radicados, cantidad_paginas',
    )
    .or('estado.like.4%,estado.like.5%')
    .order('year_vigencia', { ascending: false })
    .order('puntaje', { ascending: false, nullsFirst: false })

  if (error) throw error

  investigaciones.value = (data ?? []).map(normalizeInvestigacion)
}

const cargarProductos = async () => {
  const { data, error } = await supabase
    .from('gio_productos')
    .select(
      'id, investigacion_id, tipo_producto, titulo, es_publico, url, url_publica, url_editable, created_at, orden, radicado_orfeo, paginas, descripcion, observaciones',
    )
    .order('orden', { ascending: true, nullsFirst: false })

  if (error) throw error

  productos.value = (data ?? []).map(normalizeProducto)
}

const cargarHallazgos = async () => {
  const { data, error } = await supabase.from('gio_hallazgos').select('*')

  if (error) throw error

  const hallazgosSupabase = (data ?? []).map(normalizeHallazgo)
  if (hallazgosSupabase.length > 0) {
    hallazgos.value = hallazgosSupabase
    return
  }

  const hallazgosLocales = await cargarHallazgosLocales()
  hallazgos.value = (hallazgosLocales ?? []).map(normalizeHallazgo)
}

onMounted(async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    if (!supabase) {
      throw new Error('Supabase no está configurado.')
    }

    await Promise.all([cargarInvestigaciones(), cargarProductos(), cargarHallazgos()])

    const invId = route.query.investigacion_id
    if (invId) {
      const found = investigaciones.value.find((inv) => String(inv.id) === String(invId))
      if (found) {
        currentInvestigacion.value = found
        section.value = 'detail'
      }
    }
  } catch (error) {
    console.error('Error cargando investigaciones desde Supabase', error)
    errorMessage.value = 'No fue posible cargar las investigaciones desde Supabase.'
    investigaciones.value = []
    productos.value = []
    hallazgos.value = []
  } finally {
    loading.value = false
  }
})
</script>
