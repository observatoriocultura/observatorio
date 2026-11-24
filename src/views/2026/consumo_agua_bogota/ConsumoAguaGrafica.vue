<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js'
import 'highcharts/es-modules/masters/modules/accessibility.src.js'

const props = defineProps({
  periodos: { type: Array, required: true },
  contexto: { type: String, required: true },
  variable: { type: Object, required: true },
  series: { type: Array, required: true },
  desglose: { type: String, default: 'ninguna' },
})

const variable = computed(() => props.variable)
const tieneDesglose = computed(() => props.desglose !== 'ninguna')
const variasSeries = computed(() => props.series.length > 1)
// Colores contrastantes; los códigos mantienen su color al cambiar los filtros.
const coloresSeries = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#ea580c',
  '#db2777',
  '#0891b2',
  '#ca8a04',
  '#dc2626',
  '#4f46e5',
  '#65a30d',
  '#c026d3',
  '#0d9488',
  '#be123c',
  '#0284c7',
  '#9333ea',
  '#b45309',
  '#16a34a',
  '#d946ef',
  '#475569',
  '#f97316',
]
const seriesHighcharts = computed(() =>
  props.series.map((serie) => {
    const indice = Math.max(0, serie.codigo - 1)
    const color = coloresSeries[indice % coloresSeries.length]
    return {
      id: serie.id,
      name: tieneDesglose.value ? serie.nombre : variable.value.nombre,
      color,
      dashStyle:
        props.desglose === 'localidad' && indice >= coloresSeries.length ? 'ShortDash' : 'Solid',
      dataLabels: { style: { color } },
      data: serie.periodos.map((periodo, indiceMes) => ({
        name: periodo.etiqueta,
        y: periodo[variable.value.id],
        dataLabels: { y: indiceMes % 2 === 0 ? -12 : -28 },
      })),
    }
  }),
)
const escala = computed(() => {
  if (variable.value.id === 'consumo_m3') {
    return { divisor: 1_000_000, sufijo: ' M', unidad: 'Millones de m³' }
  }
  if (variable.value.id === 'cuentas_unicas') {
    return { divisor: 1_000, sufijo: ' mil', unidad: 'Miles de cuentas' }
  }
  return { divisor: 1, sufijo: '', unidad: 'm³/cuenta' }
})
const formatearValorGrafica = (valor) =>
  Number.isFinite(valor)
    ? `${Highcharts.numberFormat(valor / escala.value.divisor, 1, ',', '.')}${escala.value.sufijo}`
    : ''
const contenedor = ref(null)
let grafica = null

const formatoMes = new Intl.DateTimeFormat('es-CO', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const sinDatos = computed(
  () =>
    props.series.length === 0 ||
    props.series.every((serie) =>
      serie.periodos.every((periodo) => periodo[variable.value.id] === null),
    ),
)
const opciones = computed(() => ({
  chart: {
    type: 'line',
    height: tieneDesglose.value ? 480 : 390,
    scrollablePlotArea: { minWidth: 1000, scrollPositionX: 0 },
    backgroundColor: 'transparent',
    animation: false,
    style: { fontFamily: '"Nunito Sans", sans-serif' },
    numberFormatter: (numero, decimales) => Highcharts.numberFormat(numero, decimales, ',', '.'),
  },
  title: { text: null },
  credits: { enabled: false },
  xAxis: {
    categories: props.periodos.map((periodo) =>
      formatoMes.format(new Date(Date.UTC(periodo.anio, periodo.mes - 1, 1))).replace(' de ', ' '),
    ),
    title: { text: null },
    lineColor: '#dedede',
    tickLength: 0,
    labels: { style: { color: '#6b6b6b', fontSize: '11px' } },
  },
  yAxis: {
    title: { text: escala.value.unidad, style: { color: '#6b6b6b' } },
    gridLineColor: '#ededed',
    maxPadding: 0.18,
    labels: {
      style: { color: '#6b6b6b', fontSize: '11px' },
      formatter() {
        return formatearValorGrafica(this.value)
      },
    },
    allowDecimals: variable.value.id !== 'cuentas_unicas',
  },
  legend: {
    enabled: tieneDesglose.value,
    align: 'center',
    verticalAlign: 'top',
    layout: 'horizontal',
    maxHeight: 100,
    symbolWidth: 26,
    itemStyle: { color: '#41464d', fontSize: '12px', fontWeight: 'normal' },
    itemMarginTop: 5,
    itemMarginBottom: 5,
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dedede',
    shadow: false,
    headerFormat: '<b>{point.key}</b><br/>',
    valueDecimals: variable.value.id === 'consumo_promedio' ? 1 : variable.value.decimales,
    valueSuffix: ` ${variable.value.unidad}`,
  },
  plotOptions: {
    series: {
      animation: false,
      lineWidth: 2.5,
      connectNulls: false,
      marker: { enabled: true, radius: 3 },
      dataLabels: {
        enabled: true,
        allowOverlap: !variasSeries.value,
        padding: 0,
        style: { color: '#174b86', fontSize: '10px', fontWeight: '600', textOutline: '2px #fff' },
        formatter() {
          return formatearValorGrafica(this.y)
        },
      },
    },
  },
  accessibility: {
    description: `${variable.value.nombre} mensual. ${props.contexto}. Enero de 2024 a diciembre de 2025. ${tieneDesglose.value ? `Series por ${props.desglose.replace('_', ' ')}.` : 'Serie total.'}`,
  },
  series: seriesHighcharts.value,
  responsive: {
    rules: [
      {
        condition: { maxWidth: 500 },
        chartOptions: {
          chart: { height: tieneDesglose.value ? 420 : 320 },
          xAxis: { labels: { step: 3 } },
        },
      },
    ],
  },
}))

const destruirGrafica = () => {
  grafica?.destroy()
  grafica = null
}

watch(
  [contenedor, opciones],
  ([elemento, configuracion]) => {
    if (!elemento) {
      destruirGrafica()
    } else if (grafica) {
      grafica.update(configuracion, true, true)
    } else {
      grafica = Highcharts.chart(elemento, configuracion)
    }
  },
  { flush: 'post' },
)

onBeforeUnmount(destruirGrafica)
</script>

<template>
  <section class="panel-grafica" aria-labelledby="evolucion-mensual">
    <slot name="controles" />
    <header class="grafica-cabecera">
      <div>
        <h2 id="evolucion-mensual">{{ variable.nombre }} por mes</h2>
        <p>{{ contexto }} · Enero de 2024 a diciembre de 2025</p>
      </div>
      <span class="grafica-unidad">{{ escala.unidad }}</span>
    </header>
    <div ref="contenedor" class="grafica-consumo"></div>
    <p v-if="sinDatos" class="text-muted" role="status">
      No hay datos disponibles para esta variable y selección.
    </p>
  </section>
</template>

<style scoped>
.panel-grafica {
  padding: 24px 20px 16px;
  border: 1px solid #dedede;
  border-radius: 16px;
  background: #fff;
}
.grafica-cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 0 8px 24px;
}
.grafica-cabecera h2 {
  margin: 0 0 5px;
  font-size: 1.15rem;
  font-weight: 750;
  color: #155fc3;
}
.grafica-cabecera p {
  margin: 0;
  color: #6b6b6b;
  font-size: 0.85rem;
}
.grafica-unidad {
  padding: 4px 10px;
  border-radius: 6px;
  color: #155fc3;
  background: #edf3fc;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.grafica-consumo {
  width: 100%;
  min-width: 0;
}
@media (max-width: 575px) {
  .panel-grafica {
    padding: 20px 10px 12px;
  }
  .grafica-cabecera {
    margin-bottom: 18px;
  }
}
</style>
