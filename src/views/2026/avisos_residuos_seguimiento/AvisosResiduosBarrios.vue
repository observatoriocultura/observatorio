<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AvisosResiduosBarriosGrafico from './AvisosResiduosBarriosGrafico.vue'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  error: { type: String, required: true },
})

const emit = defineEmits(['retry'])
const route = useRoute()

const getBarrioLocation = (barrioKey) => ({
  path: route.path,
  query: { ...route.query, tab: 'por-barrio', barrio: barrioKey },
  hash: route.hash,
})

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
const sortIcons = { ascending: 'bi-caret-up-fill', descending: 'bi-caret-down-fill' }
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
  <AvisosResiduosBarriosGrafico v-if="!loading && !error && rows.length" :rows="rows" />

  <section class="compliance-card avisos-panel" aria-labelledby="barrios-compliance-title">
    <header class="avisos-panel-header">
      <div>
        <h2 id="barrios-compliance-title" class="avisos-panel-title">Indicadores por barrio</h2>
        <p id="barrios-compliance-description" class="avisos-panel-description">
          Ordena los indicadores desde los encabezados o abre el detalle mensual de un barrio.
        </p>
      </div>
      <details v-if="!loading && !error && rows.length" class="indicator-guide">
        <summary>Cómo se calculan</summary>
        <p class="avisos-note">
          El cumplimiento usa los registros marcados como Sí o No. La hora promedio y la desviación
          usan los avisos realizados con hora válida. Una desviación menor indica mayor constancia.
          El porcentaje dentro de la franja se calcula sobre todos los avisos realizados.
        </p>
      </details>
    </header>

    <p v-if="loading" class="avisos-state" role="status">Cargando comparativa de barrios…</p>
    <div v-else-if="error" class="avisos-state">
      <p role="alert">{{ error }}</p>
      <button type="button" class="avisos-button" @click="emit('retry')">Reintentar</button>
    </div>
    <p v-else-if="rows.length === 0" class="avisos-state">
      No hay barrios para comparar en el periodo seleccionado.
    </p>

    <template v-else>
      <div class="color-keys">
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
      <div
        class="table-scroll avisos-scroll"
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
                    class="bi sort-icon"
                    :class="sortKey === column.key ? sortIcons[sortDirection] : 'bi-chevron-expand'"
                    aria-hidden="true"
                  ></i>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedRows" :key="row.key">
              <th scope="row">
                <RouterLink
                  class="barrio-link"
                  :to="getBarrioLocation(row.key)"
                  aria-current-value="false"
                >
                  {{ row.name }}
                </RouterLink>
              </th>
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
    </template>
  </section>
</template>

<style scoped>
.indicator-guide {
  color: var(--avisos-green-text);
  font-size: 0.8rem;
}

.indicator-guide summary {
  padding: 0.35rem 0;
  font-weight: 750;
  cursor: pointer;
}

.indicator-guide p {
  max-width: 48rem;
}

.color-keys,
.color-key {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.color-keys {
  gap: 0.5rem 1.25rem;
  padding: 0.55rem var(--avisos-panel-padding);
}

.color-key {
  gap: 0.35rem;
  font-size: 0.75rem;
}

.color-key span {
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.empty-value {
  color: var(--avisos-muted);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 69rem;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.87rem;
}

th,
td {
  padding: 0.45rem 0.85rem;
  border-top: 1px solid var(--avisos-divider);
  text-align: left;
}

thead {
  color: var(--avisos-ink);
  background: var(--avisos-soft);
}

thead th {
  padding-block: 0.7rem;
  font-size: 0.82rem;
  line-height: 1.35;
}

thead th:first-child,
tbody th[scope='row'] {
  position: sticky;
  left: 0;
  z-index: 1;
  width: clamp(9rem, 16vw, 13rem);
  box-shadow: 1px 0 var(--avisos-divider);
}

thead th:first-child {
  background: var(--avisos-soft);
}

tbody th[scope='row'] {
  background: var(--avisos-surface);
}

th[aria-sort] {
  background: var(--avisos-green-soft);
}

.count {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.barrio-link {
  display: inline-block;
  padding: 0.12rem 0.45rem;
  border-radius: 6px;
  color: var(--avisos-green-text);
  background: var(--avisos-soft);
  text-decoration: none;
  transition: background-color 140ms ease;
}

.barrio-link:hover {
  color: var(--avisos-green-text);
  background: var(--avisos-green-soft);
}

.barrio-link:focus-visible {
  outline: 2px solid var(--avisos-green);
  outline-offset: 2px;
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
  color: var(--avisos-green-text);
  text-decoration: underline;
}

.sort-button:focus-visible {
  outline: 2px solid var(--avisos-green);
  outline-offset: 3px;
}

.sort-icon {
  flex: none;
  color: #62726a;
  font-size: 0.75rem;
}

th[aria-sort] .sort-icon {
  color: var(--avisos-green);
}

.yes-label {
  color: var(--avisos-green-text);
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
  background: var(--avisos-green);
}
</style>
