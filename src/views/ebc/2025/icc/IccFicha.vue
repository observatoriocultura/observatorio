<script setup>
import { ref, onMounted, inject } from 'vue'

const codigoMedicion = inject('codigoMedicion')
const fichaTecnica = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL
    const response = await fetch(
      `${baseUrl}content/mediciones/${codigoMedicion}/ficha_tecnica.json`,
    )
    if (!response.ok) throw new Error('No se pudo cargar la ficha técnica')
    fichaTecnica.value = await response.json()
  } catch (e) {
    console.error('Error cargando ficha técnica:', e)
  } finally {
    loading.value = false
  }
})

const formatValor = (valor) => {
  if (valor === null || valor === undefined) return 'N/A'
  if (typeof valor === 'number') return valor.toLocaleString()
  return valor
}
</script>

<template>
  <div class="icc-ficha container">
    <div class="ficha-content">
      <div v-if="loading" class="loading-state">Cargando ficha técnica...</div>

      <div v-else-if="fichaTecnica.length > 0" class="ficha-table">
        <div
          v-for="item in fichaTecnica"
          :key="item.num"
          class="ficha-row"
          :class="{ 'nivel-2': item.nivel === 2 }"
        >
          <div class="ficha-label">{{ item.variable }}</div>
          <div class="ficha-value">{{ formatValor(item.valor) }}</div>
        </div>
      </div>

      <div v-else class="error-state">No se encontró información de la ficha técnica.</div>
    </div>
  </div>
</template>

<style scoped>
.ficha-content h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #32204a;
  margin-bottom: 2rem;
}

.ficha-table {
  max-width: 750px;
  margin: 0 auto;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  overflow: hidden;
}

.ficha-row {
  display: grid;
  grid-template-columns: 250px 1fr;
  border-bottom: 1px solid #eef0f2;
}

.ficha-row:last-child {
  border-bottom: none;
}

.ficha-row.nivel-2 .ficha-label {
  padding-left: 2rem;
  font-weight: 500;
  font-style: italic;
}

.ficha-label {
  padding: 0.75rem 1rem;
  background: #f9f9fb;
  font-weight: 700;
  color: #5c6972;
  font-size: 0.9rem;
}

.ficha-value {
  padding: 0.75rem 1rem;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.loading-state,
.error-state {
  padding: 2rem;
  text-align: center;
  color: #5c6972;
  background: #f9f9fb;
  border-radius: 12px;
}

@media (max-width: 600px) {
  .ficha-row {
    grid-template-columns: 1fr;
  }
  .ficha-label {
    background: #f2f3f5;
    padding: 0.5rem 1rem;
  }
  .ficha-row.nivel-2 .ficha-label {
    padding-left: 1rem;
  }
}
</style>
