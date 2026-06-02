<template>
  <section class="avance-semanal" aria-label="Avance semanal del PAI">
    <div class="avance-semanal-grid">
      <section class="avance-tabla" aria-labelledby="avance-linea-title">
        <header class="avance-tabla-header">
          <h2 id="avance-linea-title">Línea de tiempo</h2>
        </header>

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

const parseNumberValue = (value) => {
  const text = String(value ?? '')
    .trim()
    .replace('%', '')
    .replace(/\s/g, '')
    .replace(',', '.')

  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

const timelineData = computed(() =>
  props.semanas
    .map((semana) => {
      const x = parseDateValue(semana?.fecha_fin)
      const y = parseNumberValue(semana?.avance_esperado)

      if (x === null || y === null) return null

      return {
        x,
        y,
        name: formatCell(semana?.semana ?? semana?.nombre ?? semana?.fecha_fin),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x),
)

const avancesResumen = computed(() => {
  const resumenPorFecha = new Map()

  props.avances.forEach((avance) => {
    const fecha = String(avance?.fecha ?? '').trim()
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
      const value = parseNumberValue(avance?.[key])
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

const avanceRealData = computed(() =>
  avancesResumen.value
    .map((resumen) => {
      if (resumen.timestamp === null || resumen.avance === null) return null

      return {
        x: resumen.timestamp,
        y: resumen.avance,
        name: resumen.fecha,
      }
    })
    .filter(Boolean),
)

const timelineTotal = computed(() => timelineData.value.length + avanceRealData.value.length)

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
      title: {
        text: 'Fecha',
      },
      labels: {
        format: '{value:%d/%m}',
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
      },
      {
        name: 'Avance registrado',
        color: '#0f766e',
        data: avanceRealData.value,
      },
    ],
  }

  if (timelineChart) {
    timelineChart.update(options, true, true)
  } else {
    timelineChart = Highcharts.chart(timelineChartContainer.value, options)
  }
}

const formatCell = (value) => {
  const text = String(value ?? '').trim()
  return text || '-'
}

const formatTotal = (total) => `${new Intl.NumberFormat('es-CO').format(total)} registros`

const formatResumenCell = (value, key) => {
  if (key === 'fecha') return formatCell(value)
  if (value === null || value === undefined) return '-'
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)}%`
}

onMounted(renderTimelineChart)

watch([timelineData, avanceRealData], renderTimelineChart)

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
