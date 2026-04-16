<template>
  <div style="max-width: 920px; margin: auto">
    <!-- Componente de Filtros -->
    <SolicitudesFiltros />

    <!-- Listado Card -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Cargando solicitudes...</p>
            </div>

            <div v-else-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <div v-else class="list-group list-group-flush mt-2">
              <div
                v-for="(item, index) in solicitudesFiltradas"
                :key="index"
                class="list-group-item py-4 px-0 border-bottom d-flex align-items-center flex-wrap flex-md-nowrap gap-3"
              >
                <!-- Información de la solicitud -->
                <div class="flex-grow-1 pe-4">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div
                      class="text-uppercase text-muted small fw-bold"
                      style="letter-spacing: 0.5px"
                    >
                      {{ item.tema }}
                    </div>
                    <button
                      class="btn btn-sm btn-outline-light text-dark shadow-sm"
                      @click="abrirDetalles(item)"
                    >
                      Ver detalles
                    </button>
                  </div>
                  <h3 class="h5 fw-bold mb-3 text-dark">
                    <span class="badge bg-info">{{ item.num }}</span>
                    {{ item.nombre_corto }}
                  </h3>
                  <div class="">
                    <span
                      class="badge text-dark rounded-pill me-2"
                      :class="getLineaClass(item.linea_investigacion)"
                    >
                      {{ item.linea_investigacion }}
                    </span>
                    <span
                      class="badge text-dark rounded-pill me-2"
                      :class="getEntidadClass(item.entidad_corto)"
                    >
                      {{ item.entidad_corto }}
                    </span>
                    <span class="text-muted small">
                      {{ item.dependencia_1 }}
                    </span>
                  </div>
                </div>

                <!-- Resultado de evaluación -->
                <div
                  class="d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded"
                  :style="{
                    backgroundColor: getOpcionSeleccionada(item.seleccionada).background,
                    minWidth: '140px',
                  }"
                >
                  <i :class="getOpcionSeleccionada(item.seleccionada).icon" class="fs-6"></i>
                  <span class="fw-bold fs-6 m-0">{{
                    getOpcionSeleccionada(item.seleccionada).value
                  }}</span>
                </div>
              </div>

              <div v-if="solicitudesFiltradas.length === 0" class="text-center py-5 text-muted">
                No hay solicitudes para mostrar.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import SolicitudesFiltros from './SolicitudesFiltros.vue'

const router = useRouter()

const { loading, error, opcionesSeleccionada, solicitudesFiltradas, solicitudActual } =
  inject('solicitudesData')

const abrirDetalles = (solicitud) => {
  solicitudActual.value = solicitud
  router.push('/2026/solicitudes-pai/detalle')
}

const getOpcionSeleccionada = (val) => {
  const op = opcionesSeleccionada.value.find((o) => o.value === val)
  return (
    op || {
      value: val || 'Sin evaluar',
      icon: 'bi bi-question-circle text-secondary',
      background: '#e9ecef',
      valueSum: 0,
    }
  )
}

const getLineaClass = (linea) => {
  if (!linea) return ''
  return `linea-${linea.trim().toLowerCase().replace(/\s+/g, '-')}`
}

const getEntidadClass = (entidad) => {
  if (!entidad) return ''
  return `entidad-${entidad.trim().toLowerCase().replace(/\s+/g, '-')}`
}
</script>
