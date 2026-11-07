<script setup>
import { computed, ref } from 'vue'
import { useAvisosResiduosChart } from './useAvisosResiduosChart.js'

const props = defineProps({
  rows: { type: Array, required: true },
})

const metrics = [
  {
    key: 'compliance',
    label: 'Cumplimiento %',
    unit: 'percent',
    detail: (row) => `${row.completed} de ${row.completed + row.missed} avisos evaluables`,
  },
  { key: 'completed', label: 'Realizados', unit: 'count' },
  { key: 'cantidad_avisos_cumple_franja', label: 'Avisos dentro de la franja', unit: 'count' },
  {
    key: 'porcentaje_avisos_cumple_franja',
    label: '% dentro de la franja',
    unit: 'percent',
    detail: (row) => `${row.cantidad_avisos_cumple_franja} de ${row.completed} avisos realizados`,
  },
  {
    key: 'desviacion_estandar_aviso',
    label: 'Desviación estándar',
    unit: 'minutes',
    detail: (row) => `Horas válidas: ${row.horas_validas}`,
  },
]
const metricKey = ref('compliance')
const metric = computed(() => metrics.find(({ key }) => key === metricKey.value))
const numberFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

const chartRows = computed(() => {
  const { key, unit } = metric.value
  const direction = unit === 'minutes' ? 1 : -1

  return props.rows
    .filter((row) => Number.isFinite(row[key]))
    .sort((a, b) => (a[key] - b[key]) * direction || a.name.localeCompare(b.name, 'es-CO'))
})

const missingNames = computed(() =>
  props.rows.filter((row) => !Number.isFinite(row[metricKey.value])).map((row) => row.name),
)

const chartOptions = computed(() => {
  const { key, label, unit, detail } = metric.value
  const isPercent = unit === 'percent'
  const suffix = { percent: ' %', minutes: ' min', count: '' }[unit]

  return {
    chart: {
      type: 'bar',
      height: Math.max(180, chartRows.value.length * 26 + 42),
      spacing: [4, 66, 4, 0],
      style: { fontFamily: 'inherit' },
      animation: false,
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    lang: { accessibility: { defaultChartTitle: 'Comparativa por barrio' } },
    accessibility: {
      description: `Comparación por barrio. Indicador: ${label}.`,
      point: { valueDescriptionFormat: '{point.name}, {point.custom.label}.' },
    },
    xAxis: {
      categories: chartRows.value.map((row) => row.name),
      lineWidth: 0,
      tickLength: 0,
      labels: { style: { color: 'var(--avisos-muted)', width: '220px', textOverflow: 'ellipsis' } },
    },
    yAxis: {
      min: 0,
      max: isPercent ? 100 : null,
      tickInterval: isPercent ? 25 : null,
      tickPixelInterval: 135,
      gridLineColor: 'var(--avisos-divider)',
      endOnTick: !isPercent,
      allowDecimals: unit === 'minutes',
      title: { text: null },
      labels: {
        formatter() {
          return `${numberFormatter.format(this.value)}${suffix}`
        },
      },
    },
    tooltip: {
      borderColor: 'var(--avisos-border)',
      borderRadius: 8,
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormat: '{series.name}: <b>{point.custom.label}</b>{point.custom.detail}',
    },
    plotOptions: {
      bar: {
        animation: false,
        maxPointWidth: 16,
        borderWidth: 0,
        borderRadius: 3,
        dataLabels: {
          enabled: true,
          crop: false,
          overflow: 'allow',
          format: '{point.custom.label}',
          style: { color: '#263c30', textOutline: 'none', fontSize: '12px' },
        },
      },
    },
    series: [
      {
        name: label,
        color: 'var(--avisos-green)',
        data: chartRows.value.map((row) => {
          const value = row[key] * (isPercent ? 100 : 1)
          return {
            name: row.name,
            y: value,
            custom: {
              label: `${numberFormatter.format(value)}${suffix}`,
              detail: detail ? `<br/>${detail(row)}` : '',
            },
          }
        }),
      },
    ],
    responsive: {
      rules: [
        {
          condition: { maxWidth: 560 },
          chartOptions: {
            chart: { height: Math.max(180, chartRows.value.length * 22 + 42) },
            xAxis: {
              labels: { style: { width: '105px', whiteSpace: 'nowrap', fontSize: '11px' } },
            },
            yAxis: {
              tickInterval: isPercent ? 50 : null,
              labels: { rotation: 0, overflow: 'allow' },
            },
          },
        },
      ],
    },
  }
})

const chartContainer = useAvisosResiduosChart(chartOptions)
</script>

<template>
  <section class="comparison avisos-panel" aria-labelledby="barrios-comparison-title">
    <header class="avisos-panel-header">
      <h2 id="barrios-comparison-title" class="avisos-panel-title">Comparativa por barrio</h2>
      <label class="avisos-field">
        Indicador
        <select v-model="metricKey" class="avisos-control">
          <option v-for="option in metrics" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </label>
    </header>
    <div class="comparison-body">
      <p v-if="metric.unit === 'minutes'" class="avisos-note">
        Una desviación menor indica mayor constancia en el horario de los avisos.
      </p>
      <div v-if="chartRows.length" ref="chartContainer" class="comparison-chart"></div>
      <p v-else class="avisos-note" role="status">
        No hay datos para este indicador en el periodo seleccionado.
      </p>
      <p v-if="chartRows.length && missingNames.length" class="avisos-note">
        Sin datos: {{ missingNames.join(', ') }}.
      </p>
    </div>
  </section>
</template>

<style scoped>
.comparison {
  margin-bottom: var(--avisos-panel-gap);
}

.comparison-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.35rem;
  padding: 0.65rem var(--avisos-panel-padding) 0.85rem;
}

@media (max-width: 450px) {
  .comparison .avisos-field {
    width: 100%;
  }
}
</style>
