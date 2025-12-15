<template>
  <div>
    <h2>Resultados</h2>
    <h3>Fase 2 - Momento 1</h3>

    <div class="row">
      <div class="col-md-4">
        <!-- SECCIÓN DE FILTROS -->
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
      <div class="col-md-8">
        <p class="text-center">
          <strong class="text-primary">{{ resultadosFiltrados.length }}</strong> conclusiones
          &middot; de {{ resultados.length }} en total
        </p>

        <!-- DETALLE DE CADA CONCLUSIÓN -->
        <div
          v-for="item in resultadosFiltrados"
          :key="item.id_registro"
          class="mb-5 border-bottom pb-3"
        >
          <!-- TEXTO CONCLUSIÓN -->
          <div class="row">
            <div class="col-md-2">Conclusión</div>
            <div class="col-md-10">
              <p>
                {{ item.conclusion }}
              </p>
            </div>
          </div>
          <!-- SENTIMIENTO -->
          <div class="row">
            <div class="col-md-2">
              <span>Sentimiento:</span>
            </div>
            <div class="col-md-3">
              <span class="sentimiento">
                {{ item.sentimiento }}
              </span>
            </div>
            <div class="col-md-7">
              <div class="progress">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: `${intPercent(item.score_sentimiento)}%` }"
                  :aria-valuenow="intPercent(item.score_sentimiento)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {{ item.score_sentimiento }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const encuentros = ref([])
const resultados = ref([])
const encuentroSeleccionado = ref('') // 👈 Inicializar vacío o con null

// Funciones
//-----------------------------------------------------------------------------

function mostrarSeleccion() {
  console.log(`Valor seleccionado: ${encuentroSeleccionado.value}`) // Cambiar alert por console.log para debugging
}

// Devuelve el valor del porcentaje como numero entero
function intPercent(value) {
  return Math.round(value * 100)
}

// On Mounted
//-----------------------------------------------------------------------------
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
