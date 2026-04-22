<script setup>
import { computed, onMounted, inject } from 'vue'
import * as bootstrap from 'bootstrap'
import ClaseChart from './ClaseChart.vue'
import ClaseTable from './ClaseTable.vue'
import { CLASES as DEFAULT_CLASES } from '../constants'

const surveyConstants = inject('surveyConstants', {})
const clases = surveyConstants.CLASES || DEFAULT_CLASES

const props = defineProps({
  preguntaSeleccionada: { type: Object, default: () => ({}) },
  variables: { type: Array, default: () => [] },
  posiblesRespuestas: { type: Array, default: () => [] },
  respuestasClase: { type: Array, default: () => null },
  loading: { type: Boolean, default: false },
})

const variableSeleccionada = defineModel('variableSeleccionada', { type: Object, default: null })
const respuestaSeleccionada = defineModel('respuestaSeleccionada', { default: null })

const tablaAgrupada = computed(() => {
  if (!props.respuestasClase || !variableSeleccionada.value || !respuestaSeleccionada.value)
    return []

  const varId = variableSeleccionada.value.indice_variable
  const respVal = respuestaSeleccionada.value

  const resultados = clases.map((claseItem) => {
    const respuestasVariableClase = props.respuestasClase.filter(
      (r) => Number(r.clase) === Number(claseItem.id) && r.indice_variable === varId,
    )

    const respuestasOpcionEspecifica = respuestasVariableClase.filter(
      (r) => String(r.respuesta_v2) === String(respVal),
    )

    const sumaTotalVariable = respuestasVariableClase.reduce(
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
      codigo: claseItem.id,
      nombre: claseItem.nombre,
      suma_factor: sumaRespuestaEspecifica,
      suma_factor_total: sumaTotalVariable,
      porcentaje: porcentaje,
    }
  })

  return resultados
})

onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el))
})
</script>

<template>
  <div class="clases-view">
    <section class="section-filters mb-4 px-1">
      <div class="row g-3 align-items-center">
        <div class="col-12">
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
                title="Selecciona la variable de análisis para comparar entre clases"
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

    <div class="sub-view-container">
      <div class="row g-4 justify-content-center mb-4">
        <div class="col-lg-8">
          <ClaseChart
            :preguntaSeleccionada="preguntaSeleccionada"
            :variableSeleccionada="variableSeleccionada"
            :respuestaSeleccionada="respuestaSeleccionada"
            :tablaAgrupada="tablaAgrupada"
            :loading="loading"
          />
        </div>
      </div>

      <ClaseTable
        :tablaAgrupada="tablaAgrupada"
        :loading="loading"
        :respuestaSeleccionada="respuestaSeleccionada"
      />
    </div>
  </div>
</template>

<style scoped>
.clases-view {
  animation: fadeIn 0.4s ease-out;
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
