<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PILOT_MONTHS } from './avisosResiduos.js'
import { useAvisosResiduosChart } from './useAvisosResiduosChart.js'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  error: { type: String, required: true },
})

const emit = defineEmits(['retry'])
const route = useRoute()
const router = useRouter()
const metrics = {
  compliance: { label: 'Cumplimiento de avisos', axis: 'Avisos' },
  desviacion_estandar_aviso: { label: 'Constancia horaria', axis: 'Minutos', suffix: ' min' },
  porcentaje_avisos_cumple_franja: {
    label: 'Cumplimiento de la franja',
    axis: 'Porcentaje',
    suffix: ' %',
  },
}
const complianceSeries = [
  { key: 'completed', name: 'Realizados', color: 'var(--avisos-green)' },
  { key: 'missed', name: 'No realizados', color: '#a94f57' },
]
const barrioKey = ref('')
const metricKey = ref('compliance')
const heading = ref(null)
const barrio = computed(() => props.rows.find((row) => row.key === barrioKey.value))
const monthLabels = PILOT_MONTHS.map(({ label }) => label)
const numberFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const percentFormatter = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  maximumFractionDigits: 1,
})

watch(
  [() => props.rows, () => props.loading, () => route.query.barrio],
  ([rows, loading, requestedKey]) => {
    if (loading || props.error) return

    if (rows.some((row) => row.key === requestedKey)) {
      barrioKey.value = requestedKey
      return
    }

    if (rows.some((row) => row.key === barrioKey.value)) return

    const withData = rows.find((row) =>
      row.months.some((month) => Number.isFinite(month?.compliance)),
    )
    barrioKey.value = (withData ?? rows[0])?.key ?? ''
  },
  { immediate: true },
)

const selectBarrio = (event) =>
  router.replace({ query: { ...route.query, barrio: event.target.value }, hash: route.hash })

onMounted(() => {
  if (typeof route.query.barrio === 'string') heading.value?.focus()
})

const missingMonths = computed(() =>
  monthLabels.filter(
    (_, index) => !Number.isFinite(barrio.value?.months[index]?.[metricKey.value]),
  ),
)

const chartOptions = computed(() => {
  const key = metricKey.value
  const { label, axis, suffix = '' } = metrics[key]
  const isCompliance = key === 'compliance'
  const isPercent = key === 'porcentaje_avisos_cumple_franja'
  const definitions = isCompliance
    ? complianceSeries
    : [{ key, name: label, color: 'var(--avisos-green)' }]
  const formatValue = (value) => `${numberFormatter.format(value)}${suffix}`

  return {
    chart: {
      height: 360,
      spacing: [16, 16, 8, 0],
      style: { fontFamily: 'inherit' },
      animation: false,
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: isCompliance },
    lang: { accessibility: { defaultChartTitle: 'Evolución mensual por barrio' } },
    accessibility: {
      description: `${label} de ${barrio.value?.name ?? ''}, de junio a octubre de 2026.`,
      point: { valueDescriptionFormat: '{point.category}, {point.custom.label}.' },
    },
    xAxis: { categories: monthLabels, lineColor: 'var(--avisos-border)' },
    yAxis: {
      min: 0,
      max: isPercent ? 100 : null,
      tickInterval: isPercent ? 25 : null,
      gridLineColor: 'var(--avisos-divider)',
      endOnTick: !isPercent,
      allowDecimals: !isCompliance,
      title: { text: axis },
      labels: {
        formatter() {
          return formatValue(this.value)
        },
      },
    },
    tooltip: {
      shared: true,
      borderColor: 'var(--avisos-border)',
      borderRadius: 8,
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormat: '{series.name}: <b>{point.custom.label}</b><br/>',
      footerFormat: '{point.custom.detail}',
    },
    plotOptions: {
      series: { animation: false, connectNulls: false },
      column: {
        stacking: 'normal',
        maxPointWidth: 56,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          filter: { property: 'y', operator: '>', value: 0 },
          style: { color: '#fff', textOutline: '1px #25332b' },
        },
      },
      line: {
        marker: { enabled: true, radius: 4 },
        dataLabels: { enabled: true, format: '{point.custom.label}' },
      },
    },
    series: definitions.map(({ key: field, name, color }) => ({
      id: field,
      name,
      color,
      type: isCompliance ? 'column' : 'line',
      data: (barrio.value?.months ?? []).map((month) => {
        if (!Number.isFinite(month?.[key])) return null

        const value = month[field] * (isPercent ? 100 : 1)
        let detail = `Horas válidas: ${month.horas_validas}`
        if (isCompliance) detail = `Cumplimiento: ${percentFormatter.format(month.compliance)}`
        if (isPercent) {
          detail = `${month.cantidad_avisos_cumple_franja} de ${month.completed} avisos realizados`
        }

        return { y: value, custom: { label: formatValue(value), detail } }
      }),
    })),
    responsive: {
      rules: [
        {
          condition: { maxWidth: 430 },
          chartOptions: {
            xAxis: {
              labels: {
                rotation: 0,
                formatter() {
                  return String(this.value).slice(0, 3)
                },
              },
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
  <section class="monthly-card avisos-panel" aria-labelledby="monthly-title">
    <header class="avisos-panel-header">
      <div>
        <h2 id="monthly-title" ref="heading" class="avisos-panel-title" tabindex="-1">
          Evolución mensual por barrio
        </h2>
        <p class="avisos-panel-description">
          Resultados de junio a octubre de 2026 según el filtro de fechas.
        </p>
      </div>
      <div v-if="!loading && !error && rows.length" class="monthly-filters">
        <label class="avisos-field">
          Barrio
          <select class="avisos-control" :value="barrioKey" @change="selectBarrio">
            <option v-for="item in rows" :key="item.key" :value="item.key">{{ item.name }}</option>
          </select>
        </label>
        <label class="avisos-field">
          Indicador
          <select v-model="metricKey" class="avisos-control">
            <option v-for="(option, key) in metrics" :key="key" :value="key">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </header>

    <p v-if="loading" class="avisos-state" role="status">Cargando resultados mensuales…</p>
    <div v-else-if="error" class="avisos-state">
      <p role="alert">{{ error }}</p>
      <button type="button" class="avisos-button" @click="emit('retry')">Reintentar</button>
    </div>
    <p v-else-if="!rows.length" class="avisos-state">No hay barrios disponibles para consultar.</p>
    <div v-else class="monthly-body">
      <p v-if="metricKey === 'desviacion_estandar_aviso'" class="avisos-note">
        La constancia se mide con la desviación estándar en minutos. Un valor menor indica un
        horario más constante.
      </p>
      <p v-else-if="metricKey === 'porcentaje_avisos_cumple_franja'" class="avisos-note">
        Porcentaje de avisos realizados dentro de la franja establecida.
      </p>
      <p v-if="missingMonths.length === monthLabels.length" class="avisos-note" role="status">
        No hay datos para este barrio e indicador en el periodo seleccionado.
      </p>
      <template v-else>
        <div ref="chartContainer" class="monthly-chart"></div>
        <p v-if="missingMonths.length" class="avisos-note">
          Sin datos en {{ missingMonths.join(', ') }}.
        </p>
      </template>
    </div>
  </section>
</template>

<style scoped>
.monthly-filters {
  display: flex;
  min-width: 0;
  max-width: 100%;
  flex-wrap: wrap;
  gap: 0.5rem 0.85rem;
}

.monthly-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.35rem;
  padding: 0.65rem var(--avisos-panel-padding) 0.85rem;
}

@media (max-width: 600px) {
  .monthly-filters {
    width: 100%;
  }

  .monthly-filters label {
    flex: 1 1 9rem;
  }
}

@media (max-width: 450px) {
  .monthly-filters {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.65fr);
  }
}
</style>
