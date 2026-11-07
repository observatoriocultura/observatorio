import { onBeforeUnmount, ref, watch } from 'vue'
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js'
import 'highcharts/es-modules/masters/modules/accessibility.src.js'

export const useAvisosResiduosChart = (chartOptions) => {
  const chartContainer = ref(null)
  let chart = null

  const destroy = () => {
    chart?.destroy()
    chart = null
  }

  watch(
    [chartContainer, chartOptions],
    ([container, options]) => {
      if (!container) {
        destroy()
      } else if (chart) {
        chart.update(options, true, true)
      } else {
        chart = Highcharts.chart(container, options)
      }
    },
    { flush: 'post' },
  )

  onBeforeUnmount(destroy)

  return chartContainer
}
