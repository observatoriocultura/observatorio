<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  datosPorLocalidad: { type: Array, default: () => [] },
  indices: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  iccData: { type: Array, default: () => [] },
})

const selectedYear = ref(2025)
const years = [2021, 2023, 2025]

/**
 * Encabezados de columna: Índice General (cod=0) primero, luego subíndices
 */
const columns = computed(() => {
  // Ordenar para dejar el índice general al principio si existe
  return [...props.indices].sort((a, b) => {
    if (a.cod === 0) return -1
    if (b.cod === 0) return 1
    return a.cod - b.cod
  })
})

/**
 * Filas de la tabla: Incluye Bogotá (Total) y luego las localidades ordenadas
 */
const rows = computed(() => {
  // Definimos la fila de Bogotá (Total)
  const bogota = { cod: 22, nombre: 'Bogotá (Total)' }
  
  // Filtramos la lista original para evitar duplicar a Bogotá si ya viene en las localidades
  const localesSinBogota = props.localidades.filter((l) => Number(l.cod) !== 22)
  const sortedLocalidades = [...localesSinBogota].sort((a, b) => a.nombre.localeCompare(b.nombre))
  
  return [bogota, ...sortedLocalidades]
})

/**
 * Helper para obtener el valor de una celda específica
 */
const getCellValue = (locCod, indiceCod) => {
  const registro = props.iccData.find(
    (d) => d.localidad_cod === locCod && d.indice_cod === indiceCod && d.año === selectedYear.value
  )
  return registro ? registro.valor.toFixed(3) : '-'
}

/**
 * Helper para determinar el color de fondo de la celda según el valor (Mapa de calor)
 * Bajos: #F0ACAC | Medios: #FEF1C5 | Altos: #DBEDD8
 */
const getCellBg = (val) => {
  if (val === '-') return 'transparent'
  const num = parseFloat(val)

  // Definición de puntos de color (RGB)
  const colors = {
    low: [240, 172, 172], // #F0ACAC
    mid: [254, 241, 197], // #FEF1C5
    high: [219, 237, 216], // #DBEDD8
  }

  let r, g, b
  if (num <= 0.5) {
    const t = num * 2
    r = Math.round(colors.low[0] + (colors.mid[0] - colors.low[0]) * t)
    g = Math.round(colors.low[1] + (colors.mid[1] - colors.low[1]) * t)
    b = Math.round(colors.low[2] + (colors.mid[2] - colors.low[2]) * t)
  } else {
    const t = (num - 0.5) * 2
    r = Math.round(colors.mid[0] + (colors.high[0] - colors.mid[0]) * t)
    g = Math.round(colors.mid[1] + (colors.high[1] - colors.mid[1]) * t)
    b = Math.round(colors.mid[2] + (colors.high[2] - colors.mid[2]) * t)
  }

  return `rgb(${r}, ${g}, ${b})`
}
</script>

<template>
  <div class="indice-localidades">
    <!-- Selector de Años -->
    <div class="year-selector-container mb-4">
      <div class="btn-group" role="group" aria-label="Selector de años">
        <button 
          v-for="year in years" 
          :key="year"
          type="button" 
          class="btn"
          :class="selectedYear === year ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedYear = year"
        >
          {{ year }}
        </button>
      </div>
    </div>

    <!-- Tabla Matriz -->
    <div class="table-responsive shadow-sm rounded bg-white p-3">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th scope="col" class="sticky-col first-col">Localidad</th>
            <th 
              v-for="col in columns" 
              :key="col.cod" 
              scope="col" 
              class="text-center cell-header"
              :class="{ 'font-bold underline': col.cod === 0 }"
            >
              {{ col.nombre_corto || col.nombre }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="row in rows" 
            :key="row.cod"
            :class="{ 'row-total': row.cod === 22 }"
          >
            <th scope="row" class="sticky-col first-col">{{ row.nombre }}</th>
            <td 
              v-for="col in columns" 
              :key="col.cod"
              class="text-center value-cell"
              :style="{ backgroundColor: getCellBg(getCellValue(row.cod, col.cod)) }"
            >
              <span :class="{ 'fw-bold': col.cod === 0 }">
                {{ getCellValue(row.cod, col.cod) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.indice-localidades {
  padding: 1rem;
}

.year-selector-container {
  display: flex;
  justify-content: center;
}

.btn-group .btn {
  padding: 0.5rem 2rem;
  font-weight: 600;
  border-radius: 8px;
  margin: 0 5px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #654096;
  border-color: #654096;
}

.btn-outline-primary {
  color: #654096;
  border-color: #654096;
}

.btn-outline-primary:hover {
  background-color: #654096;
  color: white;
}

.table {
  font-size: 0.9rem;
  border-collapse: separate;
  border-spacing: 0;
}

.table th, .table td {
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.cell-header {
  min-width: 120px;
  max-width: 150px;
  vertical-align: middle;
  line-height: 1.2;
  font-size: 0.85rem;
  color: #495057;
}

.sticky-col {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
}

.first-col {
  min-width: 180px;
  text-align: left;
  font-weight: 600;
}

.value-cell {
  transition: transform 0.2s;
}

.value-cell:hover {
  transform: scale(1.05);
  cursor: default;
  z-index: 5;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.fw-bold {
  font-weight: 700;
}

.row-total {
  font-size: 0.95rem;
}

.row-total th, .row-total td {
  border-bottom: 2px solid #6c757d !important;
}

.row-total .sticky-col {
  background-color: #f8f9fa;
}

/* Zebra striping for sticky column manually because of z-index */
tr:nth-of-type(even) .sticky-col {
  background-color: #f8f9fa;
}

.table-hover tbody tr:hover .sticky-col {
  background-color: #e9ecef;
}
</style>
