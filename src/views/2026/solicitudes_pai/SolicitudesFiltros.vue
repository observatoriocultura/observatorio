<template>
  <div class="row mb-4">
    <div class="col-12">
      <div class="filters-toolbar">
        <select
          class="form-select form-select-sm filter-select"
          v-model="entidadFiltro"
          :class="{ 'filter-active': entidadFiltro !== '' }"
        >
          <option value="">Todas las entidades</option>
          <option
            v-for="entidad in opcionesEntidades"
            :key="entidad.nombreCorto"
            :value="entidad.nombreCorto"
          >
            {{ entidad.nombreCorto }}
          </option>
        </select>

        <select
          class="form-select form-select-sm filter-select"
          v-model="dependenciaFiltro"
          :class="{ 'filter-active': dependenciaFiltro !== '' }"
        >
          <option value="">{{ dependenciaPlaceholder }}</option>
          <option v-for="dependencia in dependenciasUnicas" :key="dependencia" :value="dependencia">
            {{ dependencia }}
          </option>
        </select>

        <select
          class="form-select form-select-sm filter-select"
          v-model="lineaFiltro"
          :class="{ 'filter-active': lineaFiltro !== '' }"
        >
          <option value="">Todas las líneas</option>
          <option v-for="linea in lineasInvestigacion" :key="linea" :value="linea">
            {{ linea }}
          </option>
        </select>

        <select
          class="form-select form-select-sm filter-select"
          v-model="seleccionadaFiltro"
          :class="{ 'filter-active': seleccionadaFiltro !== '' }"
        >
          <option value="">Todos los estados</option>
          <option v-for="opcion in opcionesSeleccionada" :key="opcion.value" :value="opcion.value">
            {{ opcion.value }}
          </option>
        </select>

        <button
          v-if="entidadFiltro || dependenciaFiltro || lineaFiltro || seleccionadaFiltro"
          class="btn btn-sm btn-outline-secondary filter-clear"
          @click="limpiarFiltros"
          title="Limpiar todos los filtros"
        >
          <i class="bi bi-eraser"></i>
        </button>
      </div>

      <p class="filter-counter mb-0 mt-3 text-secondary text-center">
        <span>{{ solicitudesFiltradas.length }}</span> de {{ totalDisponibles }} solicitudes
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const {
  entidadFiltro,
  dependenciaFiltro,
  lineaFiltro,
  seleccionadaFiltro,
  opcionesEntidades,
  dependenciasUnicas,
  lineasInvestigacion,
  opcionesSeleccionada,
  solicitudesFiltradas,
  totalDisponibles,
} = inject('solicitudesData')

const dependenciaPlaceholder = computed(() => {
  return entidadFiltro.value
    ? `Todas las dependencias de ${entidadFiltro.value}`
    : 'Todas las dependencias'
})

const limpiarFiltros = () => {
  entidadFiltro.value = ''
  dependenciaFiltro.value = ''
  lineaFiltro.value = ''
  seleccionadaFiltro.value = ''
}
</script>

<style scoped>
.filters-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  width: 100%;
  min-width: 0;
}

.filter-clear {
  min-width: 2rem;
}

.filter-counter span {
  color: #654096;
  font-weight: 700;
}

.filter-active {
  background-color: #e7dff1;
  border-color: #654096;
  font-weight: bold;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

@media (max-width: 991.98px) {
  .filters-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  }
}

@media (max-width: 575.98px) {
  .filters-toolbar {
    grid-template-columns: 1fr;
  }

  .filter-clear {
    width: 100%;
  }
}
</style>
