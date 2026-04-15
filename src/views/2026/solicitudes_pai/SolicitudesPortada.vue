<template>
  <div class="portada pt-3 pb-5 text-center px-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Cargando balance...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- Balance de Evaluación -->
    <div v-else class="balance-container mx-auto" style="max-width: 980px">
      <h2 class="display-6 fw-bold text-secondary mb-2" style="color: #6c757d !important">
        Balance de solicitudes de investigación
      </h2>
      <h1 class="display-5 fw-bold mb-3" style="color: #ffc107">PAI 2026</h1>

      <p class="lead text-secondary mx-auto mb-3" style="max-width: 760px">
        El Observatorio revisa las necesidades de información recibidas y selecciona cuáles harán
        parte del Plan Anual de Investigaciones, ya sea como mediciones principales, mediciones
        integradas a otros procesos o iniciativas desarrolladas mediante convenio.
      </p>

      <div
        class="row balance-metrics align-items-stretch justify-content-center text-center row-cols-2 row-cols-md-5 g-4 mt-2"
      >
        <div class="col">
          <div class="metric-card">
            <p class="metric-title">Solicitudes recibidas</p>
            <div class="metric-value">
              {{ totalSolicitudes }}
            </div>
            <p class="metric-description">
              Total de solicitudes revisadas para construir el PAI 2026
            </p>
          </div>
        </div>

        <div class="col">
          <div class="metric-card">
            <p class="metric-title">Seleccionadas</p>
            <div class="metric-value">
              {{ seleccionadas }}
            </div>
            <p class="metric-description">Solicitudes que se selecionan para realizar medición</p>
          </div>
        </div>

        <div class="col">
          <div class="metric-card">
            <p class="metric-title">Agrupadas</p>
            <div class="metric-value">
              {{ agrupadas }}
            </div>
            <p class="metric-description">
              Solicitudes seleccionadas que se atenderán dentro de otra medición
            </p>
          </div>
        </div>

        <div class="col">
          <div class="metric-card">
            <p class="metric-title">Por convenio</p>
            <div class="metric-value">
              {{ porConvenio }}
            </div>
            <p class="metric-description">
              Solicitudes que se realizan mediante acuerdos con otras entidades
            </p>
          </div>
        </div>

        <div class="col">
          <div class="metric-card">
            <p class="metric-title">Mediciones</p>
            <div class="metric-value metric-value-highlight">
              {{ totalMediciones }}
            </div>
            <p class="metric-description">Mediciones que se realizarán</p>
          </div>
        </div>
      </div>

      <div class="text-start mx-auto mt-5 p-3 bg-light rounded" style="max-width: 820px">
        <p class="fw-semibold text-dark mb-2">Sobre el balance</p>
        <p class="small text-secondary mb-2">
          No todas las solicitudes se convierten en una investigación independiente. Algunas se
          priorizan como investigaciones principales, otras se integran a otras más amplias y
          algunas se gestionan mediante convenios con otras entidades.
        </p>
        <p class="small text-secondary mb-0">
          Además, una sola solicitud puede dar lugar a más de una medición. Por eso el número de
          mediciones previstas puede ser distinto al número de solicitudes seleccionadas.
        </p>
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

const totalMediciones = computed(() => {
  return solicitudes.value
    .filter((s) => s.mostrar && s.mostrar.trim() === 'Sí')
    .reduce((total, solicitud) => {
      const cantidad = Number(solicitud.cantidad_mediciones)
      return total + (Number.isNaN(cantidad) ? 0 : cantidad)
    }, 0)
})

const seleccionadas = computed(() => getCountBySelection('Sí'))
const agrupadas = computed(() => getCountBySelection('Sí (Agrupada)'))
const porConvenio = computed(() => getCountBySelection('Por convenio'))
</script>

<style scoped>
.balance-metrics > .col {
  display: flex;
}

.metric-card {
  width: 100%;
  min-height: 100%;
  padding: 1rem 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #ffffff;
}

.metric-title {
  min-height: 3rem;
  margin-bottom: 0.25rem;
  color: #6c757d;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;
}

.metric-value {
  min-height: 4.25rem;
  color: #0b4e65;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 300;
  line-height: 1;
}

.metric-value-highlight {
  color: #ffc107;
}

.metric-description {
  margin: 0.25rem 0 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.35;
}

@media (max-width: 575.98px) {
  .metric-card {
    padding: 0.875rem 0.625rem;
  }

  .metric-title {
    min-height: 3.5rem;
    font-size: 0.95rem;
  }

  .metric-value {
    min-height: 3.5rem;
    font-size: 2.75rem;
  }
}
</style>
