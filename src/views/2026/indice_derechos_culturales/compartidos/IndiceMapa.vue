<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'
import IndiceSelector from './IndiceSelector.vue'
import IndiceLeyenda from './IndiceLeyenda.vue'
import IndiceTablaResultados from './IndiceTablaResultados.vue'
import { COLOR_SIN_DATOS, crearRanking, descripcionColorBogota } from './ranking.js'

if (typeof HighchartsMap === 'function' && !Highcharts.MapChart) {
  HighchartsMap(Highcharts)
}

const props = defineProps({
  subindices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  valores: { type: Array, required: true },
  configuracion: { type: Object, required: true },
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
const contenedor = ref(null)
const geojson = ref(null)
const cargando = ref(true)
const error = ref('')
const solicitud = new AbortController()
let grafico = null
let observador = null
let desmontado = false

const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const formatear = (valor) =>
  typeof valor === 'number' && Number.isFinite(valor) ? formato.format(valor) : '—'
const indice = computed(() => props.subindices.find((item) => item.codigo === props.modelValue))
const ranking = computed(() => crearRanking(props.localidades, props.valores, props.modelValue))
const bogota = computed(() => ranking.value.bogota)
const filas = computed(() => [
  ...(bogota.value ? [bogota.value] : []),
  ...ranking.value.localidades,
])
const datosMapa = computed(() =>
  ranking.value.localidades.map((item) => ({ ...item, value: item.valor })),
)
const hayDatos = computed(() => datosMapa.value.some((item) => item.value !== null))

async function dibujarMapa() {
  await nextTick()
  if (desmontado || !geojson.value || !contenedor.value || !hayDatos.value) return
  try {
    if (grafico) {
      grafico.series[0].update({ name: indice.value?.nombre }, false)
      grafico.series[0].setData(datosMapa.value, true, false)
      return
    }
    grafico = Highcharts.mapChart(contenedor.value, {
      chart: {
        map: geojson.value,
        backgroundColor: 'transparent',
        style: { fontFamily: 'inherit' },
      },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      mapNavigation: { enabled: true, buttonOptions: { verticalAlign: 'bottom' } },
      tooltip: {
        headerFormat: '',
        pointFormatter() {
          return `${this.nombre}<br/>Puesto: <b>${this.posicion ?? '—'}</b><br/>Valor: <b>${formatear(this.value)}</b>`
        },
      },
      series: [
        {
          type: 'map',
          name: indice.value?.nombre,
          data: datosMapa.value,
          joinBy: ['CODIGO_LOC', 'codigo'],
          nullColor: COLOR_SIN_DATOS,
          borderColor: '#fff',
          borderWidth: 1,
          states: { hover: { borderColor: '#32204a', borderWidth: 2 } },
          dataLabels: {
            enabled: true,
            format: '{point.nombre}',
            style: { fontSize: '9px', textOutline: 'none', color: '#343a40' },
          },
        },
      ],
    })
  } catch (err) {
    console.error(`Error al dibujar el mapa de ${props.configuracion.codigo}:`, err)
    error.value =
      'No fue posible mostrar el mapa. Puedes consultar los resultados en la tabla adjunta.'
  }
}

watch([datosMapa, geojson], dibujarMapa, { flush: 'post' })
onMounted(async () => {
  observador = new ResizeObserver(() => grafico?.reflow())
  if (contenedor.value) observador.observe(contenedor.value)
  try {
    const respuesta = await fetch(
      `${import.meta.env.BASE_URL}resources/maps/localidades_bogota_corte.json`,
      { signal: solicitud.signal },
    )
    if (!respuesta.ok) throw new Error('No se pudo cargar el GeoJSON')
    const datos = await respuesta.json()
    if (datos.type !== 'FeatureCollection' || !Array.isArray(datos.features))
      throw new Error('GeoJSON inválido')
    geojson.value = datos
  } catch (err) {
    if (err.name === 'AbortError') return
    console.error(`Error al cargar el mapa de ${props.configuracion.codigo}:`, err)
    error.value =
      'No fue posible cargar el mapa. Puedes consultar los resultados en la tabla adjunta.'
  } finally {
    cargando.value = false
  }
})
onBeforeUnmount(() => {
  desmontado = true
  solicitud.abort()
  observador?.disconnect()
  grafico?.destroy()
  grafico = null
})
</script>

<template>
  <div class="idc-layout">
    <div class="idc-sidebar">
      <div
        class="resumen-bogota"
        :style="{ backgroundColor: bogota?.color ?? COLOR_SIN_DATOS }"
        :title="descripcionColorBogota(bogota)"
      >
        <div>
          <span class="resumen-etiqueta">Referencia de ciudad</span
          ><span class="resumen-nombre">Bogotá D.C.</span>
        </div>
        <div class="resumen-cifra">
          <strong>{{ formatear(bogota?.valor) }}</strong
          ><small>Escala 0–1</small>
        </div>
      </div>
      <IndiceSelector
        :model-value="modelValue"
        :subindices="subindices"
        :configuracion="configuracion"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
    <section class="mapa-panel idc-panel" aria-label="Mapa de resultados por localidad">
      <header class="mapa-cabecera">
        <h2>{{ indice?.nombre }}</h2>
      </header>
      <div class="mapa-cuerpo">
        <div class="mapa-visual">
          <p v-if="cargando" class="mapa-estado" role="status">Cargando mapa...</p>
          <p v-else-if="error" class="text-danger mapa-estado" role="alert">{{ error }}</p>
          <p v-else-if="!hayDatos" class="mapa-estado">
            No hay resultados disponibles para este índice.
          </p>
          <div v-show="!cargando && !error && hayDatos" class="mapa-lienzo">
            <div
              ref="contenedor"
              class="mapa-grafico"
              role="img"
              :aria-label="`Mapa de ${indice?.nombre}. Los valores por localidad están disponibles en la tabla adjunta.`"
            ></div>
          </div>
        </div>
        <section class="mapa-tabla" aria-label="Valores por localidad del mapa">
          <IndiceTablaResultados :filas="filas" :indice="indice" compacta />
        </section>
      </div>
      <footer class="mapa-leyenda" aria-label="Guía de colores del mapa y la tabla">
        <IndiceLeyenda />
        <div class="idc-note">
          <p>
            Escala de 0 a 1. El ancho de las barras representa el valor; los colores del mapa y las
            barras representan el puesto entre las 20 localidades, no niveles de cumplimiento.
          </p>
          <p>
            Bogotá toma el color del puesto que ocuparía frente a las localidades, sin formar parte
            del ranking. Los empates se ordenan por código de localidad.
          </p>
        </div>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.mapa-cuerpo {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(1rem, 2cqi, 1.5rem);
  align-items: stretch;
  margin-top: 1rem;
}
.mapa-visual,
.mapa-tabla {
  min-width: 0;
}
.mapa-visual {
  position: relative;
  min-height: 560px;
}
.mapa-lienzo {
  position: absolute;
  inset: 0;
}
.mapa-leyenda {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--idc-line);
}
.mapa-panel .mapa-leyenda :deep(.leyenda-posiciones.idc-panel) {
  padding: 0;
  border: 0;
  box-shadow: none;
  background: transparent;
}
.mapa-leyenda p:last-child {
  margin-bottom: 0;
}
@container (max-width: 640px) {
  .mapa-cuerpo,
  .mapa-leyenda {
    grid-template-columns: minmax(0, 1fr);
  }
  .mapa-visual {
    min-height: 440px;
  }
}
.resumen-bogota {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid #29253408;
  border-radius: 14px;
  color: var(--idc-ink);
}
.resumen-etiqueta {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}
.resumen-nombre {
  font-size: 0.95rem;
  font-weight: 550;
}
.resumen-cifra {
  text-align: right;
}
.resumen-bogota strong {
  font-size: 1.75rem;
  font-weight: 550;
  letter-spacing: -0.04em;
  color: var(--idc-ink);
  font-variant-numeric: tabular-nums;
}
.resumen-bogota small {
  display: block;
  font-size: 0.6rem;
  margin-top: 0.2rem;
}
.mapa-panel {
  container-type: inline-size;
  min-width: 0;
  padding: clamp(1rem, 2.5vw, 1.4rem);
}
.mapa-cabecera {
  text-align: center;
}
.mapa-cabecera h2 {
  color: var(--idc-ink);
  font-size: 1.1rem;
  line-height: 1.5;
  font-weight: 550;
  letter-spacing: -0.025em;
  margin: 0;
}
.mapa-grafico {
  width: 100%;
  height: 100%;
}
.mapa-estado {
  min-height: 400px;
  display: grid;
  place-items: center;
}
@media (max-width: 767px) {
  .mapa-panel {
    padding: 1rem;
  }
}
</style>
