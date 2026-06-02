<template>
  <section class="avance-semanal" aria-label="Avance semanal del PAI">
    <div class="avance-semanal-grid">
      <section class="avance-tabla" aria-label="Linea de tiempo">
        <div v-if="timelineTotal > 0" ref="timelineChartContainer" class="avance-chart"></div>
        <p v-else class="avance-empty">No hay datos de avance para graficar.</p>
      </section>

      <section class="avance-tabla" aria-labelledby="avance-resumen-title">
        <header class="avance-tabla-header">
          <h2 id="avance-resumen-title">Resumen por fecha</h2>
          <span>{{ formatTotal(avancesResumen.length) }}</span>
        </header>

        <div v-if="avancesResumen.length > 0" class="avance-table-wrap">
          <table class="avance-table avance-table-compact">
            <thead>
              <tr>
                <th v-for="column in resumenColumns" :key="column.key" scope="col">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resumen in avancesResumen" :key="resumen.fecha">
                <td v-for="column in resumenColumns" :key="column.key">
                  {{ formatResumenCell(resumen[column.key], column.key) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="avance-empty">No hay avances para resumir por fecha.</p>
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

const resumenKeys = ['avance', 'p', 'i', 'r', 'a', 'f']
const resumenColumns = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'avance', label: 'Avance' },
  { key: 'p', label: 'P' },
  { key: 'i', label: 'I' },
  { key: 'r', label: 'R' },
  { key: 'a', label: 'A' },
  { key: 'f', label: 'F' },
]
const lineaSeriesColors = {
  'cultura-ciudadana': '#b45309',
  'sector-cultura': '#7132a2',
}
const fallbackSeriesColors = ['#0f766e', '#0B57D0', '#c2410c', '#0369a1']

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

// Arma la serie de avance esperado desde la hoja de semanas.
const timelineData = computed(() =>
  props.semanas
    .map((semana) => {
      const fechaFin = getFieldValue(semana, ['fecha_fin', 'fecha fin', 'fecha final'])
      const avanceEsperado = getFieldValue(semana, ['avance_esperado', 'avance esperado'])
      const x = parseDateValue(fechaFin)
      const y = parseNumberValue(avanceEsperado)

      if (x === null || y === null) return null

      return {
        x,
        y,
        name: formatCell(getFieldValue(semana, ['semana', 'nombre']) ?? fechaFin),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x),
)

// Resume los avances por fecha para la tabla inferior.
const avancesResumen = computed(() => {
  const resumenPorFecha = new Map()

  props.avances.forEach((avance) => {
    const fecha = String(getFieldValue(avance, ['fecha']) ?? '').trim()
    if (!fecha) return

    if (!resumenPorFecha.has(fecha)) {
      resumenPorFecha.set(fecha, {
        fecha,
        timestamp: parseDateValue(fecha),
        sums: Object.fromEntries(resumenKeys.map((key) => [key, 0])),
        counts: Object.fromEntries(resumenKeys.map((key) => [key, 0])),
      })
    }

    const resumen = resumenPorFecha.get(fecha)

    resumenKeys.forEach((key) => {
      const value = parseNumberValue(getFieldValue(avance, [key]))
      if (value === null) return

      resumen.sums[key] += value
      resumen.counts[key] += 1
    })
  })

  return [...resumenPorFecha.values()]
    .map((resumen) => {
      const averages = Object.fromEntries(
        resumenKeys.map((key) => [
          key,
          resumen.counts[key] > 0 ? resumen.sums[key] / resumen.counts[key] : null,
        ]),
      )

      return {
        fecha: resumen.fecha,
        timestamp: resumen.timestamp,
        ...averages,
      }
    })
    .sort((a, b) => {
      if (a.timestamp !== null && b.timestamp !== null) return a.timestamp - b.timestamp
      return a.fecha.localeCompare(b.fecha)
    })
})

// Calcula una serie de avance registrado por cada linea de investigacion.
const avanceRealSeries = computed(() => {
  const resumenPorLineaFecha = new Map()

  props.avances.forEach((avance) => {
    const fecha = String(getFieldValue(avance, ['fecha']) ?? '').trim()
    const timestamp = parseDateValue(fecha)
    const value = parseNumberValue(getFieldValue(avance, ['avance']))
    const lineaKey = toClassName(
      getFieldValue(avance, [
        'linea_investigacion',
        'linea investigacion',
        'línea investigación',
        'línea de investigación',
      ]),
    )

    if (!fecha || timestamp === null || value === null || !lineaKey) return

    const resumenKey = `${lineaKey}:${timestamp}`

    if (!resumenPorLineaFecha.has(resumenKey)) {
      resumenPorLineaFecha.set(resumenKey, {
        fecha,
        lineaKey,
        timestamp,
        sum: 0,
        count: 0,
      })
    }

    const resumen = resumenPorLineaFecha.get(resumenKey)
    resumen.sum += value
    resumen.count += 1
  })

  const pointsByLinea = [...resumenPorLineaFecha.values()].reduce((lineas, resumen) => {
    if (!lineas.has(resumen.lineaKey)) {
      lineas.set(resumen.lineaKey, [])
    }

    lineas.get(resumen.lineaKey).push({
      x: resumen.timestamp,
      y: resumen.sum / resumen.count,
      name: resumen.fecha,
    })

    return lineas
  }, new Map())

  const orderedLineaKeys = [
    ...lineasInvestigacion.map((linea) => linea.key).filter((key) => pointsByLinea.has(key)),
    ...[...pointsByLinea.keys()]
      .filter((key) => !lineasInvestigacion.some((linea) => linea.key === key))
      .sort(),
  ]

  return orderedLineaKeys.map((lineaKey, index) => {
    const linea = lineasInvestigacion.find((item) => item.key === lineaKey)

    return {
      name: linea?.nombre ?? lineaKey,
      color: lineaSeriesColors[lineaKey] ?? fallbackSeriesColors[index % fallbackSeriesColors.length],
      data: pointsByLinea.get(lineaKey).sort((a, b) => a.x - b.x),
    }
  })
})

// Aplana los puntos registrados para calcular totales y rangos.
const avanceRealPoints = computed(() => avanceRealSeries.value.flatMap((series) => series.data))

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
      pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:.1f}%</b><br/>',
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
        color: '#0B57D0',
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

// Formatea el contador de registros con separador local.
const formatTotal = (total) => `${new Intl.NumberFormat('es-CO').format(total)} registros`

// Formatea celdas del resumen, usando porcentaje en los campos numericos.
const formatResumenCell = (value, key) => {
  if (key === 'fecha') return formatCell(value)
  if (value === null || value === undefined) return '-'
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)}%`
}

// Renderiza la grafica cuando el componente entra al DOM.
onMounted(renderTimelineChart)

// Repinta la grafica cuando cambian datos, series o bandas mensuales.
watch([timelineData, avanceRealSeries, timelineMonthBands], renderTimelineChart)

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

.avance-chart {
  width: 100%;
  min-height: 600px;
}

.avance-table {
  width: 100%;
  min-width: 42rem;
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

.avance-empty {
  border: 1px dashed #d8d8d8;
  border-radius: 6px;
  margin: 0;
  padding: 0.75rem;
  color: #6c757d;
  font-size: 0.85rem;
}
</style>
