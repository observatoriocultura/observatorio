<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  error: { type: String, required: true },
})

const emit = defineEmits(['retry'])
const percentFormatter = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  maximumFractionDigits: 1,
})
const minutesFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

const sortableColumns = [
  { key: 'completed', label: 'Realizados', status: 'Sí' },
  { key: 'missed', label: 'No realizados', status: 'No' },
  { key: 'compliance', label: 'Cumplimiento' },
  { key: 'hora_promedio', label: 'Hora promedio' },
  { key: 'horas_validas', label: 'Con hora válida' },
  { key: 'desviacion_estandar_aviso', label: 'Desviación estándar (min)' },
  { key: 'cantidad_avisos_cumple_franja', label: 'Avisos dentro de la franja' },
  { key: 'porcentaje_avisos_cumple_franja', label: '% dentro de la franja' },
]
const sortIcons = { ascending: 'bi-arrow-up', descending: 'bi-arrow-down' }
const sortKey = ref('compliance')
const sortDirection = ref('descending')

const sortBy = (key) => {
  const wasAscending = sortKey.value === key && sortDirection.value === 'ascending'
  sortKey.value = key
  sortDirection.value = wasAscending ? 'descending' : 'ascending'
}

const roundedClockMinutes = (minutes) => Math.round(minutes) % (24 * 60)

const getPercentClass = (value) => {
  if (value === null) return ''
  const percentage = Math.round(value * 1000) / 10
  if (percentage < 50) return 'percent-low'
  if (percentage < 80) return 'percent-medium'
  return 'percent-high'
}

const getClockClass = (value) => {
  if (value === null) return ''
  const hour = roundedClockMinutes(value) / 60
  if (hour < 6 || hour >= 18) return 'clock-night'
  if (hour < 12) return 'clock-morning'
  return 'clock-afternoon'
}

const sortedRows = computed(() => {
  const key = sortKey.value
  const direction = sortDirection.value === 'ascending' ? 1 : -1

  const valueForSort = (row) => {
    const value = row[key]
    return key === 'hora_promedio' && value !== null ? roundedClockMinutes(value) : value
  }

  return [...props.rows].sort((a, b) => {
    const first = valueForSort(a)
    const second = valueForSort(b)

    if (first === second) return a.name.localeCompare(b.name, 'es-CO')
    if (first === null) return 1
    if (second === null) return -1
    return (first - second) * direction
  })
})

const formatClockTime = (minutes) => {
  const rounded = roundedClockMinutes(minutes)
  const hours = Math.floor(rounded / 60)
  return `${String(hours).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`
}
</script>

<template>
  <section class="compliance-card" aria-labelledby="barrios-compliance-title">
    <header class="compliance-header">
      <h2 id="barrios-compliance-title">Cumplimiento de avisos</h2>
      <p id="barrios-compliance-description">
        Resultados por barrio para el periodo seleccionado. El cumplimiento de avisos se calcula
        sobre los registros marcados como Sí o No. La hora promedio y la desviación usan los avisos
        realizados con hora válida. Una desviación menor indica mayor constancia. El porcentaje
        dentro de la franja se calcula sobre todos los avisos realizados.
      </p>
      <div v-if="!loading && !error && rows.length" class="color-keys">
        <div class="color-key">
          <strong>Porcentajes</strong>
          <span class="percent-low">Bajo (&lt;50 %)</span>
          <span class="percent-medium">Medio (50 a &lt;80 %)</span>
          <span class="percent-high">Alto (≥80 %)</span>
        </div>
        <div class="color-key">
          <strong>Hora promedio</strong>
          <span class="clock-morning">Mañana (06:00–11:59)</span>
          <span class="clock-afternoon">Tarde (12:00–17:59)</span>
          <span class="clock-night">Noche (18:00–05:59)</span>
        </div>
      </div>
    </header>

    <p v-if="loading" class="table-message" role="status">Cargando comparativa de barrios…</p>
    <div v-else-if="error" class="table-message">
      <p class="error-text" role="alert">{{ error }}</p>
      <button type="button" class="retry-button" @click="emit('retry')">Reintentar</button>
    </div>
    <p v-else-if="rows.length === 0" class="table-message">
      No hay barrios para comparar en el periodo seleccionado.
    </p>

    <div
      v-else
      class="table-scroll"
      role="region"
      aria-labelledby="barrios-compliance-title"
      tabindex="0"
    >
      <table aria-describedby="barrios-compliance-description">
        <thead>
          <tr>
            <th scope="col">Barrio</th>
            <th
              v-for="column in sortableColumns"
              :key="column.key"
              scope="col"
              :class="column.key === 'compliance' ? 'compliance-column' : 'count'"
              :aria-sort="sortKey === column.key ? sortDirection : undefined"
            >
              <button type="button" class="sort-button" @click="sortBy(column.key)">
                <span>
                  {{ column.label }}
                  <span
                    v-if="column.status"
                    :class="column.key === 'completed' ? 'yes-label' : 'no-label'"
                  >
                    ({{ column.status }})
                  </span>
                </span>
                <i
                  class="bi"
                  :class="sortKey === column.key ? sortIcons[sortDirection] : 'bi-arrow-down-up'"
                  aria-hidden="true"
                ></i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedRows" :key="row.key">
            <th scope="row">{{ row.name }}</th>
            <td class="count">{{ row.completed }}</td>
            <td class="count">{{ row.missed }}</td>
            <td :class="getPercentClass(row.compliance)">
              <div v-if="row.compliance !== null" class="compliance-value">
                <span class="compliance-bar" aria-hidden="true">
                  <span :style="{ width: `${row.compliance * 100}%` }"></span>
                </span>
                <span class="count">{{ percentFormatter.format(row.compliance) }}</span>
              </div>
              <span v-else class="empty-value">Sin avisos evaluables</span>
            </td>
            <td class="count" :class="getClockClass(row.hora_promedio)">
              <span v-if="row.hora_promedio !== null">{{
                formatClockTime(row.hora_promedio)
              }}</span>
              <span v-else class="empty-value">Sin dato</span>
            </td>
            <td class="count">{{ row.horas_validas }}</td>
            <td class="count">
              <span v-if="row.desviacion_estandar_aviso !== null">
                {{ minutesFormatter.format(row.desviacion_estandar_aviso) }}
              </span>
            </td>
            <td class="count">{{ row.cantidad_avisos_cumple_franja }}</td>
            <td class="count" :class="getPercentClass(row.porcentaje_avisos_cumple_franja)">
              <span v-if="row.porcentaje_avisos_cumple_franja !== null">
                {{ percentFormatter.format(row.porcentaje_avisos_cumple_franja) }}
              </span>
              <span v-else class="empty-value">Sin avisos realizados</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.compliance-card {
  overflow: hidden;
  border: 1px solid #dfe5e1;
  border-radius: 16px;
  background: #fff;
}

.compliance-header {
  padding: 1.05rem 1.25rem;
}

.compliance-header h2 {
  margin: 0 0 0.35rem;
  color: #1e2923;
  font-size: clamp(1.3rem, 2.5vw, 1.65rem);
  font-weight: 800;
}

.compliance-header p,
.table-message,
.empty-value {
  color: #56665d;
}

.compliance-header p,
.table-message p {
  margin: 0;
}

.color-keys,
.color-key {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.color-keys {
  gap: 0.5rem 1.25rem;
  margin-top: 0.6rem;
}

.color-key {
  gap: 0.35rem;
  font-size: 0.75rem;
}

.color-key span {
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.table-message {
  margin: 0;
  padding: 0 1.25rem 1.05rem;
}

.error-text {
  color: #a03636;
}

.retry-button {
  margin-top: 0.75rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid #276a3e;
  border-radius: 8px;
  color: #276a3e;
  background: #fff;
  font-weight: 700;
}

.table-scroll {
  overflow-x: auto;
}

.table-scroll:focus-visible {
  outline: 2px solid #276a3e;
  outline-offset: -2px;
}

table {
  width: 100%;
  min-width: 69rem;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 0.45rem 0.85rem;
  text-align: left;
}

thead {
  color: #33493b;
  background: #f0f7f2;
}

thead th {
  padding-block: 0.7rem;
}

tbody tr {
  border-top: 1px solid #e7ebe8;
}

.count {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: inherit;
}

.sort-button:hover {
  color: #276a3e;
  text-decoration: underline;
}

.sort-button:focus-visible {
  outline: 2px solid #276a3e;
  outline-offset: 3px;
}

.yes-label {
  color: #276a3e;
}

.no-label {
  color: #a03636;
}

.percent-low {
  background: #fde8ed;
}

.percent-medium {
  background: #fff3cd;
}

.percent-high {
  background: #e4f4e9;
}

.clock-morning {
  background: #dff3fe;
}

.clock-afternoon {
  background: #f1e7fa;
}

.clock-night {
  color: #fff;
  background: #203b68;
}

.compliance-column {
  width: 16rem;
}

.compliance-value {
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) 4.25rem;
  align-items: center;
  gap: 0.5rem;
}

.compliance-bar {
  display: block;
  height: 0.8rem;
  overflow: hidden;
  border-radius: 999px;
  background: #f4acba;
}

.compliance-bar span {
  display: block;
  height: 100%;
  background: #317449;
}
</style>
