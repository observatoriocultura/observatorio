<script setup>
defineProps({
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
})
</script>

<template>
  <div id="debug-tables" class="mt-4">
    <h6 class="text-uppercase text-muted small fw-bold mb-3">
      Variables (Suma Máxima: {{ sumatoriaFactor.toFixed(2) }})
    </h6>
    <table class="table table-sm table-bordered small mb-4">
      <thead class="bg-light">
        <tr>
          <th class="text-center">indice_variable</th>
          <th>codigo_variable</th>
          <th>enunciado_2</th>
          <th>unidad_medida</th>
          <th class="text-end">suma_factor (total)</th>
          <th class="text-end">promedio_ponderado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="variable in variablesFiltradas" :key="variable.codigo_variable">
          <td class="text-center">{{ variable.indice_variable }}</td>
          <td>
            <code>{{ variable.codigo_variable }}</code>
          </td>
          <td>{{ variable.enunciado_2 }}</td>
          <td>
            <span class="text-muted">{{ variable.unidad_medida }}</span>
          </td>
          <td class="text-end fw-bold text-primary font-monospace">
            {{ variable.suma_factor.toFixed(2) }}
          </td>
          <td class="text-end fw-bold text-success font-monospace">
            {{
              variable.promedio_ponderado !== null
                ? variable.promedio_ponderado.toFixed(2)
                : '-'
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <h6 class="text-uppercase text-muted small fw-bold mb-3">RESPUESTAS</h6>
    <table class="table table-sm table-bordered small">
      <thead class="bg-light">
        <tr>
          <th>codigo_variable</th>
          <th class="text-center">indice_variable</th>
          <th class="text-center">respuesta</th>
          <th class="text-center">respuesta_v2</th>
          <th class="text-end">suma_factor</th>
          <th class="text-end">porcentaje</th>
          <th class="text-end">cantidad_respuestas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(resp, index) in respuestasPregunta" :key="index">
          <td>
            <code>{{ resp.codigo_variable }}</code>
          </td>
          <td class="text-center">{{ resp.indice_variable }}</td>
          <td class="text-start">{{ resp.respuesta }}</td>
          <td class="text-start">{{ resp.respuesta_v2 }}</td>
          <td class="text-end font-monospace">{{ resp.suma_factor.toFixed(2) }}</td>
          <td class="text-end font-monospace text-success">
            {{ resp.porcentaje.toFixed(1) }}%
          </td>
          <td class="text-end">{{ resp.cantidad_respuestas }}</td>
        </tr>
        <tr v-if="respuestasPregunta.length === 0">
          <td colspan="7" class="text-center py-3 text-muted">No entries found</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
#debug-tables .table {
  font-size: 0.78rem;
}

#debug-tables code {
  font-size: 0.75rem;
  color: #5f4481;
}
</style>
