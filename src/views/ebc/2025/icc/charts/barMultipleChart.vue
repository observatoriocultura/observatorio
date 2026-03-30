<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
// Opcional: Cargar módulos adicionales si se necesitan (ej. Exporting)
// import Exporting from 'highcharts/modules/exporting';
// Exporting(Highcharts);

const colorsPalette = ['#003366', '#00AEEF', '#F9A825', '#D32F2F', '#388E3C', '#7B1FA2']

const props = defineProps({
  title: {
    type: String,
    default: 'Gráfico de Resultados',
  },
  subtitle: {
    type: String,
    default: 'Fuente: Observatorio de Cultura',
  },
  type: {
    type: String,
    default: 'column', // 'column', 'bar', 'pie', 'line', etc.
  },
  series: {
    type: Array,
    default: () => [],
  },
  categorias: {
    type: Array,
    default: () => [],
  },
})

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bar',
      style: {
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      backgroundColor: 'transparent',
    },
    title: {
      text: props.title,
      style: {
        fontWeight: '800',
        color: '#32204a',
      },
    },
    subtitle: {
      text: props.subtitle,
      style: {
        color: '#8c96a0',
      },
    },
    credits: {
      enabled: false,
    },
    colors: colorsPalette,
    xAxis: {
      categories: props.categorias,
      crosshair: true,
      labels: {
        style: { color: '#5c6972' },
      },
    },
    yAxis: {
      min: 0,
      reversedStacks: false,
      title: {
        text: 'Porcentaje (%)',
        style: { color: '#8c96a0' },
      },
      labels: {
        style: { color: '#5c6972' },
      },
      gridLineColor: '#f1f3f5',
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#eef0f2',
      shadow: true,
    },
    plotOptions: {
      bar: {
        stacking: 'percent',
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.1f}%',
          style: { textOutline: 'none' },
        },
      },
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        borderRadius: 4,
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        },
      },
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
      layout: 'horizontal',
      reversed: false,
      itemStyle: {
        color: '#5c6972',
        fontWeight: '600',
      },
      symbolRadius: 4,
    },
    series: props.series,
  })
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// Reaccionar a cambios en las props para redibujar si es necesario
watch(
  () => props.type,
  () => {
    initChart()
  },
)

watch(
  () => props.title,
  () => {
    if (chartInstance) {
      chartInstance.setTitle({ text: props.title })
    }
  },
)
watch(
  () => props.series,
  () => {
    initChart()
  },
  { deep: true },
)
</script>

<template>
  <div class="icc-chart-wrapper card-premium">
    <div ref="chartContainer" class="highcharts-container"></div>
  </div>
</template>

<style scoped>
.icc-chart-wrapper {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
}

.highcharts-container {
  width: 100%;
  min-height: calc(100vh - 280px);
}
</style>
