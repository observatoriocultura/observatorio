<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import * as bootstrap from 'bootstrap'
import SexoChart from './SexoChart.vue'
import SexoTable from './SexoTable.vue'
import { SEXOS as DEFAULT_SEXOS } from '../constants'

const surveyConstants = inject('surveyConstants', {})
const sexos = surveyConstants.SEXOS || DEFAULT_SEXOS

const props = defineProps({
  preguntaSeleccionada: { type: Object, default: () => ({}) },
  variables: { type: Array, default: () => [] },
  posiblesRespuestas: { type: Array, default: () => [] },
  respuestasSexo: { type: Array, default: () => null },
  loading: { type: Boolean, default: false },
})

const variableSeleccionada = defineModel('variableSeleccionada', { type: Object, default: null })
const respuestaSeleccionada = defineModel('respuestaSeleccionada', { default: null })
const currentSubView = ref('combined') // 'combined' (Gráfico) o 'table' (Datos)

// Lógica de agrupación de datos por Sexo
const tablaAgrupada = computed(() => {
  if (!props.respuestasSexo || !variableSeleccionada.value || !respuestaSeleccionada.value)
    return []

  const varId = variableSeleccionada.value.indice_variable
  const respVal = respuestaSeleccionada.value

  const resultados = sexos.map((sexoItem) => {
    const respuestasVariableSexo = props.respuestasSexo.filter(
      (r) => Number(r.sexo) === Number(sexoItem.id) && r.indice_variable === varId,
    )

    const respuestasOpcionEspecifica = respuestasVariableSexo.filter(
      (r) => String(r.respuesta_v2) === String(respVal),
    )

    const sumaTotalVariable = respuestasVariableSexo.reduce(
      (acc, curr) => acc + (parseFloat(curr.suma_factor) || 0),
      0,
    )
    const sumaRespuestaEspecifica = respuestasOpcionEspecifica.reduce(
      (acc, curr) => acc + (parseFloat(curr.suma_factor) || 0),
      0,
    )
    const porcentaje =
      sumaTotalVariable > 0 ? (sumaRespuestaEspecifica / sumaTotalVariable) * 100 : 0

    return {
      codigo: sexoItem.id,
      nombre: sexoItem.nombre,
      suma_factor: sumaRespuestaEspecifica,
      suma_factor_total: sumaTotalVariable,
      porcentaje: porcentaje,
    }
  })

  return resultados
})

// Inicializar Tooltips de Bootstrap
onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el))
})
</script>

<template>
  <div class="sexos-view">
    <!-- 1. SELECTORES UNIFICADOS -->
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
              title="Ver Visualización Gráfica"
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
          <div
            class="row g-2"
            :class="variables.length > 1 ? 'justify-content-end' : 'justify-content-start'"
          >
            <div v-if="variables.length > 1" class="col-md-7">
              <select
                id="vSelect"
                class="form-select select-premium"
                v-model="variableSeleccionada"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Selecciona la variable de análisis para comparar entre sexos"
              >
                <option v-for="(v, i) in variables" :key="i" :value="v">
                  {{ v.enunciado_2 || v.codigo_variable }}
                </option>
              </select>
            </div>
            <div :class="variables.length > 1 ? 'col-md-5' : 'col-md-6 col-lg-4'">
              <select
                id="rSelect"
                class="form-select select-premium"
                v-model="respuestaSeleccionada"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Filtra por una opción de respuesta específica"
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
      <div v-if="currentSubView === 'combined'" class="row g-4 justify-content-center">
        <div class="col-lg-8">
          <SexoChart
            :preguntaSeleccionada="preguntaSeleccionada"
            :variableSeleccionada="variableSeleccionada"
            :respuestaSeleccionada="respuestaSeleccionada"
            :tablaAgrupada="tablaAgrupada"
            :loading="loading"
          />
        </div>
      </div>

      <SexoTable
        v-if="currentSubView === 'table'"
        :tablaAgrupada="tablaAgrupada"
        :loading="loading"
        :respuestaSeleccionada="respuestaSeleccionada"
      />
    </div>
  </div>
</template>

<style scoped>
.sexos-view {
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
  background: rgba(255, 255, 255, 0.5);
}

.btn-view.active {
  background: #ffffff;
  color: #32204a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
