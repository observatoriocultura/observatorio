<template>
  <div class="search-question-wrapper bg-white">
    <!-- Header con Búsqueda -->
    <div class="search-header p-4 bg-white sticky-top">
      <div class="input-group input-group-lg search-bar-pill">
        <span class="input-group-text border-0">
          <i class="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          class="form-control border-0 px-2 shadow-none"
          placeholder="Buscar preguntas..."
          v-model="searchText"
          ref="searchInput"
        />
        <button v-if="searchText" class="btn border-0 text-muted" @click="searchText = ''">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="mt-3">
        <small v-if="loading" class="text-muted">Cargando...</small>
        <small v-else-if="searchText" class="text-muted">
          {{ filteredPreguntas.length }} resultados
        </small>
        <small v-else class="text-muted">{{ preguntas.length }} preguntas</small>
      </div>
    </div>

    <!-- Listado de Resultados -->
    <div class="search-results">
      <div v-if="filteredPreguntas.length > 0" class="list-group list-group-flush">
        <div
          v-for="p in filteredPreguntas"
          :key="p.indice_pregunta"
          class="list-group-item list-group-item-action py-4 px-4 border-bottom-0 question-result-item"
          role="button"
          data-bs-dismiss="modal"
          @click="seleccionarYMinimizar(p)"
        >
          <div class="d-flex justify-content-between align-items-baseline mb-1">
            <h6 class="mb-0 text-dark font-weight-bold d-flex align-items-center">
              <span class="question-code me-2">{{ p.etiqueta_1 }}</span>
              {{ p.nombre }}
            </h6>
            <span class="badge text-muted fw-normal small">Sección {{ p.num_seccion }}</span>
          </div>
          <p class="text-muted mb-0 small">
            {{ p.enunciado_1 }}
          </p>
        </div>
      </div>

      <!-- No hay resultados -->
      <div v-else-if="!loading" class="text-center py-5">
        <h5 class="text-muted fw-light">Sin resultados para "{{ searchText }}"</h5>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'

const codigoMedicion = inject('codigoMedicion')
const seleccionarPreguntaDesdeBuscador = inject('seleccionarPreguntaDesdeBuscador')

const searchText = ref('')
const preguntas = ref([])
const loading = ref(true)
const searchInput = ref(null)

/**
 * Selecciona una pregunta. El modal se cierra automáticamente
 * vía el atributo data-bs-dismiss del template.
 */
const seleccionarYMinimizar = (p) => {
  if (seleccionarPreguntaDesdeBuscador) {
    seleccionarPreguntaDesdeBuscador(p)
  }
}

onMounted(async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL
    const res = await fetch(`${baseUrl}content/mediciones/${codigoMedicion}/preguntas.json`)
    const data = await res.json()
    preguntas.value = data.filter((p) => Number(p.dataviz_display) === 1)

    // Escuchar el evento de Bootstrap para cuando el modal termina de abrirse
    const modalEl = document.getElementById('searchQuestionModal')
    if (modalEl) {
      modalEl.addEventListener('shown.bs.modal', () => {
        searchInput.value?.focus()
      })
    }
  } catch (e) {
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
})

const filteredPreguntas = computed(() => {
  if (!searchText.value) return preguntas.value
  const query = searchText.value.toLowerCase()
  return preguntas.value.filter((p) => {
    return (
      p.enunciado_1?.toLowerCase().includes(query) ||
      p.descripcion?.toLowerCase().includes(query) ||
      p.nombre?.toLowerCase().includes(query) ||
      p.palabras_clave?.toLowerCase().includes(query) ||
      String(p.etiqueta_1).toLowerCase().includes(query)
    )
  })
})
</script>

<style scoped>
.search-header {
  top: 0;
  z-index: 100;
}

.search-bar-pill {
  background-color: #f8fafc;
  height: 48px;
  border-radius: 24px;
  border: 1px solid #eef0f2;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.search-bar-pill:focus-within {
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(50, 32, 74, 0.05);
}

.search-bar-pill .form-control,
.search-bar-pill .input-group-text {
  background-color: transparent !important;
  border: none !important;
}

.search-bar-pill .form-control {
  font-size: 1rem;
  font-weight: 500;
}

.search-results {
  min-height: 400px;
}

.question-result-item {
  border-bottom: 1px solid #f0f0f0 !important;
  background-color: transparent;
}

.question-result-item:hover {
  background-color: #fcfcfc;
}

.question-code {
  font-size: 0.7rem;
  font-weight: 800;
  color: #8c96a0;
  background: #f1f3f5;
  padding: 0 6px;
  border-radius: 4px;
  min-width: 35px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-weight-bold {
  font-weight: 600;
}

.fw-light {
  font-weight: 300;
}
</style>
