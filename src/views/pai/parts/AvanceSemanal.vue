<template>
  <section class="avance-semanal" aria-label="Avance semanal del PAI">
    <div class="avance-semanal-grid">
      <section class="avance-tabla container" aria-label="Linea de tiempo">
        <div class="avance-main">
          <div v-if="timelineTotal > 0" ref="timelineChartContainer" class="avance-chart"></div>
          <p v-else class="avance-empty">No hay datos de avance para graficar.</p>

          <aside class="avance-kpis" aria-label="Indicadores del avance mas reciente">
            <article class="avance-kpi">
              <span>Fecha</span>
              <strong>{{ formatDisplayDate(ultimoAvanceResumen.fechaAvanceMasReciente) }}</strong>
            </article>
            <h3 class="avance-kpis-title">AVANCE</h3>
            <article class="avance-kpi avance-kpi-esperado">
              <span>Esperado</span>
              <strong>{{
                formatPercent(ultimoAvanceResumen.avanceEsperadoFechaAvanceMasReciente)
              }}</strong>
            </article>
            <article class="avance-kpi avance-kpi-cultura-ciudadana">
              <span>Cultura Ciudadana</span>
              <strong>{{
                formatPercent(ultimoAvanceResumen.avanceMasRecienteCulturaCiudadana)
              }}</strong>
              <small :class="getDesviacionClass(ultimoAvanceResumen.desviacionCulturaCiudadana)">
                {{ formatSignedPercent(ultimoAvanceResumen.desviacionCulturaCiudadana) }}
              </small>
            </article>
            <article class="avance-kpi avance-kpi-sector-cultura">
              <span>Sector Cultura</span>
              <strong>{{
                formatPercent(ultimoAvanceResumen.avanceMasRecienteSectorCultura)
              }}</strong>
              <small :class="getDesviacionClass(ultimoAvanceResumen.desviacionSectorCultura)">
                {{ formatSignedPercent(ultimoAvanceResumen.desviacionSectorCultura) }}
              </small>
            </article>
            <article class="avance-kpi avance-kpi-total">
              <span>Total ejecutado</span>
              <strong>{{ formatPercent(ultimoAvanceResumen.avanceTotalRegistrado) }}</strong>
              <small :class="getDesviacionClass(ultimoAvanceResumen.desviacionAvanceTotal)">
                {{ formatSignedPercent(ultimoAvanceResumen.desviacionAvanceTotal) }}
              </small>
            </article>
          </aside>
        </div>
      </section>

      <section class="avance-tabla" aria-labelledby="avance-tabla-title">
        <header class="avance-tabla-header">
          <h2 id="avance-tabla-title">Tabla calculada semanal</h2>
          <span>{{ formatSemanasTotal(tablaAvanceSemanal.length) }}</span>
        </header>

        <div v-if="tablaAvanceSemanal.length > 0" class="avance-table-wrap">
          <table class="avance-table avance-table-compact">
            <thead>
              <tr>
                <th v-for="column in tablaAvanceColumns" :key="column.key" scope="col">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="semana in tablaAvanceSemanal"
                :key="semana.timestamp"
                :class="{ 'avance-table-row-active': semana.semana_activa }"
              >
                <td v-for="column in tablaAvanceColumns" :key="column.key">
                  {{ formatTablaAvanceCell(semana[column.key], column.key) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="avance-empty">No hay semanas ni avances para calcular la tabla.</p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import { lineasInvestigacion } from '../constants'
import { toClassName } from '../../../utils/text'

const props = defineProps({
  semanas: {
    type: Array,
    default: () => [],
  },
  avances: {
    type: Array,
    default: () => [],
  },
})

const timelineChartContainer = ref(null)
let timelineChart = null

const tablaAvanceColumns = [
  { key: 'num_semana', label: 'Núm' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'avance_esperado', label: 'Avance esperado' },
  { key: 'avance_total', label: 'Avance total' },
  { key: 'avance_cultura_ciudadana', label: 'Avance Cultura Ciudadana' },
  { key: 'avance_sector_cultura', label: 'Avance Sector Cultura' },
  { key: 'desviacion_avance_total', label: 'Desviacion total' },
  { key: 'desviacion_cultura_ciudadana', label: 'Desviacion Cultura Ciudadana' },
  { key: 'desviacion_sector_cultura', label: 'Desviacion Sector Cultura' },
]
const lineaSeriesColors = {
  'cultura-ciudadana': '#FFE5A0',
  'sector-cultura': '#E6CFF2',
}
const avanceEsperadoColor = '#0B57D0'
const avanceLineas = [
  {
    key: 'cultura-ciudadana',
    field: 'avance_cultura_ciudadana',
  },
  {
    key: 'sector-cultura',
    field: 'avance_sector_cultura',
  },
]
const desviacionFields = [
  'desviacion_avance_total',
  'desviacion_cultura_ciudadana',
  'desviacion_sector_cultura',
]

// Normaliza nombres de columnas para tolerar espacios, tildes y mayusculas.
const normalizeColumnName = (value) => toClassName(value).replaceAll('-', '_')

// Lee una celda usando varios nombres posibles de columna.
const getFieldValue = (record, keys) => {
  const normalizedRecord = Object.fromEntries(
    Object.entries(record ?? {}).map(([key, value]) => [normalizeColumnName(key), value]),
  )

  return keys
    .map((key) => normalizedRecord[normalizeColumnName(key)])
    .find((value) => value !== undefined && value !== null && String(value).trim() !== '')
}

// Convierte fechas de Sheets a timestamp para Highcharts.
const parseDateValue = (value) => {
  const text = String(value ?? '').trim()
  if (!text) return null

  const normalizedText = text.replaceAll('\\', '/')
  const localDateMatch = normalizedText.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)

  if (localDateMatch) {
    const [, day, month, year] = localDateMatch.map(Number)
    const timestamp = new Date(year, month - 1, day).getTime()
    return Number.isNaN(timestamp) ? null : timestamp
  }

  const timestamp = new Date(text).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

// Normaliza numeros que pueden venir con %, espacios o coma decimal.
const parseNumberValue = (value) => {
  const text = String(value ?? '')
    .trim()
    .replace('%', '')
    .replace(/\s/g, '')
    .replace(',', '.')

  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

const getAverageValue = (values) => {
  const validValues = values.filter((value) => Number.isFinite(value))
  if (validValues.length === 0) return null
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length
}

const getDifferenceValue = (value, expectedValue) => {
  if (
    value === null ||
    value === undefined ||
    expectedValue === null ||
    expectedValue === undefined
  )
    return null
  return value - expectedValue
}

const getLineaInvestigacionKey = (avance) =>
  toClassName(
    getFieldValue(avance, ['linea_investigacion', 'linea investigacion', 'linea de investigacion']),
  )

const createTablaAvanceRow = ({ timestamp, fecha, semana = null }) => ({
  semana,
  num_semana: null,
  fecha,
  timestamp,
  avance_esperado: null,
  avance_total: null,
  avance_cultura_ciudadana: null,
  avance_sector_cultura: null,
  desviacion_avance_total: null,
  desviacion_cultura_ciudadana: null,
  desviacion_sector_cultura: null,
  semana_activa: false,
})

// Tabla unica preparada para grafica, KPIs y gestion visible de la informacion.
const tablaAvanceSemanal = computed(() => {
  const rowsByTimestamp = new Map()

  props.semanas.forEach((semana) => {
    const fechaFin = String(
      getFieldValue(semana, ['fecha_fin', 'fecha fin', 'fecha final']) ?? '',
    ).trim()
    const timestamp = parseDateValue(fechaFin)
    if (!fechaFin || timestamp === null) return

    if (!rowsByTimestamp.has(timestamp)) {
      rowsByTimestamp.set(timestamp, createTablaAvanceRow({ timestamp, fecha: fechaFin }))
    }

    const row = rowsByTimestamp.get(timestamp)
    row.semana = formatCell(getFieldValue(semana, ['semana', 'nombre']) ?? fechaFin)
    row.num_semana = getFieldValue(semana, [
      'num_semana',
      'num semana',
      'numero_semana',
      'numero semana',
    ])
    row.fecha = fechaFin
    row.avance_esperado = parseNumberValue(
      getFieldValue(semana, ['avance_esperado', 'avance esperado']),
    )
  })

  const avancesPorLineaFecha = new Map()

  props.avances.forEach((avance) => {
    const fecha = String(getFieldValue(avance, ['fecha']) ?? '').trim()
    const timestamp = parseDateValue(fecha)
    const value = parseNumberValue(getFieldValue(avance, ['avance']))
    const lineaKey = getLineaInvestigacionKey(avance)

    if (!fecha || timestamp === null || value === null || !lineaKey) return
    if (!avanceLineas.some((linea) => linea.key === lineaKey)) return

    const resumenKey = `${lineaKey}:${timestamp}`

    if (!avancesPorLineaFecha.has(resumenKey)) {
      avancesPorLineaFecha.set(resumenKey, {
        fecha,
        lineaKey,
        timestamp,
        sum: 0,
        count: 0,
      })
    }

    const resumen = avancesPorLineaFecha.get(resumenKey)
    resumen.sum += value
    resumen.count += 1
  })

  avancesPorLineaFecha.forEach((resumen) => {
    if (!rowsByTimestamp.has(resumen.timestamp)) {
      rowsByTimestamp.set(
        resumen.timestamp,
        createTablaAvanceRow({
          timestamp: resumen.timestamp,
          fecha: resumen.fecha,
          semana: `Corte ${resumen.fecha}`,
        }),
      )
    }

    const row = rowsByTimestamp.get(resumen.timestamp)
    const linea = avanceLineas.find((item) => item.key === resumen.lineaKey)
    row.fecha = row.fecha || resumen.fecha
    row.semana = row.semana || `Corte ${resumen.fecha}`
    row[linea.field] = resumen.sum / resumen.count
  })

  let latestRegisteredTimestamp = null
  let latestTimestamp = null
  let lastExpectedValue = null

  const rows = [...rowsByTimestamp.values()]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((row) => {
      if (row.avance_esperado !== null) {
        lastExpectedValue = row.avance_esperado
      } else {
        row.avance_esperado = lastExpectedValue
      }

      latestTimestamp = row.timestamp

      if (row.avance_cultura_ciudadana !== null || row.avance_sector_cultura !== null) {
        latestRegisteredTimestamp = row.timestamp
      }

      return row
    })

  const activeTimestamp = latestRegisteredTimestamp ?? latestTimestamp

  return rows.map((row) => {
    const avanceTotal = getAverageValue([row.avance_cultura_ciudadana, row.avance_sector_cultura])

    return {
      ...row,
      avance_total: avanceTotal,
      desviacion_avance_total: getDifferenceValue(avanceTotal, row.avance_esperado),
      desviacion_cultura_ciudadana: getDifferenceValue(
        row.avance_cultura_ciudadana,
        row.avance_esperado,
      ),
      desviacion_sector_cultura: getDifferenceValue(row.avance_sector_cultura, row.avance_esperado),
      semana: formatCell(row.semana ?? row.fecha),
      num_semana: formatCell(row.num_semana ?? row.semana ?? row.fecha),
      semana_activa: row.timestamp === activeTimestamp,
    }
  })
})

// La grafica consume exclusivamente la tabla calculada.
const timelineData = computed(() =>
  tablaAvanceSemanal.value
    .filter((semana) => semana.avance_esperado !== null)
    .map((semana) => ({
      x: semana.timestamp,
      y: semana.avance_esperado,
      name: semana.fecha,
    })),
)

const avanceRealSeries = computed(() =>
  avanceLineas
    .map((linea) => {
      const lineaInvestigacion = lineasInvestigacion.find((item) => item.key === linea.key)

      return {
        lineaKey: linea.key,
        name: lineaInvestigacion?.nombre ?? linea.key,
        color: lineaSeriesColors[linea.key],
        data: tablaAvanceSemanal.value
          .filter((semana) => semana[linea.field] !== null)
          .map((semana) => ({
            x: semana.timestamp,
            y: semana[linea.field],
            name: semana.fecha,
          })),
      }
    })
    .filter((series) => series.data.length > 0),
)

const avanceRealPoints = computed(() => avanceRealSeries.value.flatMap((series) => series.data))

const semanaActiva = computed(
  () => tablaAvanceSemanal.value.find((semana) => semana.semana_activa) ?? null,
)

const ultimoAvanceResumen = computed(() => ({
  avanceTotalRegistrado: semanaActiva.value?.avance_total ?? null,
  avanceMasRecienteCulturaCiudadana: semanaActiva.value?.avance_cultura_ciudadana ?? null,
  avanceMasRecienteSectorCultura: semanaActiva.value?.avance_sector_cultura ?? null,
  desviacionAvanceTotal: semanaActiva.value?.desviacion_avance_total ?? null,
  desviacionCulturaCiudadana: semanaActiva.value?.desviacion_cultura_ciudadana ?? null,
  desviacionSectorCultura: semanaActiva.value?.desviacion_sector_cultura ?? null,
  fechaAvanceMasReciente: semanaActiva.value?.fecha ?? null,
  avanceEsperadoFechaAvanceMasReciente: semanaActiva.value?.avance_esperado ?? null,
}))

// Cuenta los puntos disponibles para decidir si se renderiza la grafica.
const timelineTotal = computed(() => timelineData.value.length + avanceRealPoints.value.length)
// Crea bandas mensuales alternadas para segmentar visualmente el eje X.
const timelineMonthBands = computed(() => {
  const timestamps = [...timelineData.value, ...avanceRealPoints.value].map((point) => point.x)
  if (timestamps.length === 0) return []

  const minDate = new Date(Math.min(...timestamps))
  const maxDate = new Date(Math.max(...timestamps))
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const bands = []
  let monthIndex = 0

  while (cursor.getTime() <= maxDate.getTime()) {
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)

    bands.push({
      from: cursor.getTime(),
      to: nextMonth.getTime(),
      color: monthIndex % 2 === 0 ? 'rgba(11, 87, 208, 0.045)' : 'rgba(15, 118, 110, 0.035)',
      borderColor: 'rgba(108, 117, 125, 0.28)',
      borderWidth: 1,
    })

    cursor.setMonth(cursor.getMonth() + 1)
    monthIndex += 1
  }

  return bands
})

// Crea o actualiza la grafica de Highcharts con las series calculadas.
const renderTimelineChart = async () => {
  await nextTick()

  if (!timelineChartContainer.value || timelineTotal.value === 0) {
    timelineChart?.destroy()
    timelineChart = null
    return
  }

  const options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      height: 600,
      spacing: [12, 8, 8, 8],
    },
    title: {
      align: 'center',
      text: 'Avance semanal',
      style: {
        color: '#212529',
        fontSize: '18px',
        fontWeight: '700',
      },
    },
    credits: {
      enabled: false,
    },
    custom: {
      tablaAvanceSemanal: tablaAvanceSemanal.value,
      ultimoAvanceResumen: ultimoAvanceResumen.value,
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'top',
    },
    xAxis: {
      type: 'datetime',
      plotBands: timelineMonthBands.value,
      title: {
        text: 'Fecha',
      },
      labels: {
        formatter() {
          // Formatea cada marca como DD/MMM, por ejemplo 16/ago.
          const [day, month] = new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: 'short',
          })
            .formatToParts(new Date(this.value))
            .filter((part) => part.type === 'day' || part.type === 'month')
            .map((part) => part.value.replace('.', ''))

          return `${day}/${month}`
        },
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Avance',
      },
      labels: {
        format: '{value}%',
      },
    },
    tooltip: {
      shared: true,
      xDateFormat: '%d/%m/%Y',
      pointFormat:
        '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:.1f}%</b><br/>',
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        marker: {
          enabled: true,
          lineWidth: 2,
          radius: 5,
        },
      },
      series: {
        animation: false,
        dataLabels: {
          enabled: true,
          allowOverlap: true,
          format: '{point.y:.1f}%',
          style: {
            color: '#212529',
            fontSize: '11px',
            fontWeight: '700',
            textOutline: 'none',
          },
        },
      },
    },
    series: [
      {
        name: 'Avance esperado',
        color: avanceEsperadoColor,
        data: timelineData.value,
        dataLabels: {
          enabled: false,
        },
      },
      ...avanceRealSeries.value,
    ],
  }

  if (timelineChart) {
    timelineChart.update(options, true, true)
  } else {
    timelineChart = Highcharts.chart(timelineChartContainer.value, options)
  }
}

// Muestra texto limpio o un guion cuando la celda viene vacia.
const formatCell = (value) => {
  const text = String(value ?? '').trim()
  return text || '-'
}

const formatDisplayDate = (value) => {
  const timestamp = parseDateValue(value)
  if (timestamp === null) return formatCell(value)

  const parts = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(new Date(timestamp))

  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value.replace('.', '')
  const year = parts.find((part) => part.type === 'year')?.value

  if (!day || !month || !year) return formatCell(value)
  return `${day}/${month}/${year}`
}

const formatSemanasTotal = (total) => `${new Intl.NumberFormat('es-CO').format(total)} semanas`

const formatPercent = (value) => {
  if (value === null || value === undefined) return '-'
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)}%`
}

const formatSignedPercent = (value) => {
  if (value === null || value === undefined) return '-'
  const formattedValue = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 1,
    signDisplay: 'always',
  }).format(value)
  return `${formattedValue}%`
}

const getDesviacionClass = (value) => ({
  'avance-desviacion-positive': Number(value) > 0,
  'avance-desviacion-negative': Number(value) < 0,
})

// Formatea celdas de la tabla calculada semanal.
const formatTablaAvanceCell = (value, key) => {
  if (key === 'num_semana' || key === 'semana' || key === 'fecha') return formatCell(value)
  if (key === 'semana_activa') return value ? 'true' : 'false'
  if (desviacionFields.includes(key)) return formatSignedPercent(value)
  return formatPercent(value)
}

// Renderiza la grafica cuando el componente entra al DOM.
onMounted(renderTimelineChart)

// Repinta la grafica cuando cambia la tabla calculada o las bandas mensuales.
watch([tablaAvanceSemanal, timelineMonthBands], renderTimelineChart)

// Libera la instancia de Highcharts al desmontar el componente.
onBeforeUnmount(() => {
  timelineChart?.destroy()
  timelineChart = null
})
</script>

<style scoped>
.avance-semanal {
  min-width: 0;
}

.avance-semanal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.avance-tabla {
  min-width: 0;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
}

.avance-tabla-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.avance-tabla-header h2 {
  margin: 0;
  color: #212529;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
}

.avance-tabla-header span {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

.avance-table-wrap {
  max-width: 100%;
  overflow-x: auto;
}

.avance-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(13rem, 16rem);
  gap: 1rem;
  align-items: stretch;
}

.avance-chart {
  width: 100%;
  min-height: 600px;
}

.avance-kpis {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.65rem;
  align-content: start;
}

.avance-kpis-title {
  margin: 0.15rem 0 -0.1rem;
  color: #212529;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.2;
}

.avance-kpi {
  position: relative;
  min-width: 0;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  background-color: #f9f9fb;
  padding: 0.95rem 0.85rem 0.85rem;
}

.avance-kpi-cultura-ciudadana {
  border-color: #ffe5a0;
  background-color: #fff8e6;
}

.avance-kpi-esperado {
  border-color: #0b57d0;
  color: #0b57d0;
}

.avance-kpi-esperado span,
.avance-kpi-esperado strong {
  color: #0b57d0;
}

.avance-kpi-sector-cultura {
  border-color: #e6cff2;
  background-color: #fbf6fd;
}

.avance-kpi-total {
  border-color: #b7c6d8;
  background-color: #f5f8fb;
}

.avance-kpi span {
  display: block;
  max-width: calc(100% - 3.75rem);
  margin-bottom: 0.35rem;
  color: #6c757d;
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
}

.avance-kpi strong {
  display: block;
  color: #212529;
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.avance-kpi small {
  position: absolute;
  top: 0.55rem;
  right: 0.65rem;
  display: block;
  color: #495057;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.1;
  text-align: right;
}

.avance-kpi small.avance-desviacion-positive {
  color: #146c43;
}

.avance-kpi small.avance-desviacion-negative {
  color: #b42318;
}

.avance-table {
  width: 100%;
  min-width: 76rem;
  border-collapse: collapse;
  color: #212529;
  font-size: 0.84rem;
}

.avance-table th,
.avance-table td {
  border-bottom: 1px solid #eeeeee;
  padding: 0.5rem 0.6rem;
  text-align: left;
  vertical-align: top;
}

.avance-table th {
  background-color: #f9f9fb;
  color: #495057;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

.avance-table td {
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.avance-table-row-active td {
  background-color: #f2f7ff;
  font-weight: 700;
}

.avance-empty {
  border: 1px dashed #d8d8d8;
  border-radius: 6px;
  margin: 0;
  padding: 0.75rem;
  color: #6c757d;
  font-size: 0.85rem;
}

@media (max-width: 991.98px) {
  .avance-main {
    grid-template-columns: minmax(0, 1fr);
  }

  .avance-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .avance-kpis {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
