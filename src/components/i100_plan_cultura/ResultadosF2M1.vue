<template>
  <div>
    <h2>Resultados</h2>
    <h3>Fase 2 - Momento 1</h3>
    <div class="mb-3">
      <div class="row">
        <div class="col-md-6">
          <label for="encuentroSelect" class="form-label">Filtrar por encuentro:</label>
          <select
            id="encuentroSelect"
            class="form-select"
            v-model="encuentroSeleccionado"
            @change="mostrarSeleccion"
          >
            <option value="">Todos</option>
            <option v-for="e in encuentros" :key="e.id_encuentros" :value="String(e.id_encuentros)">
              {{ e.detalle }}
            </option>
          </select>
        </div>
        <div class="col-md-6 text-end">
          <p>Encuentro: {{ encuentroSeleccionado }}</p>
        </div>
      </div>
    </div>
    <p class="text-center">
      <span class="badge bg-primary">{{ resultadosFiltrados.length }}</span> conclusiones &middot;
      de {{ resultados.length }} en total
    </p>
    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Conclusión</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in resultadosFiltrados" :key="item.id_registro">
          <td>{{ item.id_registro }}</td>
          <td>{{ item.conclusion }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const encuentros = ref([])
const resultados = ref([])
const encuentroSeleccionado = ref('') // 👈 Inicializar vacío o con null

function mostrarSeleccion() {
  console.log(`Valor seleccionado: ${encuentroSeleccionado.value}`) // Cambiar alert por console.log para debugging
}

onMounted(async () => {
  try {
    const res = await fetch(
      `${import.meta.env.BASE_URL}content/2025/projects/i100_plan_cultura/encuentros.json`,
    )
    encuentros.value = await res.json()
    const res2 = await fetch(
      `${import.meta.env.BASE_URL}content/2025/projects/i100_plan_cultura/resultados_f2_m1.json`,
    )
    resultados.value = await res2.json()
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

const resultadosFiltrados = computed(() => {
  if (!encuentroSeleccionado.value) return resultados.value
  return resultados.value.filter(
    (r) => String(r.id_encuentros) === String(encuentroSeleccionado.value),
  )
})
</script>
