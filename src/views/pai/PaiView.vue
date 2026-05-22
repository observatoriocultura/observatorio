<template>
  <main class="container-fluid py-2">
    <ul class="nav nav-tabs mb-4">
      <li v-for="item in menuItems" :key="item.key" class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: activeView === item.key }"
          :aria-current="activeView === item.key ? 'page' : undefined"
          @click="activeView = item.key"
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

    <PaiPortada v-else-if="activeView === 'portada'" :investigaciones="investigacionesFiltradas" />
    <PaiList v-else :investigaciones="investigacionesFiltradas" />
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import PaiPortada from './parts/PaiPortada.vue'
import PaiList from './parts/PaiList.vue'
import '../../assets/styles/scrd.css'
import '../../assets/styles/pai.css'

const route = useRoute()

const investigaciones = ref([])
const loading = ref(false)
const errorMessage = ref('')
const activeView = ref('portada')
const menuItems = [
  { key: 'portada', label: 'Portada' },
  { key: 'listado', label: 'Investigaciones' },
]

const year = computed(() => Number(route.params.year) || 2025)
const normalizarYear = (value) => Number(value)
const investigacionesFiltradas = computed(() =>
  investigaciones.value.filter(
    (investigacion) => normalizarYear(investigacion.year_vigencia) === year.value,
  ),
)

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
</script>
