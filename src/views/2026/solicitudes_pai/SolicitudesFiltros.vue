<template>
  <div class="row mb-4">
    <div class="col-12 d-flex gap-3 align-items-center justify-content-start flex-wrap">
      <select
        class="form-select form-select-sm w-auto"
        v-model="entidadFiltro"
        :class="{ 'filter-active': entidadFiltro !== '' }"
      >
        <option value="">Todas las entidades</option>
        <option v-for="entidad in opcionesEntidades" :key="entidad.nombreCorto" :value="entidad.nombreCorto">
          {{ entidad.nombreCorto }}
        </option>
      </select>

      <select
        class="form-select form-select-sm w-auto"
        v-model="dependenciaFiltro"
        :class="{ 'filter-active': dependenciaFiltro !== '' }"
      >
        <option value="">Todas las dependencias</option>
        <option v-for="dependencia in dependenciasUnicas" :key="dependencia" :value="dependencia">
          {{ dependencia }}
        </option>
      </select>

      <select
        class="form-select form-select-sm w-auto"
        v-model="lineaFiltro"
        :class="{ 'filter-active': lineaFiltro !== '' }"
      >
        <option value="">Todas las líneas</option>
        <option v-for="linea in lineasInvestigacion" :key="linea" :value="linea">
          {{ linea }}
        </option>
      </select>

      <select
        class="form-select form-select-sm w-auto"
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
        class="btn btn-sm btn-outline-secondary ms-auto"
        @click="limpiarFiltros"
        title="Limpiar todos los filtros"
      >
        <i class="bi bi-eraser"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const {
  entidadFiltro,
  dependenciaFiltro,
  lineaFiltro,
  seleccionadaFiltro,
  opcionesEntidades,
  dependenciasUnicas,
  lineasInvestigacion,
  opcionesSeleccionada,
} = inject('solicitudesData')

const limpiarFiltros = () => {
  entidadFiltro.value = ''
  dependenciaFiltro.value = ''
  lineaFiltro.value = ''
  seleccionadaFiltro.value = ''
}
</script>

<style scoped>
.filter-active {
  background-color: #e7dff1;
  border-color: #654096;
  font-weight: bold;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
