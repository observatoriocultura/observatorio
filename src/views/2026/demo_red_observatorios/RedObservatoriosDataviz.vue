<template>
  <section class="red-observatorios-dataviz" aria-labelledby="connections-title">
    <header class="dataviz-header">
      <div>
        <p class="eyebrow">Conexiones</p>
        <h1 id="connections-title">Un ecosistema de conocimiento conectado</h1>
        <p class="dataviz-intro">
          Esta demostración presenta posibles relaciones de intercambio, colaboración y circulación de
          conocimiento entre las entidades de la red. Los vínculos son simulados y permiten explorar cómo
          podría verse el ecosistema en conjunto.
        </p>
      </div>

      <div class="dataviz-metrics" aria-label="Resumen de la red">
        <div class="metric">
          <strong>{{ entityCount }}</strong>
          <span>entidades</span>
        </div>
        <div class="metric">
          <strong>{{ connectionCount }}</strong>
          <span>vínculos</span>
        </div>
      </div>
    </header>

    <div v-if="loading" class="dataviz-status" role="status">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>Cargando conexiones…</span>
    </div>

    <div v-else-if="error" class="dataviz-status dataviz-status--error" role="alert">
      <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
      <span>{{ error }}</span>
    </div>

    <div v-else class="charts-stack">
      <article class="chart-panel">
        <div
          ref="dependencyChartContainer"
          class="connections-chart"
          role="img"
          aria-label="Vista circular de relaciones simuladas entre entidades"
        ></div>
        <div class="chart-copy">
          <div class="chart-heading">
            <div>
              <p class="chart-kicker">Una mirada al conjunto</p>
              <h2>Relaciones que atraviesan la red</h2>
            </div>
            <p>
              Esta lectura permite reconocer qué entidades participan en más intercambios y cómo sus
              relaciones se extienden hacia distintos puntos del ecosistema.
            </p>
          </div>
          <p class="chart-note">
            Cada segmento representa una entidad. Las bandas muestran vínculos simulados de colaboración o
            intercambio de conocimiento; su presencia no implica una relación institucional confirmada.
          </p>
        </div>
      </article>

      <article class="chart-panel">
        <div
          ref="chartContainer"
          class="connections-chart"
          role="img"
          aria-label="Mapa de relaciones simuladas entre entidades"
        ></div>
        <div class="chart-copy">
          <div class="chart-heading">
            <div>
              <p class="chart-kicker">Articulación potencial</p>
              <h2>Entidades que conectan el ecosistema</h2>
            </div>
            <p>
              Las entidades con más vínculos adquieren mayor presencia y ayudan a identificar posibles
              articuladores, puentes y espacios de intercambio dentro de la red.
            </p>
          </div>
          <p class="chart-note">
            Cada nodo representa una entidad: su tamaño refleja la cantidad de vínculos visibles y su color
            identifica el país. Las líneas muestran conexiones simuladas y pueden explorarse de forma
            interactiva.
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js'
import 'highcharts/es-modules/masters/modules/sankey.src.js'
import 'highcharts/es-modules/masters/modules/dependency-wheel.src.js'
import 'highcharts/es-modules/masters/modules/networkgraph.src.js'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const ENTIDADES_URL = `${import.meta.env.BASE_URL}content/2026/demo_red_observatorios/entidades.json`
const CONEXIONES_URL = `${import.meta.env.BASE_URL}content/2026/demo_red_observatorios/conexiones.json`

const dependencyChartContainer = ref(null)
const chartContainer = ref(null)
const loading = ref(true)
const error = ref('')
const entityCount = ref(0)
const connectionCount = ref(0)

let dependencyChartInstance = null
let chartInstance = null
let resizeObserver = null

const DEFAULT_NODE_COLOR = '#654096'

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const getEntityColor = (entity) => {
  const color = String(entity.color || '').trim()

  return /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_NODE_COLOR
}

const createGraphData = (entities, connections) => {
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]))
  const uniqueLinks = new Map()
  const degreeById = new Map(entities.map((entity) => [entity.id, 0]))

  connections.forEach((connection) => {
    if (Number(connection.mostrar) !== 1) {
      return
    }

    const from = String(connection.entidad_id_1 || '').trim()
    const to = String(connection.entidad_id_2 || '').trim()

    if (!from || !to || from === to || !entitiesById.has(from) || !entitiesById.has(to)) {
      return
    }

    const key = [from, to].sort().join('|')

    if (!uniqueLinks.has(key)) {
      uniqueLinks.set(key, { from, to })
      degreeById.set(from, (degreeById.get(from) || 0) + 1)
      degreeById.set(to, (degreeById.get(to) || 0) + 1)
    }
  })

  const nodes = entities.map((entity) => {
    const degree = degreeById.get(entity.id) || 0

    return {
      id: entity.id,
      name: entity.sigla || entity.id,
      color: getEntityColor(entity),
      marker: {
        radius: Math.max(7, Math.min(16, 6 + degree * 1.2)),
        lineColor: '#ffffff',
        lineWidth: 2,
      },
      custom: {
        name: entity.nombre_entidad,
        country: entity.pais_ubicacion_principal || 'ND',
        nature: entity.naturaleza_institucional || 'No informado',
        scale: entity.escala_territorial_trabajo || 'No informado',
        year: entity.anio_inicio_actividades || 'No informado',
        purpose: entity.proposito_principal || 'No informado',
        topics: entity.tema_prioritario_accion_investigacion || 'No informado',
        degree,
      },
    }
  })

  return {
    nodes,
    links: [...uniqueLinks.values()],
  }
}

const createTooltip = (point) => {
  if (!point.isNode) {
    const from = point.fromNode?.name || point.options.from || 'Entidad'
    const to = point.toNode?.name || point.options.to || 'entidad'

    return `<b>${escapeHtml(from)} ↔ ${escapeHtml(to)}</b><br><span>Conexión simulada de intercambio</span>`
  }

  const custom = point.options.custom || {}

  return [
    `<b>${escapeHtml(custom.name || point.name)}</b>`,
    `<span>${escapeHtml(custom.country)} · ${escapeHtml(point.name)}</span>`,
    `<span>${escapeHtml(custom.nature)}</span>`,
    `<span>${escapeHtml(custom.scale)} · desde ${escapeHtml(custom.year)}</span>`,
    `<span>${custom.degree} vínculos</span>`,
  ].join('<br>')
}

const createDependencyLinks = (links) => links.map((link) => ({
  ...link,
  weight: 1,
}))

const renderDependencyWheel = (nodes, links) => {
  dependencyChartInstance = Highcharts.chart(dependencyChartContainer.value, {
    chart: {
      type: 'dependencywheel',
      backgroundColor: 'transparent',
      height: 600,
      spacing: [24, 24, 24, 24],
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      description: 'Vista circular de relaciones simuladas entre las entidades del directorio.',
    },
    tooltip: {
      useHTML: true,
      backgroundColor: '#ffffff',
      borderColor: '#e2e6ea',
      borderRadius: 10,
      shadow: false,
      formatter() {
        return createTooltip(this.point)
      },
    },
    plotOptions: {
      dependencywheel: {
        curveFactor: 0.6,
        linkColorMode: 'from',
        nodePadding: 7,
        nodeWidth: 18,
        dataLabels: {
          enabled: true,
          distance: 12,
          nodeFormat: '{point.name}',
          style: {
            color: '#32204a',
            fontSize: '10px',
            fontWeight: '600',
            textOutline: 'none',
          },
        },
      },
    },
    series: [{
      type: 'dependencywheel',
      name: 'Conexiones',
      data: createDependencyLinks(links),
      nodes,
      size: '88%',
    }],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 575,
        },
        chartOptions: {
          chart: {
            height: 500,
          },
        },
      }],
    },
  })
}

const renderChart = (entities, connections) => {
  const { nodes, links } = createGraphData(entities, connections)

  entityCount.value = nodes.length
  connectionCount.value = links.length

  renderDependencyWheel(nodes, links)

  chartInstance = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'networkgraph',
      backgroundColor: 'transparent',
      height: 660,
      spacing: [20, 10, 20, 10],
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      description: 'Mapa de relaciones simuladas entre las entidades del directorio de observatorios.',
    },
    tooltip: {
      useHTML: true,
      backgroundColor: '#ffffff',
      borderColor: '#e2e6ea',
      borderRadius: 10,
      shadow: false,
      formatter() {
        return createTooltip(this.point)
      },
    },
    plotOptions: {
      networkgraph: {
        draggable: true,
        link: {
          color: '#c8bfd5',
          width: 1.2,
        },
        layoutAlgorithm: {
          enableSimulation: true,
          integration: 'verlet',
          initialPositions: 'random',
          friction: -0.97,
          linkLength: 70,
          maxIterations: 1200,
          maxSpeed: 5,
          gravitationalConstant: 0.08,
        },
        dataLabels: {
          enabled: true,
          linkFormat: '',
          formatter() {
            const degree = this.point.options.custom?.degree || 0

            return this.point.isNode && degree >= 6 ? this.point.name : ''
          },
          style: {
            color: '#32204a',
            fontSize: '10px',
            fontWeight: '600',
            textOutline: 'none',
          },
        },
      },
    },
    series: [{
      type: 'networkgraph',
      name: 'Conexiones',
      data: links,
      nodes,
    }],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 575,
        },
        chartOptions: {
          chart: {
            height: 520,
          },
        },
      }],
    },
  })
}

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const responses = await Promise.all([
      fetch(ENTIDADES_URL),
      fetch(CONEXIONES_URL),
    ])

    responses.forEach((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${response.url}`)
      }
    })

    const [entities, connections] = await Promise.all(responses.map((response) => response.json()))

    if (!Array.isArray(entities) || !Array.isArray(connections)) {
      throw new Error('El formato de los datos de conexiones no es válido.')
    }

    loading.value = false
    await nextTick()
    renderChart(entities, connections)
  } catch (loadError) {
    error.value = 'No fue posible cargar el gráfico de conexiones. Intenta nuevamente más tarde.'
    console.error(loadError)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()

  if (typeof ResizeObserver !== 'undefined' && dependencyChartContainer.value && chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      dependencyChartInstance?.reflow()
      chartInstance?.reflow()
    })
    resizeObserver.observe(dependencyChartContainer.value)
    resizeObserver.observe(chartContainer.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  dependencyChartInstance?.destroy()
  chartInstance?.destroy()
})
</script>

<style scoped>
.red-observatorios-dataviz {
  padding: clamp(1.25rem, 3vw, 2.5rem) 0 1rem;
}

.dataviz-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.45rem;
  color: var(--red-purple, #654096);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--red-purple-dark, #32204a);
  font-size: clamp(1.7rem, 3vw, 2.45rem);
  line-height: 1.1;
}

.dataviz-intro {
  max-width: 680px;
  margin: 0.85rem 0 0;
  color: var(--red-muted, #5c6871);
  line-height: 1.6;
}

.dataviz-metrics {
  display: flex;
  flex: 0 0 auto;
  gap: 1.25rem;
}

.metric {
  display: grid;
  gap: 0.1rem;
  min-width: 80px;
  padding-left: 1rem;
  border-left: 1px solid var(--red-border, #e2e6ea);
}

.metric strong {
  color: var(--red-purple-dark, #32204a);
  font-size: 1.55rem;
  line-height: 1;
}

.metric span {
  color: var(--red-muted, #5c6871);
  font-size: 0.8rem;
}

.charts-stack {
  display: grid;
  gap: 1.25rem;
}

.chart-panel {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  overflow: hidden;
  border: 1px solid var(--red-border, #e2e6ea);
  border-radius: 16px;
  background: #fff;
}

.chart-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border-left: 1px solid var(--red-border, #e2e6ea);
  background: linear-gradient(145deg, #fff 0%, #faf8fc 100%);
}

.chart-heading {
  display: grid;
  gap: 1rem;
}

.chart-heading h2 {
  margin: 0;
  color: var(--red-purple-dark, #32204a);
  font-size: 1.25rem;
}

.chart-heading > p {
  margin: 0;
  color: var(--red-muted, #5c6871);
  font-size: 0.9rem;
  line-height: 1.65;
}

.chart-kicker {
  margin: 0 0 0.25rem;
  color: var(--red-purple, #654096);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.connections-chart {
  width: 100%;
  min-height: 600px;
}

.chart-note {
  margin: 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--red-border, #e2e6ea);
  color: var(--red-muted, #5c6871);
  font-size: 0.82rem;
  line-height: 1.6;
}

.dataviz-status {
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  color: var(--red-muted, #5c6871);
}

.dataviz-status--error {
  color: #a33d48;
}

@media (max-width: 900px) {
  .dataviz-header {
    display: block;
  }

  .dataviz-metrics {
    margin-top: 1.25rem;
  }

  .chart-panel {
    grid-template-columns: 1fr;
  }

  .chart-copy {
    order: -1;
    padding: 1.5rem;
    border-bottom: 1px solid var(--red-border, #e2e6ea);
    border-left: 0;
  }
}

@media (max-width: 575px) {
  .dataviz-metrics {
    flex-wrap: wrap;
  }

  .connections-chart {
    min-height: 500px;
  }

  .chart-copy {
    gap: 1.15rem;
    padding: 1.25rem;
  }
}
</style>
