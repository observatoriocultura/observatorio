<template>
  <div style="max-width: 920px; margin: auto">
    <SolicitudesFiltros />
  </div>

  <!-- SELECTOR DE SOLICITUDES -->
  <nav aria-label="Navegación de solicitudes" class="mb-4" v-if="total > 0">
    <ul class="pagination pagination-sm justify-content-center flex-wrap custom-pagination gap-1">
      <li class="page-item" :class="{ disabled: currentIndex <= 0 }">
        <a class="page-link" href="#" @click.prevent="prevSolicitud">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
      <li
        class="page-item"
        v-for="item in solicitudesFiltradas"
        :key="item.num"
        :class="{ active: item === solicitud }"
      >
        <a class="page-link" href="#" @click.prevent="seleccionarSolicitud(item)">
          {{ item.num }}
        </a>
      </li>
      <li class="page-item" :class="{ disabled: currentIndex >= total - 1 || currentIndex === -1 }">
        <a class="page-link" href="#" @click.prevent="nextSolicitud">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    </ul>
  </nav>

  <!-- INFORMACIÓN DE LA SOLICITUD -->
  <div class="container-fluid mb-5">
    <div v-if="!solicitud" class="text-center py-5">
      <p class="text-muted mb-0">No se ha cargado ninguna solicitud para mostrar.</p>
    </div>

    <div v-else class="row g-4">
      <!-- Columna 1: Título y meta -->
      <div class="col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-4 border-top border-4 border-warning rounded-top">
            <span
              class="text-uppercase text-muted fw-bold d-block mb-2"
              style="letter-spacing: 1px; font-size: 0.85rem"
            >
              {{ solicitud.tema }}
            </span>
            <h3 class="fw-bold text-dark lh-base mb-4">
              <span
                class="badge text-dark align-text-bottom me-2"
                :class="getEntidadClass(solicitud.entidad_corto)"
              >
                {{ solicitud.num }}
              </span>
              {{ solicitud.nombre_corto }}
            </h3>

            <h6 class="text-muted small text-uppercase fw-bold mb-2">Entidad Solicitante</h6>
            <p class="fs-6 fw-semibold text-dark mb-1">{{ solicitud.entidad }}</p>
            <p class="text-secondary small mb-4">{{ solicitud.dependencia_1 }}</p>

            <h6 class="text-muted small text-uppercase fw-bold mb-2">Línea de Investigación</h6>
            <p class="fs-6 fw-semibold mb-0">
              <span
                class="badge text-dark rounded-pill"
                :class="getLineaClass(solicitud.linea_investigacion)"
              >
                {{ solicitud.linea_investigacion }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Columna 2: Detalles de Solicitud -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-4">
            <div class="mb-4">
              <h6 class="fw-bold mb-2" style="color: #654096">Descripción de la Solicitud</h6>
              <p class="text-dark fs-6 mb-0" style="line-height: 1.6">
                {{ solicitud.solicitud }}
              </p>
            </div>

            <div v-if="solicitud.justificacion" class="mb-4">
              <h6 class="fw-bold mb-2" style="color: #654096">Justificación de la solicitud</h6>
              <p class="text-secondary mb-0" style="line-height: 1.6">
                {{ solicitud.justificacion }}
              </p>
            </div>

            <div class="row g-3">
              <div v-if="solicitud.finalidad" class="col-md-6">
                <h6 class="fw-bold mb-2" style="color: #654096">Finalidad de la solicitud</h6>
                <p class="text-secondary mb-0" style="line-height: 1.6">
                  {{ solicitud.finalidad }}
                </p>
              </div>
              <div v-if="solicitud.poblaciones" class="col-md-6">
                <h6 class="fw-bold mb-2" style="color: #654096">Poblaciones involucradas</h6>
                <p class="text-secondary mb-0" style="line-height: 1.6">
                  {{ solicitud.poblaciones }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna 3: Resultado / Respuesta -->
      <div class="col-lg-3 d-flex flex-column">
        <div class="mb-3">
          <h6 class="text-muted small text-uppercase fw-bold mb-2">Seleccionada para el PAI:</h6>
          <div
            class="d-flex align-items-center gap-2 py-2 px-3 rounded"
            :style="{ backgroundColor: getOpcionSeleccionada(solicitud.seleccionada).background }"
          >
            <i :class="getOpcionSeleccionada(solicitud.seleccionada).icon" class="fs-6 m-0"></i>
            <span class="fs-6 fw-bold text-dark m-0">{{
              getOpcionSeleccionada(solicitud.seleccionada).value
            }}</span>
          </div>
        </div>

        <div class="card border-0 shadow-sm flex-grow-1">
          <div class="card-body p-4 text-start">
            <h6 class="text-muted small text-uppercase fw-bold mb-3">Respuesta a la solicitud</h6>
            <div
              v-if="solicitud.respuesta_a_solicitante"
              class="text-secondary small"
              style="line-height: 1.5"
            >
              {{ solicitud.respuesta_a_solicitante }}
            </div>
            <div v-else class="text-muted small">La respuesta aun no está disponible</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, onMounted, onUnmounted } from 'vue'
import SolicitudesFiltros from './SolicitudesFiltros.vue'

const {
  solicitudActual: solicitud,
  solicitudesFiltradas,
  opcionesSeleccionada,
} = inject('solicitudesData', {
  solicitudActual: null,
  solicitudesFiltradas: [],
  opcionesSeleccionada: [],
})

const getOpcionSeleccionada = (val) => {
  const op = opcionesSeleccionada.value?.find((o) => o.value === val)
  return (
    op || {
      value: val || 'Sin evaluar',
      icon: 'bi bi-question-circle text-secondary',
      background: '#e9ecef',
      valueSum: 0,
    }
  )
}

const getEntidadClass = (entidad) => {
  if (!entidad) return ''
  return `entidad-${entidad.trim().toLowerCase().replace(/\s+/g, '-')}`
}

const getLineaClass = (linea) => {
  if (!linea) return ''
  return `linea-${linea.trim().toLowerCase().replace(/\s+/g, '-')}`
}

const currentIndex = computed(() => {
  if (!solicitud.value || !solicitudesFiltradas.value) return -1
  return solicitudesFiltradas.value.findIndex((s) => s === solicitud.value)
})

const total = computed(() => (solicitudesFiltradas.value ? solicitudesFiltradas.value.length : 0))

const prevSolicitud = () => {
  if (currentIndex.value > 0) {
    solicitud.value = solicitudesFiltradas.value[currentIndex.value - 1]
  }
}

const nextSolicitud = () => {
  if (currentIndex.value < total.value - 1 && currentIndex.value !== -1) {
    solicitud.value = solicitudesFiltradas.value[currentIndex.value + 1]
  }
}

const seleccionarSolicitud = (item) => {
  solicitud.value = item
}

const shouldIgnoreKeyboardNavigation = (event) => {
  const target = event.target
  const tagName = target?.tagName?.toLowerCase()

  return (
    tagName === 'input' ||
    tagName === 'select' ||
    tagName === 'textarea' ||
    target?.isContentEditable
  )
}

const handleKeyboardNavigation = (event) => {
  if (shouldIgnoreKeyboardNavigation(event)) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prevSolicitud()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextSolicitud()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboardNavigation)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardNavigation)
})
</script>

<style scoped>
.custom-pagination .page-link {
  color: #6c757d; /* Texto gris */
  border-color: #ffffff; /* Borde blanco */
  font-weight: 300; /* Fuente delgada */
  min-width: 38px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px; /* Opcional: redondear suavemente todos los botones individualmente */
}

.custom-pagination .page-link:hover {
  background-color: #f6f0fd;
  color: #654096;
}

.custom-pagination .page-item.active .page-link {
  background-color: #654096;
  border-color: #654096;
  color: #ffffff;
  font-weight: bold; /* El activo sí se mantiene grueso */
}

.custom-pagination .page-item.disabled .page-link {
  color: #d1d5db; /* Gris más claro para los totalmente desactivados */
  border-color: #ffffff;
  background-color: #fff;
}
</style>
