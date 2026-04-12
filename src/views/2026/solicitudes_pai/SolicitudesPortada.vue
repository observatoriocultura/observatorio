<template>
  <div class="portada py-5 text-center px-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Cargando métricas...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- Balance de Evaluación -->
    <div v-else class="balance-container mx-auto" style="max-width: 800px">
      <h2 class="display-6 fw-bold text-secondary mb-2" style="color: #6c757d !important">
        Balance de la evaluación de<br />solicitudes de Investigación
      </h2>
      <h1 class="display-5 fw-bold mb-5" style="color: #ffc107">PAI 2026</h1>

      <div
        class="row align-items-center justify-content-center text-center row-cols-2 row-cols-md-4 g-4 mt-4"
      >
        <div class="col">
          <p class="mb-1 text-muted fs-5">Solicitudes</p>
          <div class="display-4 fw-light text-primary" style="color: #0b4e65 !important">
            {{ totalSolicitudes }}
          </div>
        </div>

        <div class="col">
          <p class="mb-1 text-muted fs-5">Seleccionadas</p>
          <div class="display-4 fw-light text-primary" style="color: #0b4e65 !important">
            {{ seleccionadas }}
          </div>
        </div>

        <div class="col">
          <p class="mb-1 text-muted fs-5">(Agrupadas)</p>
          <div class="display-4 fw-light text-primary" style="color: #0b4e65 !important">
            {{ agrupadas }}
          </div>
        </div>

        <div class="col">
          <p class="mb-1 text-muted fs-5">Por convenio</p>
          <div class="display-4 fw-light text-primary" style="color: #0b4e65 !important">
            {{ porConvenio }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const { solicitudes, loading, error } = inject('solicitudesData', {
  solicitudes: ref([]),
  loading: ref(false),
  error: ref(null),
})

const getCountBySelection = (valueName) => {
  return solicitudes.value.filter(
    (s) => s.mostrar && s.mostrar.trim() === 'Sí' && s.seleccionada === valueName,
  ).length
}

const totalSolicitudes = computed(() => {
  return solicitudes.value.filter((s) => s.mostrar && s.mostrar.trim() === 'Sí').length
})

const seleccionadas = computed(() => getCountBySelection('Sí'))
const agrupadas = computed(() => getCountBySelection('Sí (Agrupada)'))
const porConvenio = computed(() => getCountBySelection('Por convenio'))
</script>
