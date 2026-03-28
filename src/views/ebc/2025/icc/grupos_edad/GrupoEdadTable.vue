<script setup>
defineProps({
  tablaAgrupada: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  respuestaSeleccionada: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="grupo-edad-table">
    <div class="card-premium overflow-hidden">
      <div class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
        <h6 class="text-uppercase text-muted fw-bold small mb-0">
          <i class="bi bi-people text-premium me-2"></i>Resultados por Grupo de Edad
        </h6>
        <span v-if="respuestaSeleccionada" class="badge rounded-pill bg-light text-dark border fw-normal">
          Filtrado por: {{ respuestaSeleccionada }}
        </span>
      </div>

      <div v-if="loading" class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Procesando...</span>
        </div>
        <div class="text-muted mt-2 small">Cargando datos por rango de edad...</div>
      </div>

      <div
        v-else-if="tablaAgrupada.length === 0"
        class="alert alert-warning m-4"
      >
        <i class="bi bi-exclamation-triangle me-2"></i> No se encontraron datos para la
        combinación seleccionada.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-muted small text-uppercase">
            <tr>
              <th scope="col" class="text-center border-0 py-2" style="width: 100px">ID</th>
              <th scope="col" class="border-0 py-2">Grupo de Edad</th>
              <th scope="col" class="text-end text-nowrap border-0 py-2">
                Población (Opc. Seleccionada)
              </th>
              <th scope="col" class="text-end text-nowrap border-0 py-2">Total Variable</th>
              <th scope="col" class="text-end text-nowrap border-0 py-2">% Respuesta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fila in tablaAgrupada" :key="fila.codigo">
              <td class="text-center text-muted small py-2">{{ fila.codigo }}</td>
              <td class="fw-semibold text-dark py-2">{{ fila.nombre }}</td>
              <td class="text-end fw-bold text-premium py-2">
                {{ Math.round(fila.suma_factor).toLocaleString('es-CO') }}
              </td>
              <td class="text-end text-muted small py-2">
                {{ Math.round(fila.suma_factor_total).toLocaleString('es-CO') }}
              </td>
              <td class="text-end fw-bold text-premium py-2" style="font-size: 1rem">
                {{ fila.porcentaje.toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table thead th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border: none;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f1f5f9;
}

.badge {
  font-size: 0.75rem;
  padding: 0.5em 1em;
}
</style>
