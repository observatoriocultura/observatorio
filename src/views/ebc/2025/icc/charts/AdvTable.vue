<script setup>
import { computed, onUnmounted, ref } from 'vue'

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
      (r) => r.indice_variable === variable.indice_variable,
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

const copiado = ref(false)
let timeoutCopiado = null

const limpiarTextoTSV = (valor) => {
  return String(valor ?? '')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
}

const formatearPorcentaje = (valor) => `${Number(valor || 0).toFixed(1)}%`

const formatearPoblacion = (valor) => Math.round(Number(valor) || 0).toLocaleString('es-CO')

const construirTSV = () => {
  return tablaOrganizada.value
    .map((variable) => {
      const encabezado = [
        ['Variable', limpiarTextoTSV(variable.enunciado)],
        ['Unidad', limpiarTextoTSV(variable.unidad || 'Resultados')],
        [],
        ['Opcion de Respuesta', 'Porcentaje', 'Poblacion Estimada'],
      ]

      const filas = variable.respuestas.map((resp) => [
        limpiarTextoTSV(resp.opcion),
        formatearPorcentaje(resp.porcentaje),
        Math.round(Number(resp.valor) || 0),
      ])

      return [...encabezado, ...filas].map((fila) => fila.join('\t')).join('\n')
    })
    .join('\n\n')
}

const copiarConFallback = (texto) => {
  const textarea = document.createElement('textarea')
  textarea.value = texto
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'

  try {
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

const confirmarCopiado = () => {
  copiado.value = true
  if (timeoutCopiado) window.clearTimeout(timeoutCopiado)

  timeoutCopiado = window.setTimeout(() => {
    copiado.value = false
    timeoutCopiado = null
  }, 1800)
}

const copiarTabla = async () => {
  const texto = construirTSV()
  if (!texto) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
    } else {
      copiarConFallback(texto)
    }

    confirmarCopiado()
  } catch {
    copiarConFallback(texto)
    confirmarCopiado()
  }
}

onUnmounted(() => {
  if (timeoutCopiado) window.clearTimeout(timeoutCopiado)
})
</script>

<template>
  <div class="adv-table-container mt-4">
    <div v-for="variable in tablaOrganizada" :key="variable.codigo" class="variable-block mb-5">
      <div class="card-premium overflow-hidden">
        <div
          class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center"
        >
          <h6 class="text-uppercase text-muted fw-bold small mb-0">
            <i class="bi bi-list-check text-premium me-2"></i>{{ variable.enunciado }}
          </h6>
          <div class="table-header-actions d-flex align-items-center gap-2">
            <span class="badge rounded-pill bg-light text-dark border fw-normal">
              {{ variable.unidad || 'Resultados' }}
            </span>
            <button
              type="button"
              class="btn copy-table-btn"
              :class="{ copied: copiado }"
              :aria-label="copiado ? 'Tabla copiada' : 'Copiar tabla para Excel'"
              :title="copiado ? 'Copiado' : 'Copiar tabla para Excel'"
              @click="copiarTabla"
            >
              <i :class="copiado ? 'bi bi-check2' : 'bi bi-copy'" aria-hidden="true"></i>
              <span class="visually-hidden">{{ copiado ? 'Copiado' : 'Copiar tabla' }}</span>
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th scope="col" class="border-0 py-1 ps-3">Opcion de Respuesta</th>
                <th scope="col" class="text-end text-nowrap border-0 py-1 percentage-col">
                  Porcentaje
                </th>
                <th scope="col" class="text-end text-nowrap border-0 py-1 pe-3">
                  Poblacion Estimada
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(resp, idx) in variable.respuestas" :key="idx">
                <td class="fw-semibold text-dark py-2 ps-3">
                  {{ resp.opcion }}
                </td>
                <td class="text-end py-2">
                  <span class="fw-bold text-premium percentage-value">
                    {{ formatearPorcentaje(resp.porcentaje) }}
                  </span>
                </td>
                <td class="text-end py-2 pe-3 estimated-population">
                  {{ formatearPoblacion(resp.valor) }}
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

.copy-table-btn {
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.45rem 0.55rem;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.copy-table-btn:hover,
.copy-table-btn:focus {
  color: #32204a;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.copy-table-btn.copied {
  color: #10ac84;
  border-color: #c6f6df;
  background: #f0fdf4;
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

.percentage-col {
  width: 120px;
}

.percentage-value {
  font-size: 1.05rem;
}

.estimated-population {
  color: #94a3b8;
  font-size: 0.8rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
