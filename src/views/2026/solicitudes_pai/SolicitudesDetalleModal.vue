<template>
  <div>
    <div v-if="!solicitud" class="text-center py-4">
      <p class="text-muted">No se ha seleccionado ninguna solicitud.</p>
    </div>
    <div v-else>
      <div class="mb-4">
        <span class="text-uppercase text-muted small fw-bold" style="letter-spacing: 0.5px">
          {{ solicitud.tema }}
        </span>
        <h4 class="fw-bold mt-1 mb-2 text-dark">
          <span class="badge bg-info me-2">{{ solicitud.num }}</span>
          {{ solicitud.nombre_corto }}
        </h4>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <h6 class="text-muted small text-uppercase mb-1">Entidad Solicitante</h6>
          <p class="fw-semibold mb-0">{{ solicitud.entidad }}</p>
          <p class="text-muted small">{{ solicitud.dependencia_1 }}</p>
        </div>
        <div class="col-md-6 mb-3">
          <h6 class="text-muted small text-uppercase mb-1">Línea de Investigación</h6>
          <p class="mb-0 fw-semibold">{{ solicitud.linea_investigacion }}</p>
        </div>
      </div>

      <div class="mb-4">
        <h6 class="text-muted small text-uppercase mb-2">Descripción de la Solicitud</h6>
        <div class="p-3 bg-light rounded text-secondary" style="line-height: 1.6">
          {{ solicitud.solicitud }}
        </div>
      </div>

      <div v-if="solicitud.justificacion" class="mb-4">
        <h6 class="text-muted small text-uppercase mb-2">Justificación de la solicitud</h6>
        <div class="p-3 bg-white border rounded text-secondary" style="line-height: 1.6">
          {{ solicitud.justificacion }}
        </div>
      </div>

      <div class="row mb-4">
        <div v-if="solicitud.finalidad" class="col-md-6 mb-3 mb-md-0">
          <h6 class="text-muted small text-uppercase mb-2">Finalidad de la solicitud</h6>
          <div class="p-3 bg-white border rounded text-secondary h-100" style="line-height: 1.6">
            {{ solicitud.finalidad }}
          </div>
        </div>
        <div v-if="solicitud.poblaciones" class="col-md-6">
          <h6 class="text-muted small text-uppercase mb-2">Poblaciones involucradas</h6>
          <div class="p-3 bg-white border rounded text-secondary h-100" style="line-height: 1.6">
            {{ solicitud.poblaciones }}
          </div>
        </div>
      </div>

      <div class="mb-3">
        <h6 class="text-muted small text-uppercase mb-2">Solicitud seleccionada</h6>
        <div
          class="d-inline-flex align-items-center p-2 px-3 rounded shadow-sm border border-light"
          style="background-color: #f8f9fa"
        >
          <span class="fw-bold fs-5 me-2 text-dark">{{
            solicitud.seleccionada || 'Sin evaluar'
          }}</span>
        </div>
      </div>

      <!-- Se pueden añadir aquí más campos del CSV según sea necesario -->
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  solicitud: {
    type: Object,
    default: null,
  },
})
</script>
