<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  avisos: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DATE_SEPARATOR = '\u0000'
const matrixScroll = ref(null)
const activeCell = ref({ row: 0, column: 0 })
const selectedCell = ref(null)
const cellElements = new Map()
const tooltip = ref({
  visible: false,
  cell: null,
  x: 0,
  y: 0,
  below: false,
})

const longDateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const monthFormatter = new Intl.DateTimeFormat('es-CO', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const parseSheetDate = (value) => {
  const match = String(value ?? '')
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (!match) return null

  const [, day, month, year] = match
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day))
  const parsedDate = new Date(timestamp)

  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return null
  }

  return timestamp
}

const timestampToIso = (timestamp) => new Date(timestamp).toISOString().slice(0, 10)

const normalizeState = (value) => {
  const original = String(value ?? '').trim()
  const normalized = original
    .toLocaleLowerCase('es-CO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (normalized === 'si') {
    return { key: 'yes', value: 2, label: 'Sí se realizó', shortLabel: 'Sí' }
  }

  if (normalized === 'no') {
    return { key: 'no', value: 1, label: 'No se realizó', shortLabel: 'No' }
  }

  if (!normalized || /^[-–—]$/.test(original)) {
    return {
      key: 'not-expected',
      value: 0,
      label: 'No se esperaba aviso',
      shortLabel: 'No programado',
    }
  }

  return {
    key: 'missing',
    value: null,
    label: 'Estado sin información válida',
    shortLabel: 'Sin información',
  }
}

const normalizedAvisos = computed(() =>
  props.avisos
    .map((aviso) => {
      const barrio = String(aviso.barrio ?? '').trim()
      const timestamp = parseSheetDate(aviso.fecha)

      if (!barrio || timestamp === null) return null

      return {
        ...aviso,
        barrio,
        timestamp,
        dateIso: timestampToIso(timestamp),
        state: normalizeState(aviso.estado_aviso),
      }
    })
    .filter(Boolean),
)

const barrios = computed(() => [...new Set(normalizedAvisos.value.map((aviso) => aviso.barrio))])

const dates = computed(() => {
  const sourceDates = normalizedAvisos.value.map((aviso) => aviso.timestamp)
  if (!sourceDates.length) return []

  const min = Math.min(...sourceDates)
  const max = Math.max(...sourceDates)
  const result = []

  for (let timestamp = min; timestamp <= max; timestamp += DAY_IN_MS) {
    result.push({
      timestamp,
      iso: timestampToIso(timestamp),
      label: longDateFormatter.format(new Date(timestamp)),
    })
  }

  return result
})

const monthGroups = computed(() => {
  const groups = []

  dates.value.forEach((date, index) => {
    const parsedDate = new Date(date.timestamp)
    const key = `${parsedDate.getUTCFullYear()}-${parsedDate.getUTCMonth()}`
    const currentGroup = groups.at(-1)

    if (currentGroup?.key === key) {
      currentGroup.span += 1
      return
    }

    groups.push({
      key,
      start: index + 1,
      span: 1,
      label: monthFormatter.format(parsedDate).replace('.', ''),
    })
  })

  return groups
})

const avisoByCell = computed(
  () =>
    new Map(
      normalizedAvisos.value.map((aviso) => [
        `${aviso.barrio}${DATE_SEPARATOR}${aviso.dateIso}`,
        aviso,
      ]),
    ),
)

const missingState = {
  key: 'missing',
  value: null,
  label: 'Sin registro',
  shortLabel: 'Sin registro',
}

const gridRows = computed(() =>
  barrios.value.map((barrio, rowIndex) => ({
    barrio,
    rowIndex,
    cells: dates.value.map((date, columnIndex) => {
      const aviso = avisoByCell.value.get(`${barrio}${DATE_SEPARATOR}${date.iso}`)

      return {
        key: `${barrio}${DATE_SEPARATOR}${date.iso}`,
        barrio,
        rowIndex,
        columnIndex,
        date,
        aviso: aviso ?? null,
        state: aviso?.state ?? missingState,
      }
    }),
  })),
)

const summary = computed(() => {
  const values = normalizedAvisos.value.map((aviso) => aviso.state.value)
  const completed = values.filter((value) => value === 2).length
  const missed = values.filter((value) => value === 1).length
  const expected = completed + missed

  return {
    completed,
    missed,
    notScheduled: values.filter((value) => value === 0).length,
    compliance: expected > 0 ? Math.round((completed / expected) * 100) : 0,
  }
})

const dateGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${dates.value.length}, var(--cell-size))`,
}))

const formatCellAriaLabel = (cell) => {
  const details = [
    cell.barrio,
    cell.date.label,
    cell.state.label,
    cell.aviso?.hora_aviso ? `hora ${cell.aviso.hora_aviso}` : '',
    cell.aviso?.control ? `control ${cell.aviso.control}` : '',
    cell.aviso?.notas ? `notas ${cell.aviso.notas}` : '',
  ].filter(Boolean)

  return details.join('. ')
}

const cellElementKey = (row, column) => `${row}:${column}`

const setCellElement = (row, column, element) => {
  const key = cellElementKey(row, column)
  if (element) cellElements.set(key, element)
  else cellElements.delete(key)
}

const isActiveCell = (row, column) =>
  activeCell.value.row === row && activeCell.value.column === column

const isSelectedCell = (cell) => selectedCell.value?.key === cell.key

const showTooltip = (cell, event) => {
  const bounds = event.currentTarget.getBoundingClientRect()
  const below = bounds.top < 170

  tooltip.value = {
    visible: true,
    cell,
    x: Math.min(Math.max(bounds.left + bounds.width / 2, 150), window.innerWidth - 150),
    y: below ? bounds.bottom + 10 : bounds.top - 10,
    below,
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

const selectCell = (cell, event) => {
  selectedCell.value = cell
  activeCell.value = { row: cell.rowIndex, column: cell.columnIndex }
  showTooltip(cell, event)
}

const focusCell = async (row, column) => {
  const nextRow = Math.min(Math.max(row, 0), gridRows.value.length - 1)
  const nextColumn = Math.min(Math.max(column, 0), dates.value.length - 1)

  activeCell.value = { row: nextRow, column: nextColumn }
  await nextTick()

  const element = cellElements.get(cellElementKey(nextRow, nextColumn))
  element?.focus({ preventScroll: true })
  element?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

const handleCellKeydown = (event, cell) => {
  const movements = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
  }

  if (movements[event.key]) {
    event.preventDefault()
    const [rowOffset, columnOffset] = movements[event.key]
    void focusCell(cell.rowIndex + rowOffset, cell.columnIndex + columnOffset)
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    void focusCell(cell.rowIndex, event.key === 'Home' ? 0 : dates.value.length - 1)
  }
}

const hideTooltipOnScroll = () => hideTooltip()

watch(
  () => props.avisos,
  () => {
    activeCell.value = { row: 0, column: 0 }
    selectedCell.value = null
    cellElements.clear()
    hideTooltip()
  },
)
</script>

<template>
  <section class="dataviz-card" aria-labelledby="avisos-dataviz-title">
    <header class="dataviz-header">
      <div>
        <p class="section-kicker">Visualización temporal</p>
        <h2 id="avisos-dataviz-title">Cumplimiento de avisos por barrio</h2>
        <p>Cada celda representa el estado del aviso para un barrio en una fecha determinada.</p>
      </div>

      <div v-if="normalizedAvisos.length" class="metrics" aria-label="Resumen de avisos">
        <article>
          <span>Cumplimiento</span>
          <strong>{{ summary.compliance }}%</strong>
        </article>
        <article>
          <span>Realizados</span>
          <strong>{{ summary.completed }}</strong>
        </article>
        <article class="metric--alert">
          <span>No realizados</span>
          <strong>{{ summary.missed }}</strong>
        </article>
        <article>
          <span>No programados</span>
          <strong>{{ summary.notScheduled }}</strong>
        </article>
      </div>
    </header>

    <div v-if="loading" class="dataviz-state" role="status">
      <span class="dataviz-spinner" aria-hidden="true"></span>
      Preparando visualización…
    </div>

    <div v-else-if="error" class="dataviz-state dataviz-state--error" role="alert">
      La visualización estará disponible cuando se puedan cargar los avisos.
    </div>

    <div v-else-if="normalizedAvisos.length === 0" class="dataviz-state">
      No hay avisos con barrio y fecha válidos para visualizar.
    </div>

    <div v-else class="matrix-region">
      <div
        ref="matrixScroll"
        class="matrix-scroll"
        aria-label="Matriz temporal de avisos por barrio"
        @scroll.passive="hideTooltipOnScroll"
      >
        <div
          class="contribution-matrix"
          role="grid"
          :aria-rowcount="barrios.length + 1"
          :aria-colcount="dates.length + 1"
        >
          <div class="matrix-header-row" role="row">
            <div class="matrix-corner" role="columnheader">Barrio</div>
            <div class="month-grid" :style="dateGridStyle" role="presentation">
              <span
                v-for="month in monthGroups"
                :key="month.key"
                class="month-label"
                :style="{ gridColumn: `${month.start} / span ${month.span}` }"
              >
                {{ month.label }}
              </span>
            </div>
          </div>

          <div v-for="row in gridRows" :key="row.barrio" class="matrix-row" role="row">
            <div class="barrio-label" role="rowheader" :title="row.barrio">
              {{ row.barrio }}
            </div>
            <div class="date-grid" :style="dateGridStyle" role="presentation">
              <button
                v-for="cell in row.cells"
                :key="cell.key"
                :ref="(element) => setCellElement(cell.rowIndex, cell.columnIndex, element)"
                type="button"
                class="contribution-cell"
                :class="[
                  `contribution-cell--${cell.state.key}`,
                  { 'contribution-cell--selected': isSelectedCell(cell) },
                ]"
                role="gridcell"
                :aria-label="formatCellAriaLabel(cell)"
                :aria-selected="isSelectedCell(cell)"
                :tabindex="isActiveCell(cell.rowIndex, cell.columnIndex) ? 0 : -1"
                @mouseenter="showTooltip(cell, $event)"
                @mouseleave="hideTooltip"
                @focus="showTooltip(cell, $event)"
                @blur="hideTooltip"
                @click="selectCell(cell, $event)"
                @keydown="handleCellKeydown($event, cell)"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div class="matrix-footer">
        <div class="legend" aria-label="Estados del aviso">
          <span><i class="legend-swatch legend-swatch--not-expected"></i>No se esperaba</span>
          <span><i class="legend-swatch legend-swatch--no"></i>No se realizó</span>
          <span><i class="legend-swatch legend-swatch--yes"></i>Sí se realizó</span>
          <span><i class="legend-swatch legend-swatch--missing"></i>Sin registro</span>
        </div>
        <p class="keyboard-hint">Usa las flechas del teclado para recorrer las celdas.</p>
      </div>

      <div class="selected-detail" aria-live="polite">
        <template v-if="selectedCell">
          <strong>{{ selectedCell.barrio }}</strong>
          <span>{{ selectedCell.date.label }}</span>
          <span class="selected-state" :class="`selected-state--${selectedCell.state.key}`">
            {{ selectedCell.state.label }}
          </span>
          <span v-if="selectedCell.aviso?.hora_aviso">Hora: {{ selectedCell.aviso.hora_aviso }}</span>
          <span v-if="selectedCell.aviso?.control">Control: {{ selectedCell.aviso.control }}</span>
          <span v-if="selectedCell.aviso?.notas">Notas: {{ selectedCell.aviso.notas }}</span>
        </template>
        <span v-else>Selecciona una celda para conservar sus detalles.</span>
      </div>
    </div>

    <p v-if="normalizedAvisos.length" class="chart-note">
      El porcentaje de cumplimiento considera únicamente los registros en los que se esperaba un
      aviso. Desplaza la matriz horizontalmente para recorrer todas las fechas.
    </p>

    <Teleport to="body">
      <div
        v-if="tooltip.visible && tooltip.cell"
        class="matrix-tooltip"
        :class="{ 'matrix-tooltip--below': tooltip.below }"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
        role="tooltip"
      >
        <span class="matrix-tooltip-date">{{ tooltip.cell.date.label }}</span>
        <strong>{{ tooltip.cell.barrio }}</strong>
        <span>{{ tooltip.cell.state.label }}</span>
        <span v-if="tooltip.cell.aviso?.hora_aviso">Hora: {{ tooltip.cell.aviso.hora_aviso }}</span>
        <span v-if="tooltip.cell.aviso?.control">Control: {{ tooltip.cell.aviso.control }}</span>
        <span v-if="tooltip.cell.aviso?.notas" class="matrix-tooltip-notes">
          {{ tooltip.cell.aviso.notas }}
        </span>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.dataviz-card {
  margin-bottom: 2rem;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dfe5e1;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 45px rgba(29, 54, 38, 0.08);
}

.dataviz-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e7ebe8;
}

.section-kicker {
  margin: 0 0 0.4rem;
  color: #317449;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.dataviz-header h2 {
  margin: 0 0 0.4rem;
  color: #1e2923;
  font-size: 1.35rem;
  font-weight: 800;
}

.dataviz-header p:last-child {
  margin: 0;
  color: #6a7871;
  font-size: 0.9rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(86px, 1fr));
  gap: 0.5rem;
  flex: 0 0 auto;
}

.metrics article {
  min-width: 90px;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  background: #f2f6f3;
}

.metrics span {
  display: block;
  color: #6d7b73;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
}

.metrics strong {
  display: block;
  margin-top: 0.1rem;
  color: #277044;
  font-size: 1.25rem;
}

.metrics .metric--alert strong {
  color: #bd4141;
}

.matrix-region {
  min-width: 0;
  padding-top: 0.9rem;
}

.matrix-scroll {
  --cell-size: 13px;
  --cell-gap: 3px;
  --label-width: 205px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-color: #98aa9e #edf1ee;
  scrollbar-gutter: stable;
}

.contribution-matrix {
  width: max-content;
  min-width: 100%;
  padding: 0 1.25rem 1rem 0;
}

.matrix-header-row,
.matrix-row {
  display: grid;
  grid-template-columns: var(--label-width) max-content;
  width: max-content;
  min-width: 100%;
}

.matrix-corner,
.barrio-label {
  position: sticky;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  width: var(--label-width);
  padding: 0 0.85rem 0 1.25rem;
  border-right: 1px solid #e4e9e6;
  color: #46554c;
  background: #fff;
  font-size: 0.72rem;
}

.matrix-corner {
  z-index: 5;
  min-height: 32px;
  color: #738078;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.barrio-label {
  min-height: calc(var(--cell-size) + var(--cell-gap));
  overflow: hidden;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-grid,
.date-grid {
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: var(--cell-size);
  column-gap: var(--cell-gap);
  width: max-content;
  margin-left: 0.4rem;
}

.month-grid {
  min-height: 32px;
  align-content: end;
  align-items: end;
  padding-bottom: 0.4rem;
  background: #fff;
}

.month-label {
  overflow: hidden;
  color: #68766e;
  font-size: 0.7rem;
  font-weight: 700;
  text-overflow: ellipsis;
  text-transform: capitalize;
  white-space: nowrap;
}

.date-grid {
  align-content: center;
  align-items: center;
  min-height: calc(var(--cell-size) + var(--cell-gap));
}

.contribution-cell {
  position: relative;
  display: block;
  width: var(--cell-size);
  height: var(--cell-size);
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: #e4e9e6;
  appearance: none;
  cursor: pointer;
  transition:
    filter 120ms ease,
    box-shadow 120ms ease;
}

.contribution-cell:hover,
.contribution-cell:focus-visible {
  z-index: 2;
  filter: brightness(0.9);
}

.contribution-cell:focus-visible {
  outline: 2px solid #1e4f31;
  outline-offset: 2px;
}

.contribution-cell--yes {
  background: #318a51;
}

.contribution-cell--no {
  background: #d85454;
}

.contribution-cell--not-expected {
  background: #e4e9e6;
}

.contribution-cell--missing {
  border: 1px solid #cbd5cf;
  background: #fff;
}

.contribution-cell--selected {
  box-shadow: 0 0 0 2px #1e2923;
}

.matrix-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  border-top: 1px solid #edf0ee;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1rem;
  color: #65736b;
  font-size: 0.72rem;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.legend-swatch {
  display: inline-block;
  flex: 0 0 auto;
  width: 11px;
  height: 11px;
  border-radius: 3px;
}

.legend-swatch--yes {
  background: #318a51;
}

.legend-swatch--no {
  background: #d85454;
}

.legend-swatch--not-expected {
  background: #e4e9e6;
}

.legend-swatch--missing {
  border: 1px solid #cbd5cf;
  background: #fff;
}

.keyboard-hint {
  margin: 0;
  color: #7a877f;
  font-size: 0.72rem;
  text-align: right;
}

.selected-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.8rem;
  min-height: 2.65rem;
  margin: 0 1.5rem 1rem;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  color: #5e6d64;
  background: #f4f7f5;
  font-size: 0.78rem;
}

.selected-detail strong {
  color: #24332a;
}

.selected-state {
  font-weight: 750;
}

.selected-state--yes {
  color: #277044;
}

.selected-state--no {
  color: #b83d3d;
}

.selected-state--not-expected,
.selected-state--missing {
  color: #68766e;
}

.dataviz-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 22rem;
  padding: 2rem;
  color: #69776f;
  text-align: center;
}

.dataviz-state--error {
  color: #a03636;
}

.dataviz-spinner {
  width: 1.15rem;
  height: 1.15rem;
  border: 2px solid #c9d8ce;
  border-top-color: #276a3e;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.chart-note {
  margin: 0;
  padding: 0.9rem 1.5rem 1.15rem;
  border-top: 1px solid #edf0ee;
  color: #738078;
  font-size: 0.78rem;
}

.matrix-tooltip {
  position: fixed;
  z-index: 1100;
  display: grid;
  gap: 0.15rem;
  width: min(280px, calc(100vw - 24px));
  padding: 0.7rem 0.8rem;
  border: 1px solid #d6ded9;
  border-radius: 9px;
  color: #526158;
  background: #fff;
  box-shadow: 0 10px 30px rgba(23, 42, 31, 0.2);
  font-size: 0.75rem;
  line-height: 1.45;
  pointer-events: none;
  transform: translate(-50%, -100%);
}

.matrix-tooltip--below {
  transform: translate(-50%, 0);
}

.matrix-tooltip strong {
  color: #17231c;
  font-size: 0.86rem;
}

.matrix-tooltip-date {
  color: #78857e;
  font-size: 0.7rem;
}

.matrix-tooltip-notes {
  margin-top: 0.3rem;
  padding-top: 0.35rem;
  border-top: 1px solid #e7ebe8;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .dataviz-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics {
    width: 100%;
  }

  .matrix-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .keyboard-hint {
    text-align: left;
  }
}

@media (max-width: 600px) {
  .dataviz-header {
    padding: 1.15rem;
  }

  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .matrix-scroll {
    --cell-size: 12px;
    --cell-gap: 3px;
    --label-width: 155px;
  }

  .matrix-corner,
  .barrio-label {
    padding-left: 1rem;
  }

  .matrix-footer,
  .chart-note {
    padding-inline: 1.15rem;
  }

  .selected-detail {
    margin-inline: 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contribution-cell {
    transition: none;
  }
}
</style>
