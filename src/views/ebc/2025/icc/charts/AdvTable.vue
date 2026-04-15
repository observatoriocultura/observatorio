<script setup>
import { computed } from 'vue'

const props = defineProps({
  variablesFiltradas: {
    type: Array,
    required: true,
  },
  respuestasPregunta: {
    type: Array,
    required: true,
  },
  sumatoriaFactor: {
    type: Number,
    required: true,
  },
  posiblesRespuestas: {
    type: Array,
    default: () => [],
  },
})

/**
 * Organiza los datos para una lectura fluida por parte del usuario.
 * Agrupa las respuestas por variable.
 */
const tablaOrganizada = computed(() => {
  return props.variablesFiltradas.map((variable) => {
    const respuestasDeVariable = props.respuestasPregunta.filter(
      (r) => r.indice_variable === variable.indice_variable
    )

    return {
      codigo: variable.codigo_variable,
      enunciado: variable.enunciado_2 || variable.codigo_variable,
      unidad: variable.unidad_medida,
      respuestas: respuestasDeVariable.map((r) => ({
        opcion: r.respuesta_v2,
        valor: r.suma_factor,
        porcentaje: r.porcentaje,
      })),
    }
  })
})
</script>

<template>
  <div class="adv-table-container mt-4">
    <div v-for="variable in tablaOrganizada" :key="variable.codigo" class="variable-block mb-5">
      <div class="card-premium overflow-hidden">
        <div class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <h6 class="text-uppercase text-muted fw-bold small mb-0">
            <i class="bi bi-list-check text-premium me-2"></i>{{ variable.enunciado }}
          </h6>
          <span class="badge rounded-pill bg-light text-dark border fw-normal">
            {{ variable.unidad || 'Resultados' }}
          </span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th scope="col" class="border-0 py-2 ps-4">Opción de Respuesta</th>
                <th scope="col" class="text-end text-nowrap border-0 py-2">Población Estimada</th>
                <th scope="col" class="text-end text-nowrap border-0 py-2 pe-4" style="width: 150px">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(resp, idx) in variable.respuestas" :key="idx">
                <td class="fw-semibold text-dark py-3 ps-4">
                  {{ resp.opcion }}
                </td>
                <td class="text-end text-muted py-3">
                  {{ Math.round(resp.valor).toLocaleString('es-CO') }}
                </td>
                <td class="text-end py-3 pe-4">
                  <div class="d-flex align-items-center justify-content-end gap-2">
                    <div class="progress flex-grow-1 d-none d-sm-flex" style="height: 6px; min-width: 60px; max-width: 100px;">
                      <div 
                        class="progress-bar bg-premium" 
                        role="progressbar" 
                        :style="{ width: resp.porcentaje + '%' }"
                        :aria-valuenow="resp.porcentaje" 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span class="fw-bold text-premium" style="font-size: 1.1rem; min-width: 55px;">
                      {{ resp.porcentaje.toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="tablaOrganizada.length === 0" class="text-center py-5">
      <i class="bi bi-clipboard-x display-1 text-muted opacity-25"></i>
      <p class="text-muted mt-3">No hay datos disponibles para la selección actual.</p>
    </div>
  </div>
</template>

<style scoped>
.adv-table-container {
  animation: fadeIn 0.5s ease-out;
}

.bg-premium {
  background-color: #32204a !important;
}

.text-premium {
  color: #32204a !important;
}

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

.progress {
  background-color: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
