<script setup>
import { ref, watch, computed, inject, onMounted } from 'vue'
import * as bootstrap from 'bootstrap'
import LocalidadChart from './LocalidadChart.vue'
import LocalidadMap from './LocalidadMap.vue'
import LocalidadTable from './LocalidadTable.vue'

const props = defineProps({
  preguntaSeleccionada: { type: Object, default: () => ({}) },
  variables: { type: Array, default: () => [] },
  posiblesRespuestas: { type: Array, default: () => [] },
  respuestasLocalidad: { type: Array, default: () => null },
  loading: { type: Boolean, default: false },
})

const localidades = inject('localidades', ref([]))
const variableSeleccionada = ref(null)
const respuestaSeleccionada = ref(null)
const currentSubView = ref('combined') // 'combined' (Gráfico + Mapa) o 'table' (Datos)

// Seleccionar primera variable/respuesta automáticamente
watch(
  () => props.variables,
  (newVars) => {
    if (newVars?.length > 0) variableSeleccionada.value = newVars[0]
  },
  { immediate: true },
)

watch(
  () => props.posiblesRespuestas,
  (newResps) => {
    if (newResps?.length > 0) respuestaSeleccionada.value = newResps[0]
  },
  { immediate: true },
)

// Lógica de agrupación de datos (centralizada)
const tablaAgrupada = computed(() => {
  if (!props.respuestasLocalidad || !variableSeleccionada.value || !respuestaSeleccionada.value) return []

  const varId = variableSeleccionada.value.indice_variable
  const respVal = respuestaSeleccionada.value

  const resultados = localidades.value.map((loc) => {
    const respuestasVariableLocalidad = props.respuestasLocalidad.filter(
      (r) => String(r.localidad_cod) === String(loc.localidad_cod) && r.indice_variable === varId,
    )

    const respuestasOpcionEspecifica = respuestasVariableLocalidad.filter(
      (r) => String(r.respuesta_v2) === String(respVal),
    )

    const sumaTotalVariable = respuestasVariableLocalidad.reduce((acc, curr) => acc + (parseFloat(curr.suma_factor) || 0), 0)
    const sumaRespuestaEspecifica = respuestasOpcionEspecifica.reduce((acc, curr) => acc + (parseFloat(curr.suma_factor) || 0), 0)
    const porcentaje = sumaTotalVariable > 0 ? (sumaRespuestaEspecifica / sumaTotalVariable) * 100 : 0

    return {
      codigo: loc.localidad_cod,
      nombre: loc.localidad_residencia,
      suma_factor: sumaRespuestaEspecifica,
      suma_factor_total: sumaTotalVariable,
      porcentaje: porcentaje,
    }
  })

  return resultados.sort((a, b) => b.porcentaje - a.porcentaje)
})

// Inicializar Tooltips de Bootstrap
onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el))
})
</script>

<template>
  <div class="localidades-view">
    <!-- 1. SELECTORES UNIFICADOS (Sin caja contenedora para ganar espacio) -->
    <section class="section-filters mb-4 px-1">
      <div class="row g-3 align-items-center">
        <!-- SUB-MENU DE ICONOS (A LA IZQUIERDA) -->
        <div class="col-md-auto">
          <div class="view-toggle-group shadow-sm">
            <button 
              class="btn btn-view" 
              :class="{ active: currentSubView === 'combined' }"
              @click="currentSubView = 'combined'"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Ver Visualización Gráfica y Mapa"
            >
              <i class="bi bi-bar-chart-fill"></i>
            </button>
            <button 
              class="btn btn-view" 
              :class="{ active: currentSubView === 'table' }"
              @click="currentSubView = 'table'"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Ver Tabla de Datos"
            >
              <i class="bi bi-table"></i>
            </button>
          </div>
        </div>

        <!-- SELECTORES (A LA DERECHA) -->
        <div class="col-md">
          <div class="row g-2 justify-content-end">
            <div class="col-md-7">
              <select 
                id="vSelect" 
                class="form-select select-premium" 
                v-model="variableSeleccionada"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Selecciona la variable o dimensión de análisis para comparar entre localidades"
              >
                <option v-for="(v, i) in variables" :key="i" :value="v">
                  {{ v.enunciado_2 || v.codigo_variable }}
                </option>
              </select>
            </div>
            <div class="col-md-5">
              <select 
                id="rSelect" 
                class="form-select select-premium" 
                v-model="respuestaSeleccionada"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Filtra por una opción de respuesta específica para ver su peso porcentual en el mapa y gráficas"
              >
                <option v-for="(r, i) in posiblesRespuestas" :key="i" :value="r">
                  {{ r }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. VISTA ACTIVA -->
    <div class="sub-view-container">
      <!-- VISTA COMBINADA -->
      <div v-if="currentSubView === 'combined'" class="row g-4">
        <div class="col-lg-7">
          <LocalidadChart 
            :preguntaSeleccionada="preguntaSeleccionada"
            :variableSeleccionada="variableSeleccionada"
            :respuestaSeleccionada="respuestaSeleccionada"
            :tablaAgrupada="tablaAgrupada"
            :loading="loading"
          />
        </div>
        <div class="col-lg-5">
          <LocalidadMap 
            :preguntaSeleccionada="preguntaSeleccionada"
            :variableSeleccionada="variableSeleccionada"
            :respuestaSeleccionada="respuestaSeleccionada"
            :respuestasLocalidad="respuestasLocalidad"
            :loading="loading"
          />
        </div>
      </div>

      <LocalidadTable 
        v-if="currentSubView === 'table'"
        :tablaAgrupada="tablaAgrupada"
        :loading="loading"
        :respuestaSeleccionada="respuestaSeleccionada"
      />
    </div>
  </div>
</template>

<style scoped>
.localidades-view {
  animation: fadeIn 0.4s ease-out;
}

.view-toggle-group {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 14px;
}

.btn-view {
  border: none;
  background: transparent;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-view:hover {
  color: #32204a;
  background: rgba(255,255,255,0.5);
}

.btn-view.active {
  background: #ffffff;
  color: #32204a;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
