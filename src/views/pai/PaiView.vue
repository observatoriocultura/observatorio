<template>
  <main class="container py-5">
    <h1 class="mb-4">Plan Anual de Investigaciones {{ year }}</h1>

    <p v-if="loading">Cargando investigaciones...</p>
    <p v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    <p v-else-if="investigacionesFiltradas.length === 0">
      No hay investigaciones registradas para este año.
    </p>

    <ul v-else class="list-group">
      <li
        v-for="investigacion in investigacionesFiltradas"
        :key="investigacion.id"
        class="list-group-item"
      >
        <h2 class="h5 mb-2">{{ investigacion.titulo }}</h2>
        <p class="mb-1">
          <strong>Línea de investigación:</strong>
          {{ investigacion.linea_investigacion || 'Sin línea registrada' }}
        </p>
        <p class="mb-1">{{ investigacion.descripcion }}</p>
        <small class="text-muted">
          ID: {{ investigacion.id }} | Vigencia: {{ investigacion.year_vigencia }}
        </small>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'

const route = useRoute()

const investigaciones = ref([])
const loading = ref(false)
const errorMessage = ref('')

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
    .select('id, titulo, descripcion, linea_investigacion, year_vigencia')
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
