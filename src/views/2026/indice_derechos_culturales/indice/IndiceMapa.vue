<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'
import IndiceSelector from './IndiceSelector.vue'
import IndiceLeyenda from './IndiceLeyenda.vue'
import { COLOR_SIN_DATOS, crearRanking, descripcionColorBogota } from './ranking.js'

if (typeof HighchartsMap === 'function' && !Highcharts.MapChart) {
  HighchartsMap(Highcharts)
}

const props = defineProps({
  subindices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  valores: { type: Array, required: true },
  modelValue: { type: String, default: 'IDC' },
})
const emit = defineEmits(['update:modelValue'])
const contenedor = ref(null)
const geojson = ref(null)
const cargando = ref(true)
const error = ref('')
const solicitud = new AbortController()
let grafico = null
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
const datosMapa = computed(() =>
  ranking.value.localidades.map((item) => ({ ...item, value: item.valor })),
)
const hayDatos = computed(() => datosMapa.value.some((item) => item.value !== null))

async function dibujarMapa() {
  await nextTick()
  if (desmontado || !geojson.value || !contenedor.value || !hayDatos.value) return
  grafico?.destroy()
  grafico = null
  try {
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
    console.error('Error al dibujar el mapa del IDC:', err)
    error.value =
      'No fue posible mostrar el mapa. Puedes consultar los resultados en la vista Tabla.'
  }
}

watch([datosMapa, geojson], dibujarMapa, { flush: 'post' })
onMounted(async () => {
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
    console.error('Error al cargar el mapa del IDC:', err)
    error.value =
      'No fue posible cargar el mapa. Puedes consultar los resultados en la vista Tabla.'
  } finally {
    cargando.value = false
  }
})
onBeforeUnmount(() => {
  desmontado = true
  solicitud.abort()
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
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
    <section class="mapa-panel idc-panel" aria-label="Mapa de resultados por localidad">
      <header class="mapa-cabecera">
        <span class="idc-eyebrow">{{ modelValue }} · Distribución territorial</span>
        <h2>{{ indice?.nombre }}</h2>
      </header>
      <div class="mapa-cuerpo">
        <div class="mapa-visual">
          <p v-if="cargando" class="mapa-estado" role="status">Cargando mapa...</p>
          <p v-else-if="error" class="text-danger mapa-estado" role="alert">{{ error }}</p>
          <p v-else-if="!hayDatos" class="mapa-estado">
            No hay resultados disponibles para este índice.
          </p>
          <div v-show="!cargando && !error && hayDatos">
            <div
              ref="contenedor"
              class="mapa-grafico"
              role="img"
              :aria-label="`Mapa de ${indice?.nombre}. Los valores por localidad están disponibles en la vista Tabla.`"
            ></div>
          </div>
        </div>
        <aside class="mapa-leyenda" aria-label="Guía de colores del mapa">
          <IndiceLeyenda />
          <p class="idc-note mb-0">
            Bogotá toma el color del puesto que ocuparía frente a las localidades, sin formar parte
            del ranking.
          </p>
        </aside>
      </div>
      <p class="mapa-nota idc-note">
        Valores de 0 a 1. Los colores comparan las localidades para el índice seleccionado; no
        representan niveles de cumplimiento. Los empates se ordenan por código de localidad.
        Consulta los valores completos en la vista Tabla.
      </p>
    </section>
  </div>
</template>

<style scoped>
.mapa-cuerpo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 1rem;
  align-items: start;
}
.mapa-visual {
  min-width: 0;
}
.mapa-leyenda {
  display: grid;
  gap: 0.85rem;
  padding-top: 1rem;
}
@media (max-width: 1000px) {
  .mapa-cuerpo {
    grid-template-columns: minmax(0, 1fr);
  }
  .mapa-leyenda {
    padding-block: 0 1rem;
  }
}
.resumen-bogota {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
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
  min-width: 0;
  padding: 1.5rem;
}
.mapa-cabecera h2 {
  color: var(--idc-ink);
  font-size: 1.1rem;
  line-height: 1.5;
  font-weight: 550;
  letter-spacing: -0.025em;
  margin: 0.4rem 0 0;
}
.mapa-nota {
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--idc-line);
}
.mapa-grafico {
  width: 100%;
  height: 600px;
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
  .mapa-grafico {
    height: 480px;
  }
}
</style>
