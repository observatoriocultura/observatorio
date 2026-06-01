<template>
  <section class="notas-view" aria-label="Notas del Plan Anual de Investigaciones">
    <div v-if="notas.length > 0" class="notas-table-wrapper">
      <table class="table table-sm table-hover align-middle notas-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column" scope="col">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(nota, index) in notas" :key="index">
            <td v-for="column in columns" :key="column">
              {{ nota[column] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="notas-empty">
      <p>No hay notas registradas para esta vigencia.</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notas: {
    type: Array,
    default: () => [],
  },
})

const columns = computed(() => {
  const columnSet = new Set()

  props.notas.forEach((nota) => {
    Object.keys(nota ?? {}).forEach((key) => columnSet.add(key))
  })

  return Array.from(columnSet)
})
</script>

<style scoped>
.notas-view {
  width: 100%;
}

.notas-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  background-color: #fff;
}

.notas-table {
  min-width: 48rem;
  margin-bottom: 0;
}

.notas-table th {
  color: #495057;
  font-size: 0.75rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.notas-table td {
  color: #212529;
  font-size: 0.85rem;
}

.notas-empty {
  border: 1px dashed #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
  color: #6c757d;
}

.notas-empty p {
  margin: 0;
}
</style>
